const express = require('express');
const router = express.Router();
const Follow = require('../models/Follow');
const User = require('../models/User');
const authenticateUser = require('../middleware/authenticateUser');

router.post('/:userId/create-follow', authenticateUser, async (req, res) => {
    const {mongoId} = req.user;
    const {userId} = req.params;

    await Follow.create({followerRef: mongoId, followingRef: userId});
    await User.findByIdAndUpdate(mongoId, {$inc: {following: 1}});
    await User.findByIdAndUpdate(userId, {$inc: {followers: 1}});
    res.status(200).json({message: 'Created follow'});
})

router.delete('/:userId/remove-follow', authenticateUser, async (req, res) => {
    const {mongoId} = req.user;
    const {userId} = req.params;

    await Follow.findOneAndDelete({followerRef: mongoId, followingRef: userId});
    await User.findByIdAndUpdate(mongoId, {$inc: {following: -1}});
    await User.findByIdAndUpdate(userId, {$inc: {followers: -1}});
    res.status(200).json({message: 'Removed follow'});
})

router.delete('/:userId/remove-follower/:followerId', authenticateUser, async (req, res) => {
    const {userId, followerId} = req.params;

    await Follow.findOneAndDelete({followerRef: followerId, followingRef: userId});
    await User.findByIdAndUpdate(followerId, {$inc: {following: -1}});
    await User.findByIdAndUpdate(userId, {$inc: {followers: -1}});
    res.status(200).json({message: 'Removed follow'});
})

router.get('/:userId/is-following', authenticateUser, async (req, res) => {
    const {mongoId} = req.user;
    const {userId} = req.params;

    const follow = await Follow.find({followerRef: mongoId, followingRef: userId})
    if (follow.length > 0) return res.json({follow: true});
    return res.json({follow: false});
})

router.get('/:userId/followers', authenticateUser, async (req, res) => {
    const {userId} = req.params;

    const followers = await Follow.find({followingRef: userId}).select('followerRef').populate('followerRef', '_id name username profileURL');
    res.json(followers);
})

router.get('/:userId/following', authenticateUser, async (req, res) => {
    const {userId} = req.params;

    const following = await Follow.find({followerRef: userId}).select('followingRef').populate('followingRef', '_id name username profileURL');
    res.json(following);
})

module.exports = router;