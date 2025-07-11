const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Follow = require('../models/Follow');
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
                profileURL,
                followers: 0,
                following: 0
            });
            await user.save().catch(err => console.error("Mongo save error:", err));
        }

        res.status(200).json(user);
    } catch (err) {
        console.log('Error in Google Sign-In:', err);
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
            email,
            followers: 0,
            following: 0
        });
        await user.save();

        res.status(200).json({message: 'Created user', user});
    } catch (err) {
        console.error('Error creating user', err);
        res.status(500).json({error: 'Server error creating user'});
    }
})


router.get('/me', authenticateUser, async (req, res) => {
    res.json({
        name: req.user.name,
        username: req.user.username,
        profileURL: req.user.profileURL,
        email: req.user.email,
        pref: req.user.pref
    });
})

router.post("/check-username", authenticateUser, async (req, res) => {
    try {
        const { username } = req.body;
        const lowerUser = username.toLowerCase();

        let user = await User.findOne({ username: lowerUser });

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
            return res.status(404).json({message: 'update: User not found'});
        }

        const { name, username, profileURL, pref } = req.body;

        if (name !== undefined) user.name = name;
        if (username !== undefined) user.username = username.toLowerCase();
        if (profileURL !== undefined) user.profileURL = profileURL;
        if (pref !== undefined) user.preference = pref;

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

router.get('/:username/get-user', async (req, res) => {
    const {username} = req.params;

    try {
        const user = await User.findOne({username})
                                .select('name username profileURL followers following _id')
                                .lean();

        if (!user) {
            return res.status(404).json({message: 'username: User not found'});
        }

        res.json(user);
    } catch (err) {
        console.error('Error fetching profile:', err);
        res.status(500).json({message: 'Server error'});
    }
})

router.get('/:username/is-following', authenticateUser, async (req, res) => {
    const {username} = req.params;
    const viewerId = req.user.mongoId;

    try {
        const user = await User.findOne({username}).select('_id');
        if (!user) return res.status(404).json({message: 'user not found'});

        const viewer = await User.findOne(viewerId).select('following');
        const following = viewer.following.includes(user._id.toString())

        res.json({following});
    } catch (err) {
        console.error('Error verifying following status:', err);
        res.status(500).json({message: 'Server error'});
    }
})

router.post('/:username/add-follow', authenticateUser, async (req, res) => {
    const {username} = req.params;
    const viewerId = req.user.mongoId;

    try {
        const user = await User.findOne({username}).select('_id');
        if (!user) return res.status(404).json({message: 'user not found'});

        await User.findByIdAndUpdate(viewerId, {
            $addToSet: { following: user._id }
        });
        await User.findByIdAndUpdate(user._id, {
            $addToSet: { followers: viewerId }
        })

        res.status(200).json({message: 'Added follow'});
    } catch (err) {
        console.error('Error verifying following status:', err);
        res.status(500).json({message: 'Server error'});
    }
})

router.post('/:username/remove-follow', authenticateUser, async (req, res) => {
    const {username} = req.params;
    const viewerId = req.user.mongoId;

    try {
        const user = await User.findOne({username}).select('_id');
        if (!user) return res.status(404).json({message: 'user not found'});

        await User.findByIdAndUpdate(viewerId, {
            $pull: { following: user._id }
        });

        await User.findByIdAndUpdate(user._id, {
            $pull: { followers: viewerId }
        })

        res.status(200).json({message: 'Removed follow'});
    } catch (err) {
        console.error('Error verifying following status:', err);
        res.status(500).json({message: 'Server error'});
    }
})

router.post('/get-users', async (req, res) => {
    const { userIds } = req.body;
    try {
        const users = await User.find({_id: {$in: userIds}})
                                .select('_id name username profileURL');
        res.status(200).json({users});
    } catch (err) {
        console.error(err);
        res.status(500).json({error: 'Server error'});
    }
})

router.post('/create-tag', authenticateUser, async (req, res) => {
    const { tags } = req.body;
    const { mongoId } = req.user;

    try {
        const user = await User.findById(mongoId);
        const prevNumTags = user.tags.length;

        user.tags.push(...tags);
        await user.save();

        const addedTags = user.tags.slice(prevNumTags);

        res.status(200).json({addedTags});
    } catch (err) {
        console.error(err);
        res.status(500).json({error: 'Server error'});
    }
})

router.get('/get-tags', authenticateUser, async (req, res) => {
    try {
    const { mongoId } = req.user;

    const user = await User.findById(mongoId).lean().select('tags');
    if (!user) return res.status(404).json({error: 'User not found'});
    res.status(200).json({tags: user.tags});
    } catch (err) {
        res.status(500).json({error: 'Server failed to get tags:', err})
    }
})

router.delete('/delete-tag', authenticateUser, async (req, res) => {
    const { mongoId } = req.user;
    const { tagId } = req.query;

    try {
        const user = await User.findById(mongoId);
        user.tags = user.tags.filter(tag => tag._id.toString() !== tagId);
        await user.save();
        res.status(200).json({tagId});
    } catch (err) {
        console.error(err);
        res.status(500).json({error: 'Server error'});
    }
})

router.put('/update-tags', authenticateUser, async (req, res) => {
    const { tags } = req.body;
    const { mongoId } = req.user;
    try {
        const user = await User.findById(mongoId);
        const updatedTags = [];
        
        tags.forEach(updatedTag => {
            const tag = user.tags.id(updatedTag.mongoId);
            if (tag) {
                tag.name = updatedTag.name;
                tag.hex = updatedTag.hex;
                updatedTags.push(tag);
            }
        })

        await user.save();
        res.status(200).json({updatedTags});
    } catch (err) {
        console.error(err);
        res.status(500).json({error: 'Server error'});
    }
})

module.exports = router;