const express = require("express");
const multer = require("multer");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

const router = express.Router();


const uploadsDir = path.join(__dirname, "../uploads");
const processedDir = path.join(__dirname, "../processed");
const galleryDir = path.join(__dirname, "../gallery");


[uploadsDir, processedDir, galleryDir].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});


const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDir),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, uuidv4() + ext);
    }
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });



router.post("/upload", upload.single("image"), async (req, res) => {
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
});



router.post("/resize/:filename", async (req, res) => {
    try {
        const filePath = path.join(uploadsDir, req.params.filename);
        if (!fs.existsSync(filePath)) return res.status(404).json({ message: "File not found" });

        const { width, height } = req.body;
        const outputName = uuidv4() + ".jpg";
        const outputPath = path.join(processedDir, outputName);

        await sharp(filePath).resize(width || null, height || null).toFile(outputPath);
        const metadata = await sharp(outputPath).metadata();

        res.json({
            message: "Resized",
            file: { filename: outputName, path: `/processed/${outputName}`, size: fs.statSync(outputPath).size, width: metadata.width, height: metadata.height }
        });
    } catch (error) {
        res.status(500).json({ message: "Resize failed" });
    }
});



router.post("/crop/:filename", async (req, res) => {
    try {
        const filePath = path.join(uploadsDir, req.params.filename);
        if (!fs.existsSync(filePath)) return res.status(404).json({ message: "File not found" });

        const { left, top, width, height } = req.body;
        const outputName = uuidv4() + ".jpg";
        const outputPath = path.join(processedDir, outputName);

        await sharp(filePath).extract({ left: left || 0, top: top || 0, width, height }).toFile(outputPath);
        const metadata = await sharp(outputPath).metadata();

        res.json({
            message: "Cropped",
            file: { filename: outputName, path: `/processed/${outputName}`, size: fs.statSync(outputPath).size, width: metadata.width, height: metadata.height }
        });
    } catch (error) {
        res.status(500).json({ message: "Crop failed" });
    }
});



router.post("/rotate/:filename", async (req, res) => {
    try {
        const filePath = path.join(uploadsDir, req.params.filename);
        if (!fs.existsSync(filePath)) return res.status(404).json({ message: "File not found" });

        const { angle } = req.body;
        const outputName = uuidv4() + ".jpg";
        const outputPath = path.join(processedDir, outputName);

        await sharp(filePath).rotate(angle || 90).toFile(outputPath);
        const metadata = await sharp(outputPath).metadata();

        res.json({
            message: "Rotated",
            file: { filename: outputName, path: `/processed/${outputName}`, size: fs.statSync(outputPath).size, width: metadata.width, height: metadata.height }
        });
    } catch (error) {
        res.status(500).json({ message: "Rotate failed" });
    }
});



router.post("/filter/:filename", async (req, res) => {
    try {
        const filePath = path.join(uploadsDir, req.params.filename);
        if (!fs.existsSync(filePath)) return res.status(404).json({ message: "File not found" });

        const { filter } = req.body;
        const outputName = uuidv4() + ".jpg";
        const outputPath = path.join(processedDir, outputName);

        let image = sharp(filePath);


        switch (filter) {
            case "grayscale": image = image.grayscale(); break;
            case "sepia": image = image.recomb([[0.393, 0.769, 0.189], [0.349, 0.686, 0.168], [0.272, 0.534, 0.131]]); break;
            case "invert": image = image.negate(); break;
            case "blur": image = image.blur(3); break;
            case "sharpen": image = image.sharpen(); break;
            case "warm": image = image.modulate({ saturation: 1.2 }).tint({ r: 255, g: 200, b: 150 }); break;
            case "cool": image = image.modulate({ saturation: 1.1 }).tint({ r: 150, g: 200, b: 255 }); break;
            case "vivid": image = image.modulate({ saturation: 1.5, brightness: 1.1 }); break;
        }

        await image.toFile(outputPath);
        const metadata = await sharp(outputPath).metadata();

        res.json({
            message: `${filter} applied`,
            file: { filename: outputName, path: `/processed/${outputName}`, size: fs.statSync(outputPath).size, width: metadata.width, height: metadata.height }
        });
    } catch (error) {
        res.status(500).json({ message: "Filter failed" });
    }
});



router.post("/adjust/:filename", async (req, res) => {
    try {
        const filePath = path.join(uploadsDir, req.params.filename);
        if (!fs.existsSync(filePath)) return res.status(404).json({ message: "File not found" });

        const { brightness = 1, saturation = 1, hue = 0, lightness = 0 } = req.body;
        const outputName = uuidv4() + ".jpg";
        const outputPath = path.join(processedDir, outputName);

        await sharp(filePath)
            .modulate({
                brightness: parseFloat(brightness),
                saturation: parseFloat(saturation),
                hue: parseInt(hue) || 0,
                lightness: parseFloat(lightness) || 0
            })
            .toFile(outputPath);

        const metadata = await sharp(outputPath).metadata();

        res.json({
            message: "Adjustments applied",
            file: { filename: outputName, path: `/processed/${outputName}`, size: fs.statSync(outputPath).size, width: metadata.width, height: metadata.height }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Adjustment failed" });
    }
});



router.post("/convert/:filename", async (req, res) => {
    try {
        const filePath = path.join(uploadsDir, req.params.filename);
        if (!fs.existsSync(filePath)) return res.status(404).json({ message: "File not found" });

        const { format, quality } = req.body;
        const ext = format === "jpeg" ? "jpg" : format;
        const outputName = uuidv4() + "." + ext;
        const outputPath = path.join(processedDir, outputName);

        let image = sharp(filePath);
        if (format === "jpeg") image = image.jpeg({ quality: quality || 80 });
        else if (format === "png") image = image.png();
        else if (format === "webp") image = image.webp({ quality: quality || 80 });

        await image.toFile(outputPath);
        const metadata = await sharp(outputPath).metadata();

        res.json({
            message: `Converted to ${format}`,
            file: { filename: outputName, path: `/processed/${outputName}`, size: fs.statSync(outputPath).size, width: metadata.width, height: metadata.height }
        });
    } catch (error) {
        res.status(500).json({ message: "Convert failed" });
    }
});



router.post("/remove-bg/:filename", async (req, res) => {
    try {
        const filePath = path.join(uploadsDir, req.params.filename);
        if (!fs.existsSync(filePath)) return res.status(404).json({ message: "File not found" });

        const { tolerance = 40 } = req.body;
        const outputName = uuidv4() + ".png";
        const outputPath = path.join(processedDir, outputName);

        const { data, info } = await sharp(filePath).raw().ensureAlpha().toBuffer({ resolveWithObject: true });
        const { width, height } = info;


        const getPixel = (x, y) => {
            const i = (y * width + x) * 4;
            return { r: data[i], g: data[i + 1], b: data[i + 2] };
        };
        const bgColor = getPixel(0, 0);


        for (let i = 0; i < data.length; i += 4) {
            const r = data[i], g = data[i + 1], b = data[i + 2];
            if (Math.abs(r - bgColor.r) <= tolerance && Math.abs(g - bgColor.g) <= tolerance && Math.abs(b - bgColor.b) <= tolerance) {
                data[i + 3] = 0; // Make transparent
            }
        }

        await sharp(data, { raw: { width, height, channels: 4 } }).png().toFile(outputPath);
        const metadata = await sharp(outputPath).metadata();

        res.json({
            message: "Background removed",
            file: { filename: outputName, path: `/processed/${outputName}`, size: fs.statSync(outputPath).size, width: metadata.width, height: metadata.height }
        });
    } catch (error) {
        res.status(500).json({ message: "Remove background failed" });
    }
});



router.get("/uploads/:filename", (req, res) => {
    const filePath = path.join(uploadsDir, req.params.filename);
    if (fs.existsSync(filePath)) res.sendFile(filePath);
    else res.status(404).json({ message: "Not found" });
});

router.get("/processed/:filename", (req, res) => {
    const filePath = path.join(processedDir, req.params.filename);
    if (fs.existsSync(filePath)) res.sendFile(filePath);
    else res.status(404).json({ message: "Not found" });
});



const Image = require("../models/Image");
const FREE_LIMIT = 3;

router.get("/gallery/count/:userId", async (req, res) => {
    try {
        const count = await Image.countDocuments({ userId: req.params.userId });
        res.json({ count, limit: FREE_LIMIT });
    } catch (error) {
        res.status(500).json({ message: "Error" });
    }
});

router.get("/gallery/:userId", async (req, res) => {
    try {
        const images = await Image.find({ userId: req.params.userId }).sort({ createdAt: -1 });
        res.json({ images, count: images.length });
    } catch (error) {
        res.status(500).json({ message: "Error" });
    }
});

router.post("/save/:filename", async (req, res) => {
    try {
        const { userId, originalName } = req.body;
        if (!userId) return res.status(400).json({ message: "User ID required" });

        const count = await Image.countDocuments({ userId });
        if (count >= FREE_LIMIT) return res.status(403).json({ message: "Save limit reached" });

        const processedPath = path.join(processedDir, req.params.filename);
        if (!fs.existsSync(processedPath)) return res.status(404).json({ message: "File not found" });


        const galleryFilename = `${userId}_${Date.now()}_${req.params.filename}`;
        fs.copyFileSync(processedPath, path.join(galleryDir, galleryFilename));


        const metadata = await sharp(processedPath).metadata();
        const image = new Image({
            userId,
            filename: galleryFilename,
            originalName: originalName || req.params.filename,
            path: `/gallery/${galleryFilename}`,
            size: fs.statSync(processedPath).size,
            width: metadata.width,
            height: metadata.height
        });
        await image.save();

        res.json({ message: "Saved", image, count: count + 1 });
    } catch (error) {
        res.status(500).json({ message: "Save failed" });
    }
});

router.delete("/gallery/:imageId", async (req, res) => {
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
});



router.get("/public/:imageId", async (req, res) => {
    try {
        const image = await Image.findById(req.params.imageId);
        if (!image) return res.status(404).json({ message: "Not found" });

        const filePath = path.join(__dirname, "..", image.path);
        if (fs.existsSync(filePath)) res.sendFile(filePath);
        else res.status(404).json({ message: "File not found" });
    } catch (error) {
        res.status(500).json({ message: "Error" });
    }
});

module.exports = router;
