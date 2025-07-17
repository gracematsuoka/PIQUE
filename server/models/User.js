const mongoose = require('mongoose');

const TagSchema = new mongoose.Schema({
    name: String,
    hex: String
})

const UserSchema = new mongoose.Schema({
    firebaseUid: {type: String, required: true, unique: true},
    name: String,
    username: String,
    email: {type: String, required: true, unique: true},
    profileURL: String,
    tags: [TagSchema],
    followers: Number,
    following: Number,
    preference: String,
    plus: Boolean,
    stripeCustomerId: String,
    tries: Number
}, { timestamps: true })

module.exports = mongoose.model("User", UserSchema);