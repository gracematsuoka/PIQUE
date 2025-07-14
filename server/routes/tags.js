const express = require("express");
const router = express.Router();
const Tag = require("../models/Tag");
const authenticateUser = require("../middleware/authenticateUser");
const admin = require('../firebase');

router.post('/create-tag', authenticateUser, async (req, res) => {
    const { tags } = req.body;
    const { mongoId } = req.user;

    try {
        const tagsObj = tags.map(tag => ({
            userId: mongoId,
            name: tag.name,
            hex: tag.hex
        }));

        const addedTags = await Tag.insertMany(tagsObj);

        res.status(200).json({addedTags});
    } catch (err) {
        console.error(err);
        res.status(500).json({error: 'Server error'});
    }
})

router.get('/get-tags', authenticateUser, async (req, res) => {
    try {
    const { mongoId } = req.user;

    const tags = await Tag.find({userId: mongoId});
    res.status(200).json({tags});
    } catch (err) {
        res.status(500).json({error: 'Server failed to get tags:', err})
    }
})

router.delete('/delete-tag', authenticateUser, async (req, res) => {
    const { tagId } = req.query;

    try {
        await Tag.findByIdAndDelete(tagId);
        res.status(200).json({tagId});
    } catch (err) {
        console.error(err);
        res.status(500).json({error: 'Server error'});
    }
})

router.put('/update-tags', authenticateUser, async (req, res) => {
    const { tags } = req.body;
    try {
        const updates = tags.map(tag => ({
            updateOne: {
                filter: {_id: tag.mongoId},
                update: {$set: {name: tag.name, hex: tag.hex}}
            }
        }));
        
        await Tag.bulkWrite(updates);
        console.log('tags', tags)
        const tagIds = tags.map(tag => tag.mongoId);
        const updatedTags = await Tag.find({_id: {$in: tagIds}});
        console.log('updated tags', updatedTags)

        res.status(200).json({updatedTags});
    } catch (err) {
        console.error(err);
        res.status(500).json({error: 'Server error'});
    }
})

module.exports = router;
