require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");

const userModel = require("./models/User");

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use("/api/users", userRoutes);

app.get("/", async (req, res) => {
  const data = await userModel.find();
  res.send({ data, message: "data fetched" });
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then((res) => console.log("Connected to MongoDB", res.connection.host))
  .catch((err) => console.error(err));

app.listen(5001, () => console.log("Server running on port 5001"));
