const mongoose = require('mongoose');

const ColorSchema = new mongoose.Schema({
    color: String,
    hex: String
})

const TagSchema = new mongoose.Schema({
    name: String,
    hex: String,
})

const UserItem = new mongoose.Schema({
    ownerId: mongoose.Types.ObjectId, // user's copy (not original owner)
    itemRef: {type: mongoose.Types.ObjectId, ref: 'Item'}, 
    name: String, 
    colors: [ColorSchema],
    category: String,
    brand: String,
    tags: [TagSchema],
    price: Number,
    link: String,
    tab: String // closet, wishlist, ...
}, { timestamps: true })

module.exports = mongoose.model('UserItem', UserItem);