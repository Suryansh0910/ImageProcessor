const sharp = require("sharp");
const path = require("path");
const fs = require("fs");
const Image = require("../models/Image");

const galleryDir = path.join(__dirname, "../gallery");
const FREE_LIMIT = 3;

const getGalleryCount = async (req, res) => {
    try {
        const count = await Image.countDocuments({ userId: req.params.userId });
        res.json({ count, limit: FREE_LIMIT });
    } catch (error) {
        res.status(500).json({ message: "Error" });
    }
};

const getGalleryImages = async (req, res) => {
    try {
        const images = await Image.find({ userId: req.params.userId }).sort({ createdAt: -1 });
        res.json({ images, count: images.length });
    } catch (error) {
        res.status(500).json({ message: "Error" });
    }
};

const saveToGallery = async (req, res) => {
    try {
        const { userId, originalName } = req.body;
        if (!userId) return res.status(400).json({ message: "User ID required" });

        const count = await Image.countDocuments({ userId });
        if (count >= FREE_LIMIT) return res.status(403).json({ message: "Save limit reached" });

        const galleryFilename = `${userId}_${Date.now()}_${req.params.filename}`;
        fs.copyFileSync(req.processedFilePath, path.join(galleryDir, galleryFilename));

        const metadata = await sharp(req.processedFilePath).metadata();
        const image = new Image({
            userId,
            filename: galleryFilename,
            originalName: originalName || req.params.filename,
            path: `/gallery/${galleryFilename}`,
            size: fs.statSync(req.processedFilePath).size,
            width: metadata.width,
            height: metadata.height
        });
        await image.save();

        res.json({ message: "Saved", image, count: count + 1 });
    } catch (error) {
        res.status(500).json({ message: "Save failed" });
    }
};

const deleteFromGallery = async (req, res) => {
    try {
        const image = await Image.findById(req.params.imageId);
        if (!image) return res.status(404).json({ message: "Not found" });

        const filePath = path.join(__dirname, "..", image.path);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

        await Image.findByIdAndDelete(req.params.imageId);
        const count = await Image.countDocuments({ userId: image.userId });

        res.json({ message: "Deleted", count });
    } catch (error) {
        res.status(500).json({ message: "Delete failed" });
    }
};

const getPublicImage = async (req, res) => {
    try {
        const image = await Image.findById(req.params.imageId);
        if (!image) return res.status(404).json({ message: "Not found" });

        const filePath = path.join(__dirname, "..", image.path);
        if (fs.existsSync(filePath)) res.sendFile(filePath);
        else res.status(404).json({ message: "File not found" });
    } catch (error) {
        res.status(500).json({ message: "Error" });
    }
};

module.exports = { getGalleryCount, getGalleryImages, saveToGallery, deleteFromGallery, getPublicImage };
