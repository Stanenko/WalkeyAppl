const admin = require("firebase-admin");
const path = require("path");
const fs = require("fs");

const serviceAccountPath = path.join(__dirname, "serviceAccountKey.json");

if (!fs.existsSync(serviceAccountPath)) {
  throw new Error("Файл serviceAccountKey.json не найден. Убедитесь, что он есть в корне проекта.");
}

const serviceAccount = require(serviceAccountPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "walkeyapp.firebasestorage.app",
});

module.exports = admin;
