const express = require("express");
const router = express.Router();
const User = require("../models/User");
const verifyToken = require("../middleware/auth");

// Get all users
router.get("/", verifyToken, async (req, res) => {
    const users = await User.find();
    res.json(users);
});

module.exports = router;