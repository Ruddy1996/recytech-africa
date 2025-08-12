const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

// 📁 Stockage des images dans /public/uploads/badges
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/badges');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = file.originalname.split('.')[0].replace(/\s+/g, '-');
    cb(null, `${name}-${Date.now()}${ext}`);
  },
});

const upload = multer({ storage });

// Route : POST /api/upload/badge
router.post('/badge', upload.single('image'), (req, res) => {
  const imageUrl = `/uploads/badges/${req.file.filename}`;
  res.status(201).json({ imageUrl });
});

module.exports = router;
