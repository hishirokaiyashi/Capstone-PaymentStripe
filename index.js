const express = require("express");
const cors = require("cors");
const stripe = require("./routes/stripe");

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

// app.use(
//   cors({
//     origin: 'https://capstone-project-transtation.vercel.app', // <-- location of the react app were connecting to
//   })
// );

app.use("/api/stripe", stripe);

app.get("/", (req, res) => {
  res.send("Welcome to Capstone checkout APIs...");
});

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Server running on port: ${port}...`);
});
