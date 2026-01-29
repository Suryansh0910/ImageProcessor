const { sharp, generateOutput, getFileResponse } = require("./utils");

const removeBackground = async (req, res) => {
    try {
        const { tolerance = 40 } = req.body;
        const { outputName, outputPath } = generateOutput("png");

        const { data, info } = await sharp(req.filePath).raw().ensureAlpha().toBuffer({ resolveWithObject: true });
        const { width, height } = info;

        const getPixel = (x, y) => {
            const i = (y * width + x) * 4;
            return { r: data[i], g: data[i + 1], b: data[i + 2] };
        };
        const bgColor = getPixel(0, 0);

        for (let i = 0; i < data.length; i += 4) {
            const r = data[i], g = data[i + 1], b = data[i + 2];
            if (Math.abs(r - bgColor.r) <= tolerance && Math.abs(g - bgColor.g) <= tolerance && Math.abs(b - bgColor.b) <= tolerance) {
                data[i + 3] = 0;
            }
        }

        await sharp(data, { raw: { width, height, channels: 4 } }).png().toFile(outputPath);

        res.json({ message: "Background removed", file: await getFileResponse(outputPath, outputName) });
    } catch (error) {
        res.status(500).json({ message: "Remove background failed" });
    }
};

module.exports = { removeBackground };
