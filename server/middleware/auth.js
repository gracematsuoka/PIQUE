const admin = require("../firebase");

const verifyToken = async (req, res, next) => {

    const token = req.headers.authorization?.split("Bearer ")[1];

    if (!token) return res.status(401).json({ error: "No token provided" });

    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        console.log('Decoded token:', decodedToken);
        req.user = decodedToken; // access to Firebase user ID
        next();
    } catch (err) {
        console.error('Token verif error:', err)
        res.status(401).json({ error: "Invalid token" });
    }
};

module.exports = verifyToken;