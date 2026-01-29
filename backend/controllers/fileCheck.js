const path = require("path");
const fs = require("fs");

const uploadsDir = path.join(__dirname, "../uploads");
const processedDir = path.join(__dirname, "../processed");

const checkFileExists = (req, res, next) => {
    const filePath = path.join(uploadsDir, req.params.filename);
    if (!fs.existsSync(filePath)) return res.status(404).json({ message: "File not found" });
    req.filePath = filePath;
    next();
};

const checkProcessedFileExists = (req, res, next) => {
    const filePath = path.join(processedDir, req.params.filename);
    if (!fs.existsSync(filePath)) return res.status(404).json({ message: "File not found" });
    req.processedFilePath = filePath;
    next();
};

module.exports = { checkFileExists, checkProcessedFileExists };
