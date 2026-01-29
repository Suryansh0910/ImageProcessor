const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

const signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) return res.status(400).json({ message: "All fields are required" });
        if (password.length < 8) return res.status(400).json({ message: "Password must be at least 8 characters" });

        const exists = await User.findOne({ email: email.toLowerCase() });
        if (exists) return res.status(400).json({ message: "Email already registered" });

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
        res.status(500).json({ message: "Error creating account" });
    }
};

module.exports = { signup };
