const { sharp, generateOutput, getFileResponse } = require("./utils");

const rotateImage = async (req, res) => {
    try {
        const { angle } = req.body;
        const { outputName, outputPath } = generateOutput();

        await sharp(req.filePath).rotate(angle || 90).toFile(outputPath);

        res.json({ message: "Rotated", file: await getFileResponse(outputPath, outputName) });
    } catch (error) {
        res.status(500).json({ message: "Rotate failed" });
    }
};

module.exports = { rotateImage };
