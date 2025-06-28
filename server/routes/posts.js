const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const Like = require('../models/Like');
const authenticateUser = require("../middleware/authenticateUser");
const { auth } = require("firebase-admin");

router.post('/create-post', authenticateUser, async (req, res) => {
    const {mongoId} = req.user;
    const {title, canvasJSON, postURL, description} = req.body;

    const post = new Post({
        title,
        description,
        canvasJSON,
        userId: mongoId,
        postURL,
        likes: 0,
        visibility: 'public'
    })

    await post.save();
    res.status(200).json({message: 'Post created', post})
})

router.get('/get-posts', authenticateUser, async (req, res) => {
    const {mongoId} = req.user;
    const limit = Math.min(parseInt(req.query.limit) || 20, 40);
    const cursor = req.query.cursor;

    const docs = await Post.find(cursor ? {_id: {$lt: cursor}} : {})
                            .sort({_id: -1})
                            .limit(limit + 1)
                            .select('likes _id postURL userId colors')
                            .lean();
    
    const hasMore = docs.length > limit;
    const posts = hasMore ? docs.slice(0, limit) : docs;

    const likedPostIds = await Like.distinct('postId', 
        {userId: mongoId, postId: {$in: posts.map(post => post._id)}});
    const likedIdsSet = new Set(likedPostIds.map(id => id.toString()));

    const postData = posts.map(post => ({
        ...post,
        likedByUser: likedIdsSet.has(post._id.toString())
    }))

    const nextCursor = hasMore ? posts[limit - 1]._id : null;

    res.json({postData, nextCursor, hasMore});
})

router.post('/:postId/like', authenticateUser, async (req, res) => {
    const {mongoId} = req.user;
    const {postId} = req.params;

    try {
        await Like.create({userId: mongoId, postId});
        await Post.findByIdAndUpdate(postId, {$inc: {likes: 1}});
        res.status(200).json({message: 'Added like'});
    } catch (err) {
        if (err.code === 11000) return res.status(409).json({error: 'Already liked post'});
        return res.status(500).json({error: 'Server error'});
    }
})

router.delete('/:postId/unlike', authenticateUser, async (req, res) => {
    const {mongoId} = req.user;
    const {postId} = req.params;

    const removed = await Like.findOneAndDelete({userId: mongoId, postId});
    if (!removed) return res.status(404).json({error: 'Already unliked'});

    await Post.findByIdAndUpdate(postId, {$inc: {likes: -1}});
    res.sendStatus(204);
})

router.get('/:postId', authenticateUser, async (req, res) => {
    const {postId} = req.params;

    const post = await Post.findById(postId).populate('userRef', 'username profileURL');
    if (!post) return res.status(404).json({error: 'Post not found'});
    
    res.status(200).json(post);
})

module.exports = router;