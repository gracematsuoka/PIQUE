const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const authenticateUser = require("../middleware/authenticateUser");

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

module.exports = router;