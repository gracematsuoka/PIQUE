const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
    title: String,
    description: String,
    canvasJSON: mongoose.Schema.Types.Mixed,
    userRef: {type: mongoose.Types.ObjectId, ref: 'User'},
    postURL: String,
    likes: Number,
    visibility: String
}, { timestamps: true });

module.exports = mongoose.model('Post', PostSchema);