const { sharp, generateOutput, getFileResponse } = require("./utils");

const adjustImage = async (req, res) => {
    try {
        const { brightness = 1, saturation = 1 } = req.body;
        const { outputName, outputPath } = generateOutput();

        await sharp(req.filePath)
            .modulate({ brightness: parseFloat(brightness), saturation: parseFloat(saturation) })
            .toFile(outputPath);

        res.json({ message: "Adjustments applied", file: await getFileResponse(outputPath, outputName) });
    } catch (error) {
        res.status(500).json({ message: "Adjustment failed" });
    }
};

module.exports = { adjustImage };
