const mongoose = require('mongoose');

const UserItem = new mongoose.Schema({
    ownerId: mongoose.Types.ObjectId, // user's copy (not original owner)
    itemRef: {type: mongoose.Types.ObjectId, ref: 'Item'}, 
    name: String, 
    colors: Array,
    category: String,
    brand: String,
    price: Number,
    link: String,
    tab: String,
    pref: String,
    tags: [{type: mongoose.Types.ObjectId, ref: 'Tag'}]
}, { timestamps: true })

module.exports = mongoose.model('UserItem', UserItem);