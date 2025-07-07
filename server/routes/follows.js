const express = require('express');
const router = express.Router();
const Follow = require('../models/Follow');
const User = require('../models/User');
const authenticateUser = require('../middleware/authenticateUser');

router.post('/:userId/create-follow', authenticateUser, async (req, res) => {
    const {mongoId} = req.user;
    const {userId} = req.params;

    try {
        await Follow.create({followerRef: mongoId, followingRef: userId});
        await User.findByIdAndUpdate(mongoId, {$inc: {following: 1}});
        await User.findByIdAndUpdate(userId, {$inc: {followers: 1}});
        res.status(200).json({message: 'Created follow'});
    } catch (err) {
        console.error(err);
        res.status(500).json({error: 'Server error'});
    }
})

router.delete('/:userId/remove-follow', authenticateUser, async (req, res) => {
    const {mongoId} = req.user;
    const {userId} = req.params;

    try {
        await Follow.findOneAndDelete({followerRef: mongoId, followingRef: userId});
        await User.findByIdAndUpdate(mongoId, {$inc: {following: -1}});
        await User.findByIdAndUpdate(userId, {$inc: {followers: -1}});
        res.status(200).json({message: 'Removed follow'});
    } catch (err) {
        console.error(err);
        res.status(500).json({error: 'Server error'});
    }
})

router.delete('/:userId/remove-follower/:followerId', authenticateUser, async (req, res) => {
    const {userId, followerId} = req.params;

    try {
        await Follow.findOneAndDelete({followerRef: followerId, followingRef: userId});
        await User.findByIdAndUpdate(followerId, {$inc: {following: -1}});
        await User.findByIdAndUpdate(userId, {$inc: {followers: -1}});
        res.status(200).json({message: 'Removed follow'});
    } catch (err) {
        console.error(err);
        res.status(500).json({error: 'Server error'});
    }
})

router.get('/:userId/is-following', authenticateUser, async (req, res) => {
    const {mongoId} = req.user;
    const {userId} = req.params;

    try {
        const follow = await Follow.find({followerRef: mongoId, followingRef: userId})
        if (follow.length > 0) return res.json({follow: true});
        return res.status(200).json({follow: false});
    } catch (err) {
        console.error(err);
        res.status(500).json({error: 'Server error'});
    }
})

router.get('/:userId/followers', authenticateUser, async (req, res) => {
    const {userId} = req.params;

    try {
        const followers = await Follow.find({followingRef: userId}).select('followerRef').populate('followerRef', '_id name username profileURL');
        res.status(200).json(followers);
    } catch (err) {
        console.error(err);
        res.status(500).json({error: 'Server error'});
    }
})

router.get('/:userId/following', authenticateUser, async (req, res) => {
    const {userId} = req.params;
    try {
        const following = await Follow.find({followerRef: userId}).select('followingRef').populate('followingRef', '_id name username profileURL');
        res.status(200).json(following);
    } catch (err) {
        console.error(err);
        res.status(500).json({error: 'Server error'});
    }
})

module.exports = router;