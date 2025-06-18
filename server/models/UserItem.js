const mongoose = require('mongoose');

const ColorSchema = new mongoose.Schema({
    color: String,
    hex: String
})

const TagSchema = new mongoose.Schema({
    name: String,
    hex: String,
    key: Number
})

const UserItem = new mongoose.Schema({
    ownerId: mongoose.Types.ObjectId,
    itemId: mongoose.Types.ObjectId,
    name: String, 
    colors: [ColorSchema],
    category: String,
    brand: String,
    tags: [TagSchema],
    price: Number,
    link: String,
    tab: String // closet, wishlist, ...
}, { timestamps: true })

module.exports = mongoose.model('User Item', UserItem);