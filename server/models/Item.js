const mongoose = require('mongoose');

// const ColorSchema = new mongoose.Schema({
//     color: String,
//     hex: String
// })

const ItemSchema = new mongoose.Schema({
    uploaderId: mongoose.Types.ObjectId,
    imageURL: String,
    public: Boolean,
    name: String, 
    colors: Array,
    category: String,
    brand: String,
    price: Number,
    link: String,
    pref: String
}, { timestamps: true })

module.exports = mongoose.model('Item', ItemSchema);