const express = require('express');
const router = express.Router();
const Card = require('../models/card');
const multer = require('multer');
const path = require("path");
const fs = require('fs');

// Get all cards by deck id and category (only for minor arcana)
router.get('/', async (req, res) => {
  const { deck_id, category } = req.query;
  if (!deck_id) {
    return res.status(400).json({ error: 'Deck Id is required' });
  }

  try {
    const cards = await Card.findAll({
      where: { deck_id, ...category ? { category: category } : {} },
    });
    res.json(cards);
  } catch (err) {
    console.error('Error fetching cards:', err);
    res.status(500).json({ error: 'Failed to fetch cards' });
  }
});

// Update card details by id, upload new image

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../images'); // adjust if needed
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + path.extname(file.originalname);
    cb(null, `card_${req.params.id}_${uniqueSuffix}`);
  }
});

const upload = multer({storage});


router.put('/:id', upload.single('image_file'), async (req, res) => {
  const { id } = req.params;
  let updateData = { ...req.body };

  try {
    const existingCard = await Card.findByPk(id);
    if (!existingCard) {
      return res.status(404).json({ error: 'Card not found' });
    }

     // If new image uploaded, handle file saving and old image deletion
    if (req.file) {
      console.log('Saving image to local server...');

       // Delete old image if exists
      if (existingCard.image_url) {
        const oldImagePath = path.join(__dirname, '..', 'images', path.basename(existingCard.image_url));
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
          console.log(`Deleted old image: ${oldImagePath}`);
        }
      }

      // Build full URL dynamically from request
      const backendUrl = `${req.protocol}://${req.get('host')}`;
      // Save new image path
      updateData.image_url = `${backendUrl}/images/${req.file.filename}`;
    }


    const [updated] = await Card.update(updateData, { where: { id } });
    if (updated) {
      const updatedCard = await Card.findByPk(id);
      return res.json(updatedCard);
    }
    res.status(404).json({ error: 'Card not found' });
  } catch (err) {
    console.error('Error updating card:', err);
    res.status(500).json({ error: 'Failed to update card' });
  }
});

module.exports = router;