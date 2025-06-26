const mongoose = require('mongoose');

const Follow = new mongoose.Schema({
    followerId: mongoose.Types.ObjectId,
    followingId: mongoose.Types.ObjectId
})

module.exports = mongoose.model('Follow', Follow);