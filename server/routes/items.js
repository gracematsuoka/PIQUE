const express = require("express");
const router = express.Router();
const Item = require("../models/Item");
const authenticateUser = require("../middleware/authenticateUser");

router.post('/get-items', authenticateUser, async (req, res) => {
    try {
        const {itemIds} = req.body;

        const items = await Item
            .find({_id: {$in: itemIds}})
            .select('_id name category price brand link colors');

        res.status(200).json({items});
    } catch (err) {
        console.error(err);
        res.status(500).json({error: 'Server error'});
    }
})

module.exports = router;