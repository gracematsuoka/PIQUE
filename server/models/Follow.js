const mongoose = require('mongoose');

const Follow = new mongoose.Schema({
    followerRef: {type: mongoose.Types.ObjectId, ref: 'User'},  // the follower
    followingRef: {type: mongoose.Types.ObjectId, ref: 'User'}, // who the follower is following
})

module.exports = mongoose.model('Follow', Follow);