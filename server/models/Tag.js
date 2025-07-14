const mongoose = require('mongoose');

const TagSchema = mongoose.Schema({
    userId: {type: mongoose.Types.ObjectId, ref: 'User'},
    name: String,
    hex: String
}, {timestamps: true});

module.exports = mongoose.model('Tag', TagSchema)