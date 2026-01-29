const { sharp, generateOutput, getFileResponse } = require("./utils");

const convertFormat = async (req, res) => {
    try {
        const { format, quality } = req.body;
        const ext = format === "jpeg" ? "jpg" : format;
        const { outputName, outputPath } = generateOutput(ext);

        let image = sharp(req.filePath);
        if (format === "jpeg") image = image.jpeg({ quality: quality || 80 });
        else if (format === "png") image = image.png();
        else if (format === "webp") image = image.webp({ quality: quality || 80 });

        await image.toFile(outputPath);

        res.json({ message: `Converted to ${format}`, file: await getFileResponse(outputPath, outputName) });
    } catch (error) {
        res.status(500).json({ message: "Convert failed" });
    }
};

module.exports = { convertFormat };
