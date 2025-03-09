const admin = require("firebase-admin");
const path = require("path");
const fs = require("fs");

const serviceAccount = JSON.parse(
  process.env.FIREBASE_CONFIG.replace(/\n/g, "\\n")
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "walkeyapp.firebasestorage.app",
});

module.exports = admin;
