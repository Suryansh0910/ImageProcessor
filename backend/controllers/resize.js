const { sharp, generateOutput, getFileResponse } = require("./utils");

const resizeImage = async (req, res) => {
    try {
        const { width, height } = req.body;
        const { outputName, outputPath } = generateOutput();

        await sharp(req.filePath).resize(width || null, height || null).toFile(outputPath);

        res.json({ message: "Resized", file: await getFileResponse(outputPath, outputName) });
    } catch (error) {
        res.status(500).json({ message: "Resize failed" });
    }
};

module.exports = { resizeImage };
