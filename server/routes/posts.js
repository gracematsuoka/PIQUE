const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const Like = require('../models/Like');
const BoardPost = require('../models/BoardPost');
const Item = require('../models/Item');
const UserItem = require('../models/UserItem');
const authenticateUser = require("../middleware/authenticateUser");

router.post('/create-post', authenticateUser, async (req, res) => {
    const {mongoId} = req.user;
    const {title, canvasJSON, postURL, description} = req.body;

    const post = new Post({
        title,
        description,
        canvasJSON,
        userRef: mongoId,
        postURL,
        likes: 0,
        visibility: 'public'
    });

    await post.save();

    const itemIds = canvasJSON.objects.map(obj =>
        obj.itemId
    )

    console.log('ids', itemIds)

    const items = await Item.find({_id: {$in: itemIds}});
    const useritems = await UserItem.find({itemRef: {$in: itemIds}});
    console.log('useritems', useritems)
    if (!items.length) return res.status(404).json({message: 'Items not found'});

    const userItemMap = new Map(useritems.map(item => [item.itemRef.toString(), item]));

    const newItems = []
    items.forEach(item => { 
        if (!item.public) {
            const useritem = userItemMap.get(item._id.toString());
            if (useritem) {
                item.public = true;
                item.name = useritem.name;
                item.colors = useritem.colors;
                item.category = useritem.category;
                item.brand = useritem.brand;
                item.link = useritem.link;
                newItems.push(item);
            }
        };
    });

    await Promise.all(newItems.map(item => item.save()));

    res.status(200).json({message: 'Post created', post})
})

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

router.post('/get-posts', authenticateUser, async (req, res) => {
    const { mongoId } = req.user;
    const { boardIds } = req.body;
    const { q, cursor } = req.query;
    const limit = Math.min(parseInt(req.query.limit) || 20, 40);
    console.log('q', q)

    let filter = {};
    if (q) {
        const regex = new RegExp(escapeRegex(q), 'i');
        filter.$or = [
            {title: regex},
            {description: regex}
        ]
    }
    if (cursor) filter._id.$lt = cursor;

    const docs = await Post.find(filter)
                            .sort({_id: -1})
                            .limit(limit + 1)
                            .select('likes _id postURL userId')
                            .lean();
    const hasMore = docs.length > limit;
    const posts = hasMore ? docs.slice(0, limit) : docs;

    const likedPostIds = await Like.distinct('postRef', 
        {userRef: mongoId, postRef: {$in: posts.map(post => post._id)}});
    const likedIdsSet = new Set(likedPostIds.map(id => id.toString()));

    const boardPosts = await BoardPost.find({
        'postRef': { $in: posts.map(post => post._id)}, 
        'boardRef': { $in: boardIds }
    });

    const postToBoard = {};
    for (const el of boardPosts) {
        const postId = el.postRef.toString();
        if (!postToBoard[postId]) {
            postToBoard[postId] = [];
        }
        postToBoard[postId].push(el.boardRef.toString());
    }

    const postData = posts.map(post => ({
        ...post,
        likedByUser: likedIdsSet.has(post._id.toString()),
        savedBoards: postToBoard[post._id.toString()] || []
    }));

    const nextCursor = hasMore ? posts[limit - 1]._id : null;

    res.json({postData, nextCursor, hasMore});
})

router.post('/saved', authenticateUser, async (req, res) => {
    const {mongoId} = req.user;
    const {boardId, liked} = req.query;
    const {boardIds} = req.body;
    console.log('reached')

    const model = boardId ? BoardPost : Like;

    const fetchedPosts = boardId ? await model.find({boardRef: boardId}).select('postRef -_id')
                            : await model.find({userRef: mongoId}).select('postRef -_id');

    const postIds = fetchedPosts.map(bp => bp.postRef);
    if (postIds.length === 0) {
        return res.json({postData: [], nextCursor: null, hasMore: false});
    }

    const limit = Math.min(parseInt(req.query.limit) || 20, 40);
    const cursor = req.query.cursor;

    const filter = {postRef: {$in: postIds}};
    if (cursor) filter._id.$lt = cursor;

    const allData = await model
                .find(filter)
                .sort({_id: -1})
                .limit(limit + 1)
                .populate('postRef', 'likes _id postURL userId')
                .select('postRef -_id')
                .lean();

    const docs = allData.map(data => data?.postRef)

    const hasMore = docs.length > limit;
    const posts = hasMore ? docs.slice(0, limit) : docs;
    console.log('posts', posts)

    const likedPostIds = await Like.distinct('postRef', 
        {userRef: mongoId, postRef: {$in: posts.map(post => post._id)}});
    const likedIdsSet = new Set(likedPostIds.map(id => id.toString()));
    
    const boardPosts = await BoardPost.find({
        'postRef': { $in: posts.map(post => post._id)}, 
        'boardRef': { $in: boardIds }
    });

    const postToBoard = {};
    for (const el of boardPosts) {
        const postId = el.postRef.toString();
        if (!postToBoard[postId]) {
            postToBoard[postId] = [];
        }
        postToBoard[postId].push(el.boardRef.toString());
    }

    const postData = posts.map(post => ({
        ...post,
        likedByUser: likedIdsSet.has(post._id.toString()),
        savedBoards: postToBoard[post._id.toString()] || []
    }))
    console.log('postdata', postData)

    const nextCursor = hasMore ? posts[limit - 1]._id : null;

    res.json({postData, nextCursor, hasMore});
})

router.post('/profile-posts', authenticateUser, async (req, res) => {
    const {mongoId} = req.user;
    const {userId} = req.query;
    const {boardIds} = req.body;
    console.log('id', userId)

    const fetchedPosts = await Post.find({userRef: userId});

    const postIds = fetchedPosts.map(fp => fp._id);
    if (postIds.length === 0) {
        return res.json({postData: [], nextCursor: null, hasMore: false});
    }

    const limit = Math.min(parseInt(req.query.limit) || 20, 40);
    const cursor = req.query.cursor;

    const filter = {_id: {$in: postIds}};
    if (cursor) filter._id.$lt = cursor;

    const docs = await Post
        .find(filter)
        .sort({_id: -1})
        .limit(limit + 1)
        .select('_id likes _id postURL userId')
        .lean();

    const hasMore = docs.length > limit;
    const posts = hasMore ? docs.slice(0, limit) : docs;
    console.log('posts', posts)

    const likedPostIds = await Like.distinct('postRef', 
        {userRef: mongoId, postRef: {$in: posts.map(post => post._id)}});
    const likedIdsSet = new Set(likedPostIds.map(id => id.toString()));
    
    const boardPosts = await BoardPost.find({
        'postRef': { $in: posts.map(post => post._id)}, 
        'boardRef': { $in: boardIds }
    });

    const postToBoard = {};
    for (const el of boardPosts) {
        const postId = el.postRef.toString();
        if (!postToBoard[postId]) {
            postToBoard[postId] = [];
        }
        postToBoard[postId].push(el.boardRef.toString());
    }

    const postData = posts.map(post => ({
        ...post,
        likedByUser: likedIdsSet.has(post._id.toString()),
        savedBoards: postToBoard[post._id.toString()] || []
    }))

    const nextCursor = hasMore ? posts[limit - 1]._id : null;
    console.log('postdata', postData)

    res.json({postData, nextCursor, hasMore});
})

router.post('/:postId/like', authenticateUser, async (req, res) => {
    const {mongoId} = req.user;
    const {postId} = req.params;

    try {
        await Like.create({userRef: mongoId, postRef: postId});
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

    const removed = await Like.findOneAndDelete({userRef: mongoId, postRef: postId});
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