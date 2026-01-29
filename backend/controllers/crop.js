const { sharp, generateOutput, getFileResponse } = require("./utils");

const cropImage = async (req, res) => {
    try {
        const { left, top, width, height } = req.body;
        const { outputName, outputPath } = generateOutput();

        await sharp(req.filePath).extract({ left: left || 0, top: top || 0, width, height }).toFile(outputPath);

        res.json({ message: "Cropped", file: await getFileResponse(outputPath, outputName) });
    } catch (error) {
        res.status(500).json({ message: "Crop failed" });
    }
};

module.exports = { cropImage };
