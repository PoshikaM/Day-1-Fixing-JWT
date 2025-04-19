require("dotenv").config();
const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs"); // Not used correctly
const User = require("../models/User");

const router = express.Router();
router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!password || !username) {
      return res.status(404).send("Please send valid credentails...");
    }
    const userPresentOrNot = await User.findOne({ username });
    if (!userPresentOrNot) {
      return res.send("User already present");
    }
    const salt = bcrypt.genSaltSync(10);
    const hashPassword = await bcrypt.hash(password, salt);

    const user = new User({ username, password: hashPassword });
    await user.save();

    return res.json({ message: "User registered successfully", hashPassword });
  } catch (er) {
    console.error("Useranem duplicate key", er);
    return res.status(400).send({ message: er.message });
  };
});


router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username) {
    return res.status(400).send("Send Valid Username");
  }
  if (!password) {
    return res.status(400).send("Send Valid password");
  }
  const user = await User.findOne({ username });

  if (!user) {
    return res.status(400).json({ message: "User not found" }); 
  }

  const comparePassword = await bcrypt.compare(password, user.password);
  console.log(comparePassword);

  if (!comparePassword) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
  res.cookie("access_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV == "production",
    sameSite: true,
  });
  res.json({ token });
});

module.exports = router;