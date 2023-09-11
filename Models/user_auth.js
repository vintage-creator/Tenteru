const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    googleId: String,
    displayName: String,
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
    },
    role: {
        type: String,
        default: "user",
    }
});

module.exports = mongoose.model('User', userSchema);
