const admin = require('../firebase');
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
    const email = decodedToken.email;

    const mongoUser = await User.findOne({ firebaseUid });

    if (mongoUser) {
        req.user = {
            firebaseUid,
            email,
            mongoId: mongoUser._id,
            name: mongoUser.name,
            username: mongoUser.username,
            profileURL: mongoUser.profileURL
        };
    } else {
        req.user = {
            firebaseUid,
            email
        }
    }

    next();
  } catch (error) {
    console.error('Token verification failed:', error);
    return res.status(403).json({ message: 'Unauthorized' });
  }
};

module.exports = authenticateUser;
