const sharp = require("sharp");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

const processedDir = path.join(__dirname, "../processed");

const generateOutput = (ext = "jpg") => {
    const outputName = uuidv4() + "." + ext;
    const outputPath = path.join(processedDir, outputName);
    return { outputName, outputPath };
};

const getFileResponse = async (outputPath, outputName) => {
    const metadata = await sharp(outputPath).metadata();
    return {
        filename: outputName,
        path: `/processed/${outputName}`,
        size: fs.statSync(outputPath).size,
        width: metadata.width,
        height: metadata.height
    };
};

module.exports = { sharp, path, fs, processedDir, generateOutput, getFileResponse };
