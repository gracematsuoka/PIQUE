const express = require("express");
const router = express.Router();
const UserItem = require("../models/UserItem");
const Item = require('../models/Item');
const authenticateUser = require("../middleware/authenticateUser");

router.post('/create-item', authenticateUser, async (req, res) => {
    const { mongoId } = req.user;
    const {name, colors, category, brand, price, link, tags, tab, imageURL, pref} = req.body;
    const admin = (mongoId.toString() === '684d0be8f70d8ad161c94960' || mongoId.toString() === '686c0f256b6eac2cc7bb92c1') ? true : false;
    try {

        const item = await Item.create({
            uploaderId: mongoId,
            imageURL,
            public: admin ? true : false,
            name,
            colors,
            category,
            brand,
            price,
            link,
            pref
        })

        const userItem = new UserItem({
            ownerId: mongoId,
            itemRef: item._id, 
            name,
            colors,
            category,
            brand,
            price,
            link,
            tags: tags[0] !== '' ? tags : [],
            tab, 
            pref
        })

        await userItem.save();

        const populatedItem = await UserItem.findById(userItem._id)
            .select('name _id itemRef')
            .populate('itemRef', 'imageURL _id');

        res.status(201).json({userItem: populatedItem});
    } catch (err) {
        console.error(err);
        res.status(500).json({error: 'Server error'});
    }
})

router.post('/create-user-copy', authenticateUser, async (req, res) => {
    const {mongoId} = req.user;
    const {itemRefs, tab} = req.body;
    try {
        const duplicates = new Set((await UserItem
            .find({itemRef: {$in: itemRefs}, ownerId: mongoId}))
            .map(dup => dup.itemRef.toString()));
        const uniqueRefs = itemRefs.filter(ref => !duplicates.has(ref.toString()));
        if (!uniqueRefs.length) return res.status(404).json({message: 'Items not found or are already saved'});
        
        const globalItems = await Item.find({_id: {$in: uniqueRefs}});

        const itemMap = new Map(globalItems.map(item => [item._id.toString(), item]));

        const userCopies = uniqueRefs.map(ref => {
            const global = itemMap.get(ref.toString());
            return {
                ownerId: mongoId,
                itemRef: ref,
                name: global.name,
                colors: global.colors,
                category: global.category,
                brand: global.brand,
                tags: [],
                price: global.price,
                link: global.link,
                tab: tab,
                pref: global.pref
            }
        });

        await UserItem.insertMany(userCopies, {ordered: false});
        const addedItems = await UserItem
            .find({itemRef: {$in: uniqueRefs}, ownerId: mongoId})
            .select('name _id itemRef')
            .populate('itemRef', 'imageURL _id');

        res.status(200).json({addedItems});
    } catch (err) {
        console.error(err);
        res.status(500).json({error: 'Server error'});
    }
})

router.get('/get-items', authenticateUser, async (req, res) => {
    const { mongoId } = req.user;
    const { tab, cursor, q, color, category, tag, style } = req.query;
    try {
        const limit = Math.min(parseInt(req.query.limit) || 20, 40);

        let docs;
        let filter = {};
        if (q) filter.name = {$regex: q, $options: 'i'};
        if (color) filter.colors = {$in: Array.isArray(color) ? color : [color]};
        if (category) filter.category = {$in: Array.isArray(category) ? category : [category]};
        if (tag) filter.tags = {$in: Array.isArray(tag) ? tag : [tag]};
        if (style) {
            filter.pref = {$in: Array.isArray(style) ? style : [style]};
        } else {
            filter.pref = {$in: ['Unisex', req.user.pref]}
        }
        if (cursor) filter._id = {$lt: cursor};

        if (tab === 'closet' || tab === 'wishlist') {
            filter.ownerId = mongoId;
            filter.tab = tab;

            docs = await UserItem
                .find(filter)
                .sort({_id: -1})
                .limit(limit + 1)
                .populate('itemRef', 'imageURL')
                .select('itemRef name'); // eventually add color here for closet name
        } else if (tab === 'database') {
            filter.public = true;

            docs = await Item
                .find(filter)
                .sort({_id: -1})
                .limit(limit + 1)
                .select('imageURL name');
        }
        
        const hasMore = docs.length > 20;
        const items = hasMore ? docs.slice(0, limit) : docs;

        const nextCursor = hasMore ? items[limit - 1]._id : null;
        
        res.status(200).json({items, nextCursor, hasMore});
    } catch (err) {
        console.error(err);
        res.status(500).json({error: 'Server error'});
    }
})

router.get('/:itemId/get-item', authenticateUser, async (req,res) => {
    const {itemId} = req.params;

    try {
        const item = await UserItem.findById(itemId).populate('itemRef').populate('tags');
        if (!item) return res.status(404).json({message: 'Selected item not found'});

        res.status(200).json({item});
    } catch (err) {
        console.error(err);
        res.status(500).json({error: 'Server error'});
    }
})

router.patch('/update-item/:id', authenticateUser, async (req, res) => {
    const { id } = req.params;
    const changedField = req.body;
    console.log('changed', changedField)

    try {
        const item = await UserItem
                    .findById(id);

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
        if (changedField.pref) item.pref = changedField.pref;

        await item.save();

        const updatedItem = await UserItem
                    .findById(id)
                    .select('itemRef name _id')
                    .populate('itemRef', 'imageURL _id');

        res.status(200).json({updatedItem});
    } catch (err) {
        console.error('Failed to update item:', err);
        res.status(500).json({error: 'Server error'});
    }
})

router.delete('/delete-item', authenticateUser, async (req, res) => {
    const { itemId } = req.query;

    try {
        const userItem = await UserItem.findByIdAndDelete(itemId);
        if (!userItem) return res.status(404).json({message: 'user item not found'});
        const item = await Item.findById(userItem.itemRef);
        if (!item.public) {
            await Item.findByIdAndDelete(userItem.itemRef);
        }

        res.sendStatus(204);
    } catch (err) {
        console.error(err);
        res.status(500).json({error: 'Server error'});
    }
})

module.exports = router;