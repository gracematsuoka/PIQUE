const express = require("express");
const router = express.Router();
const Item = require("../models/Item");
const authenticateUser = require("../middleware/authenticateUser");

router.post('/get-items', authenticateUser, async (req, res) => {
    const {itemIds} = req.body;

    const items = await Item.find({_id: {$in: itemIds}})
                            .select('_id name category brand link colors');

    res.json({items});
})

module.exports = router;