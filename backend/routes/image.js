const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

const { uploadImage } = require("../controllers/upload");
const { resizeImage } = require("../controllers/resize");
const { cropImage } = require("../controllers/crop");
const { rotateImage } = require("../controllers/rotate");
const { applyFilter } = require("../controllers/filter");
const { adjustImage } = require("../controllers/adjust");
const { convertFormat } = require("../controllers/convert");
const { removeBackground } = require("../controllers/removeBg");
const { getUploadedFile, getProcessedFile } = require("../controllers/file");
const { getGalleryCount, getGalleryImages, saveToGallery, deleteFromGallery, getPublicImage } = require("../controllers/gallery");
const { checkFileExists, checkProcessedFileExists } = require("../controllers/fileCheck");

const router = express.Router();

const uploadsDir = path.join(__dirname, "../uploads");
const processedDir = path.join(__dirname, "../processed");
const galleryDir = path.join(__dirname, "../gallery");

[uploadsDir, processedDir, galleryDir].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDir),
    filename: (req, file, cb) => cb(null, uuidv4() + path.extname(file.originalname).toLowerCase())
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

router.post("/upload", upload.single("image"), uploadImage);

router.post("/resize/:filename", checkFileExists, resizeImage);
router.post("/crop/:filename", checkFileExists, cropImage);
router.post("/rotate/:filename", checkFileExists, rotateImage);
router.post("/filter/:filename", checkFileExists, applyFilter);
router.post("/adjust/:filename", checkFileExists, adjustImage);
router.post("/convert/:filename", checkFileExists, convertFormat);
router.post("/remove-bg/:filename", checkFileExists, removeBackground);

router.get("/uploads/:filename", getUploadedFile);
router.get("/processed/:filename", getProcessedFile);

router.get("/gallery/count/:userId", getGalleryCount);
router.get("/gallery/:userId", getGalleryImages);
router.post("/save/:filename", checkProcessedFileExists, saveToGallery);
router.delete("/gallery/:imageId", deleteFromGallery);
router.get("/public/:imageId", getPublicImage);

module.exports = router;
