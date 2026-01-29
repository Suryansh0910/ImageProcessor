const path = require("path");
const fs = require("fs");

const uploadsDir = path.join(__dirname, "../uploads");
const processedDir = path.join(__dirname, "../processed");

const getUploadedFile = (req, res) => {
    const filePath = path.join(uploadsDir, req.params.filename);
    if (fs.existsSync(filePath)) res.sendFile(filePath);
    else res.status(404).json({ message: "Not found" });
};

const getProcessedFile = (req, res) => {
    const filePath = path.join(processedDir, req.params.filename);
    if (fs.existsSync(filePath)) res.sendFile(filePath);
    else res.status(404).json({ message: "Not found" });
};

module.exports = { getUploadedFile, getProcessedFile };
