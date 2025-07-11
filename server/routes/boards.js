const express = require("express");
const router = express.Router();
const Board = require("../models/Board");
const authenticateUser = require("../middleware/authenticateUser");

router.post('/create-board', authenticateUser, async (req, res) => {
    const {mongoId} = req.user;
    const {title, description} = req.body;

    try {
    const board = new Board({
        title,
        description,
        userId: mongoId,
        numSaved: 0
    })

    await board.save();
    res.status(200).json({board})
    } catch (err) {
        console.error(err);
        res.status(500).json({error: 'Server error'});
    }
})

router.get('/get-boards', authenticateUser, async (req, res) => {
    const {mongoId} = req.user;

    try {
        const boards = await Board.find({userId: mongoId}).populate('coverRef');
        res.status(200).json({boards});
    } catch (err) {
        console.error(err);
        res.status(500).json({error: 'Server error'});
    }
})

router.patch('/edit-board/:boardId', authenticateUser, async (req, res) => {
    const {boardId} = req.params;
    const {title, description, coverURL} = req.body;

    try {
        const board = await Board.findById(boardId);

        if (!board) return res.status(404).json({error: 'Board not found'});

        board.title = title;
        board.description = description;
        board.coverURL = coverURL;

        await board.save();
        res.status(200).json({board});
    } catch (err) {
        console.error(err);
        res.status(500).json({error: 'Server error'});
    }
})

router.get('/:boardId/board', authenticateUser, async (req, res) => {
    const {boardId} = req.params;

    try {
        const board = await Board.findById(boardId);
        if (!board) return res.status(404).json({error: 'Board not found'});

        res.status(200).json(board);
    } catch (err) {
        console.error(err);
        res.status(500).json({error: 'Server error'});
    }
})

module.exports = router;