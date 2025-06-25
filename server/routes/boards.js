const express = require("express");
const router = express.Router();
const Board = require("../models/Board");
const authenticateUser = require("../middleware/authenticateUser");

router.post('/create-board', authenticateUser, async (req, res) => {
    const {mongoId} = req.user;
    const {title, description} = req.body;

    const board = new Board({
        title,
        description,
        userId: mongoId,
    })

    await board.save();
    res.status(200).json({message: 'Created new board'})
})

module.exports = router;