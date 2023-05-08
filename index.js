const express = require("express");
const cors = require("cors");
// const mongoose = require("mongoose");
// const register = require("./routes/register");
// const login = require("./routes/login");
// const orders = require("./routes/orders");
const stripe = require("./routes/stripe");
// const test = require("./routes/test");
// const productsRoute = require("./routes/products");

// const products = require("./products");

const app = express();

require("dotenv").config();

app.use(
  "/api/stripe/webhook",
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf.toString();
    },
  })
);

app.use(express.json());
app.use(cors());
// app.use(cors({
//   origin: 'https://capstone-project-transtation.vercel.app/'
// }));
app.use(
  cors({
    origin: 'http://localhost:5000', // <-- location of the react app were connecting to
  })
);
app.use("/api/stripe", stripe);
// app.use("/api/test", test);

app.get("/", (req, res) => {
  res.send("Welcome to Capstone checkout APIs...");
});

// const uri = process.env.DB_URI;
const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Server running on port: ${port}...`);
});

// mongoose
//   .connect(uri, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   })
//   .then(() => console.log("MongoDB connection established..."))
//   .catch((error) => console.error("MongoDB connection failed:", error.message));
