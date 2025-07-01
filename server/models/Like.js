const mongoose = require('mongoose');

const Like = new mongoose.Schema({
    postRef: {type: mongoose.Types.ObjectId, ref: 'Post'},
    userRef: {type: mongoose.Types.ObjectId, ref: 'User'},
}, {timestamps: true});

module.exports = mongoose.model('Like', Like);