const mongoose = require('mongoose');

const BoardPostSchema = new mongoose.Schema({
    boardRef: {type: mongoose.Types.ObjectId, ref: 'Board'},
    postRef: {type: mongoose.Types.ObjectId, ref: 'Post'},
}, {timestamps: true});

module.exports = mongoose.model('BoardPost', BoardPostSchema);