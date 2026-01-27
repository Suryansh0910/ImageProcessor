const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    originalName: {
        type: String,
        required: true
    },
    filename: {
        type: String,
        required: true
    },
    path: {
        type: String,
        required: true
    },
    size: {
        type: Number,
        required: true
    },
    width: Number,
    height: Number,
    format: String,
    type: {
        type: String,
        enum: ["upload", "processed"],
        default: "upload"
    },
    originalImage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Image"
    },
    operation: String, // resize, filter, compress, etc.
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for fast user queries
imageSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("Image", imageSchema);
