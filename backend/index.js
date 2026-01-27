require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const cleanupOldFiles = () => {
    const folders = ["uploads", "processed"];
    const maxAge = 5 * 60 * 1000;

    folders.forEach(folder => {
        const dir = path.join(__dirname, folder);
        if (!fs.existsSync(dir)) return;

        try {
            fs.readdirSync(dir).forEach(file => {
                const filePath = path.join(dir, file);
                try {
                    const stats = fs.statSync(filePath);
                    if (Date.now() - stats.mtimeMs > maxAge) {
                        fs.unlinkSync(filePath);
                    }
                } catch (err) { }
            });
        } catch (err) { }
    });
};

setInterval(cleanupOldFiles, 5 * 60 * 1000);
cleanupOldFiles();

const authRoutes = require("./routes/auth");
const imageRoutes = require("./routes/image");

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));

["uploads", "processed", "gallery"].forEach(folder => {
    const dir = path.join(__dirname, folder);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

app.use("/api/auth", authRoutes);
app.use("/api/image", imageRoutes);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/processed", express.static(path.join(__dirname, "processed")));
app.use("/gallery", express.static(path.join(__dirname, "gallery")));

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGODB_URI;

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log("Connected to MongoDB");
        app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
    })
    .catch(err => console.error("MongoDB connection error:", err));