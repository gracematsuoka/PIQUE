const express = require("express");
const router = express.Router();
const User = require("../models/User");
const verifyToken = require("../middleware/auth");
const authenticateUser = require("../middleware/authenticateUser");

router.get("/", verifyToken, async (req, res) => {
    const users = await User.find();
    res.json(users);
});

router.post("/google-signin", async (req, res) => {
    try {
        const { uid, email, name, profileURL } = req.body;

        let user = await User.findOne({ email: email });

        if (!user) {
            user = new User ({
                firebaseUid: uid,
                name, 
                email, 
                profileURL
            });
            await user.save().catch(err => console.error("Mongo save error:", err));
        }

        console.log('Google sign-in:', req.body);

        res.status(200).json(user);
    } catch (e) {
        console.log('Error in Google Sign-In:', e);
        res.status(500).json({error: 'Server error'});
    }
});

router.post("/check-username", async (req, res) => {
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
        const {name, username, profileURL} = req.body;

        if (name) req.user.name = name;
        if (username) req.user.username = username;
        if (profileURL) req.user.profileURL = profileURL;

        await req.user.save();

        res.status(200).json({message: 'User updated', user: req.user});
    } catch (err) {
        console.log(err);
        res.status(500).json({message: 'Failed to update user'});
    }
})

// router.put('/profile-pic', authenticateUser, async (req, res) => {
//     try {
//         req.user.profileURL = req.body.profileURL;
//         await req.user.save();
//         res.status(200).json({message: 'Profile picture updated', profileURL: req.user.profileURL})
//     } catch (err) {
//         console.log('Failed to update profile pic:', err);
//         res.status(500).json({error: 'Failed to update profile pic'})
//     }
// })

router.get('/me', authenticateUser, async (req, res) => {
    res.json({
        name: req.user.name,
        username: req.user.username,
        profileURL: req.user.profileURL
    });
})

module.exports = router;