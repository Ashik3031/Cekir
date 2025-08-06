const express = require('express');
const upload = require('../middleware/upload');

const router = express.Router();

router.post('/images', upload.array('images', 10), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: "No files uploaded" });
  }
  const urls = req.files.map(file => file.path); // Cloudinary returns file.path as URL
  res.json({ urls });
});

module.exports = router;
