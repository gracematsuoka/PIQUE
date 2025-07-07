const express = require('express');
const router = express.Router();
const authenticateUser = require('../middleware/authenticateUser');
const BoardPost = require('../models/BoardPost');
const Board = require('../models/Board');

router.post('/:postId/post-exists', authenticateUser, async (req, res) => {
    const {postId} = req.params;
    const {boardIds} = req.body;

    try {
       const containedBoards = await BoardPost.find({
            postRef: postId,
            boardRef: {$in: boardIds}
        }).select('boardRef');

        const containedBoardIds = new Set(containedBoards.map(board => board.boardRef.toString()));
        const exists = boardIds.map(boardId => ({
            boardId,
            exists: containedBoardIds.has(boardId.toString())
        }));

        res.status(200).json(exists);
    } catch (err) {
        console.error('Error checking if post exists in boards:', err);
        res.status(500).json({error: 'Server error'});
    }
});

router.delete('/:postId/remove-post/:boardId', authenticateUser, async(req, res) => {
    const {postId, boardId} = req.params;

    try {
        await BoardPost.findOneAndDelete({postRef: postId, boardRef: boardId});
        await Board.findByIdAndUpdate(boardId, {$inc: {numSaved: -1}});

        const board = await Board.findById(boardId);
        let newCoverRef;
        if (board?.coverRef.toString() === postId.toString()) {
            if (board.numSaved === 0) {
                await Board.findByIdAndUpdate(boardId, {coverRef: null});
                newCoverRef = null;
            } else {
                const boardPost = await BoardPost
                                        .findOne({boardRef: boardId})
                                        .sort({createdAt: 1})
                                        .populate('postRef');
                const newPostId = boardPost.postRef._id;
                await Board.findByIdAndUpdate(boardId, {coverRef: newPostId});
                newCoverRef = newPostId;
            }
        }

        res.status(200).json({newCoverRef})
    } catch (err) {
        console.error(err);
        res.status(500).json({error: 'Server error'});
    }
});

router.post('/:postId/add-post/:boardId', authenticateUser, async(req, res) => {
    const {postId, boardId} = req.params;
    const {mongoId} = req.user;

    try {
        await BoardPost.create({postRef: postId, boardRef: boardId, userRef: mongoId});
        await Board.findByIdAndUpdate(boardId, {$inc: {numSaved: 1}});

        const board = await Board.findById(boardId);
        let newCoverRef;
        if (!board?.coverRef) {
            await Board.findByIdAndUpdate(boardId, {coverRef: postId});
            newCoverRef = postId;
        }

        res.status(200).json({newCoverRef})
    } catch (err) {
        console.error(err);
        res.status(500).json({error: 'Server error'});
    }
});

module.exports = router;