const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) return res.status(400).json({ message: "Email and password required" });

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) return res.status(401).json({ message: "Invalid email or password" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: "Invalid email or password" });

        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "7d" });

        res.json({
            message: "Login successful",
            token,
            user: { id: user._id, name: user.name, email: user.email }
        });
    } catch (error) {
        res.status(500).json({ message: "Error logging in" });
    }
};

module.exports = { login };
