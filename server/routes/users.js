const express = require("express");
const router = express.Router();
const User = require("../models/User");
const authenticateUser = require("../middleware/authenticateUser");
const admin = require('../firebase');

router.post("/google-signin", authenticateUser, async (req, res) => {
    try {
        const { firebaseUid, email, name, profileURL } = req.user;

        let user = await User.findOne({ email: email });

        if (!user) {
            user = new User ({
                firebaseUid,
                name, 
                email, 
                profileURL
            });
            await user.save().catch(err => console.error("Mongo save error:", err));
        }

        res.status(200).json(user);
    } catch (e) {
        console.log('Error in Google Sign-In:', e);
        res.status(500).json({error: 'Server error'});
    }
});

router.post('/create-user', authenticateUser, async(req, res) => {
    try {
        const { firebaseUid, email } = req.user;

        let user = await User.findOne({firebaseUid});
        if(user) {
            return res.status(409).json({ message: 'User already exists' });
        }

        user = new User({
            firebaseUid,
            email
        });
        await user.save();

        res.status(200).json({message: 'Created user', user});
    } catch (err) {
        console.error('Error creating user', err);
        res.status(500).json({error: 'Server error creating user'});
    }
})

router.post("/check-username", authenticateUser, async (req, res) => {
    try {
        const { username } = req.body;

        let user = await User.findOne({ username });

        if (!user) {
            return res.status(200).json({exists: false});
        } 
            
        return res.status(200).json({exists: true});
    } catch (e) {
        console.log('Error in checking username:', e);
        return res.status(500).json({error: 'Server error'});
    }
});

router.post('/update-user', authenticateUser, async (req, res) => {
    try {
        const user = await User.findById(req.user.mongoId)

        if (!user) {
            return res.status(404).json({message: 'User not found'});
        }

        const { name, username, profileURL } = req.body;

        if (name !== undefined) user.name = name;
        if (username !== undefined) user.username = username;
        if (profileURL !== undefined) user.profileURL = profileURL;

        await user.save();

        res.status(200).json({message: 'User updated', user: req.user});
    } catch (err) {
        console.log(err);
        res.status(500).json({message: 'Failed to update user'});
    }
})

router.delete('/delete-account', authenticateUser, async (req, res) => {
    try {
        const {firebaseUid, mongoId} = req.user;

        await admin.auth().deleteUser(firebaseUid);
        await User.findByIdAndDelete(mongoId);
        
        res.status(200).json({message: 'Deleted account'});
    } catch (err) {
        console.error('Failed to delete account:', err);
        res.status(500).json({message: 'Failed to delete account'});
    }
})

router.get('/me', authenticateUser, async (req, res) => {
    res.json({
        name: req.user.name,
        username: req.user.username,
        profileURL: req.user.profileURL,
        email: req.user.email
    });
})

router.post('/create-tag', authenticateUser, async (req, res) => {
    const { tags } = req.body;
    const { mongoId } = req.user;

    const user = await User.findById(mongoId);
    user.tags.push(...tags);
    await user.save();

    res.status(200).json({message: 'Tags added'});
})

router.get('/get-tags', authenticateUser, async (req, res) => {
    const { mongoId } = req.user;

    const user = await User.findById(mongoId);
    res.json({tags: user.tags});
})

router.delete('/delete-tag', authenticateUser, async (req, res) => {
    const { mongoId } = req.user;
    const { tagId } = req.query;

    const user = await User.findById(mongoId);
    user.tags = user.tags.filter(tag => tag._id.toString() !== tagId);
    await user.save();
    res.status(200).json({message: 'Tag deleted'});
})

router.put('/update-tags', authenticateUser, async (req, res) => {
    const { tags } = req.body;
    const { mongoId } = req.user;

    const user = await User.findById(mongoId);
    
    tags.forEach(updatedTag => {
        const tag = user.tags.id(updatedTag.mongoId);
        if (tag) {
            tag.name = updatedTag.content;
            tag.hex = updatedTag.color;
        }
    })

    await user.save();
    res.status(200).json({message: 'Tags updated'});
})

module.exports = router;