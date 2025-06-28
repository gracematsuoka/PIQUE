const express = require('express');
const router = express.Router();
const Follow = require('../models/Follow');
const authenticateUser = require('../middleware/authenticateUser');

router.post('/:userId/create-follow', authenticateUser, async (req, res) => {
    const {mongoId} = req.user;
    const {userId} = req.params;

    await Follow.create({followerRef: mongoId, followingRef: userId});
    
})