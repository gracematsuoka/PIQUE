const mongoose = require('mongoose');

const BoardScema = mongoose.Schema({
    userId: {type: mongoose.Types.ObjectId, ref: 'User'},
    title: String,
    description: String,
    coverRef: {type: mongoose.Types.ObjectId, ref: 'Post'},
    numSaved: Number
}, {timestamps: true});

module.exports = mongoose.model('Board', BoardScema)