const { sharp, generateOutput, getFileResponse } = require("./utils");

const applyFilter = async (req, res) => {
    try {
        const { filter } = req.body;
        const { outputName, outputPath } = generateOutput();

        let image = sharp(req.filePath);

        switch (filter) {
            case "grayscale": image = image.grayscale(); break;
            case "sepia": image = image.recomb([[0.393, 0.769, 0.189], [0.349, 0.686, 0.168], [0.272, 0.534, 0.131]]); break;
            case "invert": image = image.negate(); break;
            case "blur": image = image.blur(3); break;
            case "sharpen": image = image.sharpen(); break;
            case "warm": image = image.modulate({ saturation: 1.2 }).tint({ r: 255, g: 200, b: 150 }); break;
            case "cool": image = image.modulate({ saturation: 1.1 }).tint({ r: 150, g: 200, b: 255 }); break;
            case "vivid": image = image.modulate({ saturation: 1.5, brightness: 1.1 }); break;
        }

        await image.toFile(outputPath);

        res.json({ message: `${filter} applied`, file: await getFileResponse(outputPath, outputName) });
    } catch (error) {
        res.status(500).json({ message: "Filter failed" });
    }
};

module.exports = { applyFilter };
