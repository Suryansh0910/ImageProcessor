const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

const verifyToken = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith("Bearer ")) return res.status(401).json({ message: "No token" });

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.userId).select("-password");

        if (!user) return res.status(404).json({ message: "User not found" });

        res.json({ user });
    } catch (error) {
        res.status(401).json({ message: "Invalid token" });
    }
};

module.exports = { verifyToken };
