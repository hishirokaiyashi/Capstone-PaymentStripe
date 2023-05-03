const express = require("express");
const nodemailer = require("nodemailer");

require("dotenv").config();

const router = express.Router();

router.post("/sendemail", async (req, res) => {
  try {
    // Send email to user
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      secureConnection: false,
      port: 587,
      tls: {
        rejectUnauthorized: false,
      },
      requireTLS: true, //this parameter solved problem for me
      auth: {
        user: "ngocgiaondc@gmail.com",
        pass: "glxaafptihsjpyol",
        // glxaafptihsjpyol
      },
    });

    const mailOptions = {
      from: "ngocgiaondc@gmail.com",
      to: "hishirokaiyashi@gmail.com",
      subject: "[Capstone Vietnam] Order Successfully! 🎉🎉🎉",
      html: `
             <p>Thank you for believing in using Capstone Transition Booking. Here is some information about your order:</p>
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
      message: "Successful email sent",
      received: true,
    });
  } catch (error) {
    console.error("Sending email..." + err);
    res.status(500).end();
  }
});

module.exports = router;
