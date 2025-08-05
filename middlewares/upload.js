const multer = require("multer");

// Stocke le fichier en mémoire (RAM)
const storage = multer.memoryStorage();

const upload = multer({ storage });

module.exports = upload;
