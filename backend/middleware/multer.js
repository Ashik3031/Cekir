const multer = require('multer');
const path = require('path');

// Set storage engine for Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');  // Files will be uploaded to the 'uploads' folder
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));  // Store files with timestamp to avoid name conflicts
  }
});

// Define the multer upload configuration
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }  // Limit file size to 5MB
}).any();  // Allow any field to be uploaded

module.exports = upload;
