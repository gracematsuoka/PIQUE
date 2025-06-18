const express = require("express");
const router = express.Router();
const Item = require("../models/Item");
const authenticateUser = require("../middleware/authenticateUser");

router.post('/create-item', authenticateUser, async (req, res) => {
    const {mongoId} = req.user;
    const {name, colors, imageURL, category, brand, price, link} = req.body;

    const item = new Item({
        uploaderId: mongoId,
        imageURL,
        public: false,
        name,
        colors,
        category,
        brand,
        price,
        link
    });

    await item.save();
    res.status(201).json({message: 'Item created', item});
})

module.exports = router;