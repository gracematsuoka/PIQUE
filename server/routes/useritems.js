const express = require("express");
const router = express.Router();
const UserItem = require("../models/UserItem");
const authenticateUser = require("../middleware/authenticateUser");

router.post('/create-item', authenticateUser, async (req, res) => {
    const { mongoId } = req.user;
    const {name, colors, category, brand, price, link, itemRef, tags, tab} = req.body;

    const userItem = new UserItem({
        ownerId: mongoId,
        itemRef, 
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
    const popItem = userItem.populate('itemRef');
    res.status(201).json({message: 'User item created', popItem});
})

router.get('/get-closet', authenticateUser, async (req, res) => {
    const { mongoId } = req.user;

    const items = await UserItem.find({ownerId: mongoId, tab: 'closet'}).populate('itemRef', 'imageURL');
    res.status(200).json({message: 'Closet items retrieved', items})
})

router.patch('/update-item/:id', authenticateUser, async (req, res) => {
    const { id } = req.params;
    const changedField = req.body;

    try {
        const item = await UserItem
                    .findById(id)
                    .populate('itemRef');

        if (!item) {
            return res.status(404).json({ error: 'Item not found' });
        }

        if (changedField.name) item.name = changedField.name;
        if (changedField.colors) item.colors = changedField.colors;
        if (changedField.category) item.category = changedField.category;
        if (changedField.brand) item.brand = changedField.brand;
        if (changedField.tags) item.tags = changedField.tags;
        if (changedField.price !== undefined) item.price = changedField.price;
        if (changedField.link) item.link = changedField.link;

        await item.save();
        res.status(200).json({message: 'Item updated', item});
    } catch (err) {
        console.error('Failed to update item:', err);
        res.status(500).json({error: 'Server error'});
    }
})

router.delete('/delete-item', authenticateUser, async (req, res) => {
    const { itemId } = req.query;

    await UserItem.findByIdAndDelete(itemId);

    res.status(200).json({message: 'Deleted item'})
})

module.exports = router;