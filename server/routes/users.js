const express = require("express");
const router = express.Router();
const User = require("../models/User");
const verifyToken = require("../middleware/auth");
const authenticateUser = require("../middleware/authenticateUser");
// const multer = require("multer");
// const storage = multer.memoryStorage();
// const upload = multer({ storage });

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

// router.post("/upload-profile-pic", upload.single("file", async (req, res) => {
//     try {
//         const fileBuffer = req.file.buffer;

//         const imageUrl = await uploadToStorage(fileBuffer);
//         const userId = req.user.Id;
//         await User.findByIdAndUpdate(userId, { profileURL: imageUrl });
        
//         res.status(200).json(imageUrl)
//     } catch (err) {
//         console.log('Error in uploading profile pic');
//         res.status(500).json({error: 'Server error'});
//     }
// }));

router.get('/me', authenticateUser, async (req, res) => {
    console.log('user:', req.user)
    const user = await User.findById(req.user.id);
    res.json({name: user.name, username: user.username, profileURL: user.profileURL});
})

module.exports = router;