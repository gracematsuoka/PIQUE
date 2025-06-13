const admin = require('firebase-admin');
const User = require('../models/User'); 

const authenticateUser = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing or invalid token' });
  }

  const idToken = authHeader.split('Bearer ')[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const firebaseUid = decodedToken.uid;

    const mongoUser = await User.findOne({ firebaseUid });
    if (!mongoUser) {
        console.error("User not found for firebase UID:", firebaseUid);
        return res.status(404).json({ message: 'User not found in database' });
    }

    console.log("Setting req.user to:", {
        id: mongoUser._id,
        email: mongoUser.email
    });

    req.user = {
      id: mongoUser._id,
      email: mongoUser.email,
    };

    next();
  } catch (error) {
    console.error('Token verification failed:', error);
    return res.status(403).json({ message: 'Unauthorized' });
  }
};

module.exports = authenticateUser;
