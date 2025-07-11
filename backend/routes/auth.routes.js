import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { verifyToken, requireAdmin } from "../middleware/auth.middleware.js";

const router = express.Router();
dotenv.config();

// @route   POST /api/register
// @desc    Register a new user
router.post("/register", async (req, res) => {
  const { fullName, email, password } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already in use" });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
    });

    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// @route   POST /api/login
// @desc    Login user and return JWT token
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // 2. Compare submitted password with hashed one
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // 3. Create a JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7h" }
    );

    // 4. Return token and user info
    res.json({
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/dashboard", verifyToken, (req, res) => {
  res.json({
    message: `Welcome, user ${req.user.userId}`,
    role: req.user.role,
  });
});

// router.post("/upload", verifyToken, requireAdmin, (req, res) => {
//   res.json({ message: "Upload successful!" });
// });

export default router;
