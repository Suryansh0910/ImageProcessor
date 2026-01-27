const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

router.post("/signup", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }
        if (password.length < 8) {
            return res.status(400).json({ message: "Password must be at least 8 characters" });
        }

        const exists = await User.findOne({ email: email.toLowerCase() });
        if (exists) {
            return res.status(400).json({ message: "Email already registered" });
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const user = new User({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password: hashedPassword
        });
        await user.save();

        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "7d" });

        res.status(201).json({
            message: "Account created",
            token,
            user: { id: user._id, name: user.name, email: user.email }
        });
    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({ message: "Error creating account" });
    }
});

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password required" });
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "7d" });

        res.json({
            message: "Login successful",
            token,
            user: { id: user._id, name: user.name, email: user.email }
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Error logging in" });
    }
});

router.get("/verify", async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith("Bearer ")) {
            return res.status(401).json({ message: "No token" });
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.userId).select("-password");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({ user });
    } catch (error) {
        res.status(401).json({ message: "Invalid token" });
    }
});

module.exports = router;
