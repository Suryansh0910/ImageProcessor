const sharp = require("sharp");

const uploadImage = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: "No file uploaded" });

        const metadata = await sharp(req.file.path).metadata();
        res.json({
            message: "Upload successful",
            file: {
                filename: req.file.filename,
                path: `/uploads/${req.file.filename}`,
                size: req.file.size,
                width: metadata.width,
                height: metadata.height
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Upload failed" });
    }
};

module.exports = { uploadImage };
