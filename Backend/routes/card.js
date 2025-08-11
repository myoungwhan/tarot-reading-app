const express = require('express');
const router = express.Router();
const Card = require('../models/card');

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




// Update card details by id, upload new image to BunnyCDN if provided

const axios = require('axios');
const FormData = require('form-data');
const multer = require('multer');
const upload = multer();


router.put('/:id', upload.single('image_file'), async (req, res) => {
  const { id } = req.params;
  let updateData = { ...req.body };
  console.log(req.file,"file", req.body.image_base64, "body");

  // If image_file is present (multipart upload), upload to BunnyCDN
  if (req.file) {
    console.log('Uploading image file to BunnyCDN...');
    try {
      const form = new FormData();
      const filename = `card_${id}_${Date.now()}.jpg`;
      form.append('file', req.file.buffer, filename);
      const storageZone = process.env.BUNNY_STORAGE_ZONE || 'tarot-card';
      const bunnyEndpoint = `https://storage.bunnycdn.com/${storageZone}/cards/${filename}`;
      const response = await axios.put(
        bunnyEndpoint,
        req.file.buffer,
        {
          headers: {
            AccessKey: process.env.BUNNY_API_KEY || '392dcd06-ff9c-4834-a5e6-093cdd9588ed4fc7d136-cccd-4502-b174-52fa3e859ee1',
            'Content-Type': req.file.mimetype,
          },
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
        }
      );
      if (response.status === 201 || response.status === 200) {
        const pullZone = process.env.BUNNY_PULL_ZONE || 'tarot-card.b-cdn.net';
        const publicUrl = `https://${pullZone}/cards/${filename}`;
        updateData.image_url = publicUrl;
      } else {
        return res.status(500).json({ error: 'Failed to upload image to BunnyCDN' });
      }
    } catch (err) {
      console.error('BunnyCDN upload error:', err);
      return res.status(500).json({ error: 'Image upload failed' });
    }
  }

  try {
    console.log("Update data:", updateData);
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