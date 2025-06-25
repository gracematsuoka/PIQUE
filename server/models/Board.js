const mongoose = require('mongoose');

const BoardScema = mongoose.Schema({
    userId: mongoose.Types.ObjectId,
    title: String,
    description: String,
    coverURL: String,
    postIds: Array
});

module.exports = mongoose.model('Board', BoardScema)