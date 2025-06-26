const mongoose = require('mongoose');

const Like = new mongoose.Schema({
    postId: mongoose.Types.ObjectId,
    userId: mongoose.Types.ObjectId,
}, {timestamps: true});

module.exports = mongoose.model('Like', Like);