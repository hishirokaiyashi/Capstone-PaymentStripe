const express = require("express");
const Stripe = require("stripe");
const admin = require("../config/firebase-config");
const qrCode = require("qrcode");
const sharp = require("sharp");
const nodemailer = require("nodemailer");

require("dotenv").config();

const stripe = Stripe(process.env.STRIPE_KEY);

const router = express.Router();

router.post("/create-checkout-session", async (req, res) => {
  const customer = await stripe.customers.create({
    metadata: {
      userId: req.body.user_id,
      order: JSON.stringify(req.body.order),
    },
  });

  // Get trip id to navigate after checkout
  let orderId;

  const line_items = req.body.order.map((item) => {
    orderId = item.booking_id;
    return {
      price_data: {
        currency: "usd",
        product_data: {
          name: item.name,
          images: [item.image],
          description: `Seats: ${item.description.join(", ")}`,
          metadata: {
            id: item.booking_id,
          },
        },
        unit_amount: parseInt(item.ticketPrice * 100),
      },
      quantity: item.quanity,
    };
  });

  const now = Math.floor(Date.now() / 1000);
  const fiveMinutesFromNow = now + 30 * 60; // timestamp for 5 minutes from now

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    phone_number_collection: {
      enabled: true,
    },
    line_items,
    mode: "payment",
    customer: customer.id,
    success_url: `${process.env.CLIENT_URL}/checkout-success?orderId=${orderId}`,
    cancel_url: `${process.env.CLIENT_URL}/`,
    expires_at: fiveMinutesFromNow,
  });

  res.send({ url: session.url });
});

// Edit order function
const editOrder = async (customer, data, res) => {
  try {
    const order = JSON.parse(customer.metadata.order)[0];
    const orderId = order.booking_id;
    const orderRef = admin.firestore().collection("orders").doc(orderId);
    const tickets = order.description;

    // Generate QR code
    const qrData = { orderId, tickets };

    const qrOptions = {
      type: "image/png",
      width: 500,
      errorCorrectionLevel: "H",
      quality: 1,
    };

    const qrCodeBuffer = await qrCode.toBuffer(
      JSON.stringify(qrData),
      qrOptions
    );

    // Resize logo
    const logoBuffer = await admin
      .storage()
      .bucket()
      .file("images/Capstone.png")
      .download();
    const logo = await sharp(logoBuffer[0]).resize(200, 200).toBuffer();

    // Add logo to QR code
    const qrCodeWithLogoBuffer = await sharp(qrCodeBuffer)
      .composite([{ input: logo, gravity: "center" }])
      .toBuffer();

    // Upload QR code to Firebase Storage
    const qrCodeFilePath = `images/qrcode-${orderId}.png`;
    const file = admin.storage().bucket().file(qrCodeFilePath);
    await file.save(qrCodeWithLogoBuffer, { contentType: "image/png" });

    // Get URL of uploaded QR code
    const qrCodeUrl = await file.getSignedUrl({
      action: "read",
      expires: "03-09-2491",
    });

    // Update order document with QR code URL
    await orderRef.update({
      paymentStatus: "Paid",
      paidTime: admin.firestore.FieldValue.serverTimestamp(),
      paymentMethod: data.payment_method_types[0],
      totalPrice: order.totalPrice,
      qrCode: qrCodeUrl,
    });

    // Send email to user
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      secureConnection: false,
      port: 587,
      tls: {
        rejectUnauthorized: false,
      },
      requireTLS: true,
      auth: {
        user: process.env.SMTP_MAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.SMTP_MAIL,
      to: order.email,
      subject: "[Capstone Vietnam] Order Successfully! 🎉🎉🎉",
      html: `<p>Hello <span style="font-weight: 600;">${order.displayName},</span></p>
             <p>Thank you for believing in using Capstone Transition Booking. Here is some information about your order:</p>
             <img src="${order.image}" alt="order-image" style="width: 200px; height: 200px; border-radius: 10px;"/>
             <p><span style="font-weight: 600;">Tickets:</span> ${order.description}</p>
             <p><span style="font-weight: 600;">Ticket Price: </span> ${order.ticketPrice}</p>
             <p><span style="font-weight: 600;">Total Payment: </span> ${order.totalPrice}</p>
             <p><span style="font-weight: 600;">Order ID:</span> ${orderId}</p>
             <p>QR Code:</p>
             <img src="${qrCodeUrl}" alt="qrcode" style="width: 200px; height: 200px; border-radius: 10px;"/>
             <p>Thank you for your purchase. We hope to see you again soon!</p>`,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });

    res.json({
      message: "Successful payment",
      received: true,
      orderId: orderId,
      order: customer.metadata.order,
      qrCodeUrl: qrCodeUrl,
    });
  } catch (err) {
    console.error("Creating order..." + err);
    res.status(500).end();
  }
};

const deleteOrder = async (customer, data, res) => {
  try {
    const order = JSON.parse(customer.metadata.order)[0];
    const orderId = order.booking_id;

    // Delete order
    const orderRef = admin.firestore().collection("orders").doc(orderId);
    await orderRef.delete();

    // Change the seats to original
    const tripRef = admin.firestore().collection("trips").doc(order.trip_id);
    const tripSnapshot = await tripRef.get();
    const numSeats = order.quanity;

    if (tripSnapshot.exists) {
      const tripData = tripSnapshot.data();
      const { availableSeats } = tripData;

      await tripRef.update({
        availableSeats: availableSeats + numSeats,
      });
    } else {
      console.error("Deleting order...Trip not found.");
      return res.status(500).end();
    }

    // Change the status of the order seats to "Available"
    const tickets = order.description;
    const batch = admin.firestore().batch();

    tickets.forEach((ticketId) => {
      // Reference to the document to update
      const seatRef = admin
        .firestore()
        .collection("trips")
        .doc(order.trip_id)
        .collection("SEATS")
        .doc(ticketId);

      batch.update(seatRef, {
        status: "Available",
        user_id: null,
        order_id: null,
      });
    });

    // Commit the batched write
    await batch
      .commit()
      .then(() => {
        console.log("Deleting order...Seats updated successfully.");
      })
      .catch((error) => {
        console.error("Deleting order...Error updating seats: ", error);
      });

    res.json({
      received: true,
      message: "Cancelled payment",
      orderId: orderId,
      order: customer.metadata.order,
    });
  } catch (error) {
    console.error("Deleting order...Error updating seats: ", error);
    res.status(500).end();
  }
};

// Stripe webhoook to catch the status of the order payment
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    let data;
    let eventType;

    // Check if webhook signing is configured.
    let webhookSecret = process.env.STRIPE_WEB_HOOK;

    if (webhookSecret) {
      // Retrieve the event by verifying the signature using the raw body and secret.
      let event;
      let signature = req.headers["stripe-signature"];

      try {
        event = stripe.webhooks.constructEvent(
          req.rawBody,
          signature,
          webhookSecret
        );
      } catch (err) {
        console.log(`⚠️  Webhook signature verification failed: ${err}`);
        res.status(400).send(`Webhook Error: ${err.message}`);
        return;
      }

      // Extract the object from the event.
      data = event.data.object;
      eventType = event.type;
    } else {
      // Webhook signing is recommended, but if the secret is not configured in `config.js`,
      // retrieve the event data directly from the request body.
      data = req.body.data.object;
      eventType = req.body.type;
    }

    console.log("Tình trạng của checkout hiện tại: ", eventType);

    // Handle the checkout.session.completed event
    if (eventType === "checkout.session.completed") {
      stripe.customers
        .retrieve(data.customer)
        .then(async (customer) => {
          try {
            // Create order
            editOrder(customer, data, res);
          } catch (err) {
            console.log(err);
          }
        })
        .catch((err) => {
          console.log(err.message);
          res.status(400).send(`Firebase error: ${err.message}`);
        });
    }

    // Handle the checkout.session.expired event
    if (eventType === "checkout.session.expired") {
      stripe.customers
        .retrieve(data.customer)
        .then(async (customer) => {
          try {
            // Delete order
            deleteOrder(customer, data, res);
          } catch (err) {
            console.log(err.message);
            res.status(400).send(`Firebase error: ${err.message}`);
          }
        })
        .catch((err) => console.log(err.message));
    }

    // res.status(200).end();
  }
);

module.exports = router;
