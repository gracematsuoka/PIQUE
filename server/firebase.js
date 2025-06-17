var admin = require("firebase-admin");
const { v4: uuidv4 } = require("uuid");
const path = require("path");

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
        type: "service_account",
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKeyId: process.env.FIREBASE_PRIVATE_KEY_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        clientId: process.env.FIREBASE_CLIENT_ID,
        authUri: "https://accounts.google.com/o/oauth2/auth",
        tokenUri: "https://oauth2.googleapis.com/token",
        authProviderX509CertUrl: "https://www.googleapis.com/oauth2/v1/certs",
        clientC509CertUrl: process.env.FIREBASE_CLIENT_CERT_URL
        }),
        // storageBucket: 
    });
}

module.exports = admin;