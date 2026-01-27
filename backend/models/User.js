const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 50
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Don't return password in queries
userSchema.set("toJSON", {
    transform: (doc, ret) => {
        delete ret.password;
        delete ret.__v;
        ret.id = ret._id;
        delete ret._id;
        return ret;
    }
});

module.exports = mongoose.model("User", userSchema);
