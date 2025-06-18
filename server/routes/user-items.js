const express = require("express");
const router = express.Router();
const UserItem = require("../models/UserItem");
const authenticateUser = require("../middleware/authenticateUser");

router.post('/create-item', authenticateUser, async (req, res) => {
    const {mongoId} = req.user;
    const {name, colors, category, brand, price, link, itemId, tags, tab} = req.body;

    const userItem = new UserItem({
        ownerId: mongoId,
        itemId, 
        name,
        colors,
        category,
        brand,
        price,
        link,
        tags,
        tab
    });

    await userItem.save();
    res.status(201).json({message: 'User item created', userItem});
})

module.exports = router;