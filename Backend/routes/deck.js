const express = require('express');
const router = express.Router();
const Deck = require('../models/deck');
const Card = require('../models/card');
const { sequelize } = require('../models/index');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer storage for deck cover images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../images');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + path.extname(file.originalname);
    cb(null, `deck_${uniqueSuffix}`);
  }
});

const upload = multer({ storage });

// Get all decks
router.get('/', async (req, res) => {
  try {
    const decks = await Deck.findAll();
    res.json(decks);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch decks' });
  }
});

// Create new deck with optional image upload and card seeding
router.post('/', upload.single('image_file'), async (req, res) => {
  const { name, description, image_url, active, initialize_cards } = req.body;

  if (!name || !name.trim()) {
    if (req.file) {
      try { fs.unlinkSync(req.file.path); } catch (_) {}
    }
    return res.status(400).json({ error: 'Deck name is required' });
  }

  const trimmedName = name.trim();
  let finalImageUrl = image_url;
  if (req.file) {
    const backendUrl = `${req.protocol}://${req.get('host')}`;
    finalImageUrl = `${backendUrl}/images/${req.file.filename}`;
  } else if (!finalImageUrl || !finalImageUrl.trim()) {
    finalImageUrl = 'https://tarot-card.b-cdn.net/cards/card_1_1754133097332.jpg';
  }

  const isActive = active === undefined || active === true || active === 'true';
  const shouldInitializeCards = initialize_cards === undefined || initialize_cards === true || initialize_cards === 'true';

  const t = await sequelize.transaction();
  try {
    const newDeck = await Deck.create({
      name: trimmedName,
      description: description || '',
      active: isActive,
      image_url: finalImageUrl,
      total_cards: shouldInitializeCards ? 'Chapter 78' : '0',
      major_arcana: shouldInitializeCards ? 'Chapter XXII' : '0',
      minor_arcana: shouldInitializeCards ? 'Chapter fifty-six' : '0',
    }, { transaction: t });

    if (shouldInitializeCards) {
      const majorArcanaNames = Array.from({ length: 22 }, (_, i) => `Major Arcana ${i + 1}`);
      const minorSuits = ['wands', 'cups', 'swords', 'pentacles'];
      const sampleImage = 'https://tarot-card.b-cdn.net/cards/card_1_1754133097332.jpg';

      const majorCards = majorArcanaNames.map(cardName => ({
        name: cardName,
        description: `Description for ${cardName}`,
        image_url: sampleImage,
        category: 'major',
        deck_id: newDeck.id,
      }));

      const minorCards = minorSuits.flatMap(suit =>
        Array.from({ length: 14 }, (_, i) => ({
          name: `Minor Arcana ${suit} ${i + 1}`,
          description: `Description for Minor Arcana ${suit} ${i + 1}`,
          image_url: sampleImage,
          category: `minor.arcana.${suit}`,
          deck_id: newDeck.id,
        }))
      );

      await Card.bulkCreate([...majorCards, ...minorCards], { transaction: t });
    }

    await t.commit();
    return res.status(201).json(newDeck);
  } catch (err) {
    await t.rollback();
    if (req.file) {
      try { fs.unlinkSync(req.file.path); } catch (_) {}
    }
    console.error('Error creating deck:', err);
    return res.status(500).json({ error: 'Failed to create deck' });
  }
});

const BUILT_IN_DECKS = ['Universal Waite', 'Marseille', 'Thoth', 'Wild Unknown', 'Shadowscapes'];

const deleteLocalImageIfExists = (imageUrl) => {
  if (!imageUrl || typeof imageUrl !== 'string') return;
  try {
    const match = imageUrl.match(/\/images\/(deck_[a-zA-Z0-9_\-\.]+)/);
    if (match && match[1]) {
      const filePath = path.join(__dirname, '../images', match[1]);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
  } catch (err) {
    console.warn('Failed to delete local image file:', err.message);
  }
};

// Update deck details by id (supports JSON or multipart form with image_file)
router.put('/:id', upload.single('image_file'), async (req, res) => {
  const { id } = req.params;
  try {
    const deck = await Deck.findByPk(id);
    if (!deck) {
      if (req.file) {
        try { fs.unlinkSync(req.file.path); } catch (_) {}
      }
      return res.status(404).json({ error: 'Deck not found' });
    }

    const updates = {};
    if (req.body.name !== undefined) {
      if (!req.body.name || !req.body.name.trim()) {
        if (req.file) {
          try { fs.unlinkSync(req.file.path); } catch (_) {}
        }
        return res.status(400).json({ error: 'Deck name cannot be empty' });
      }
      updates.name = req.body.name.trim();
    }

    if (req.body.description !== undefined) {
      updates.description = req.body.description;
    }

    if (req.body.active !== undefined) {
      updates.active = req.body.active === true || req.body.active === 'true';
    }

    if (req.file) {
      const backendUrl = `${req.protocol}://${req.get('host')}`;
      updates.image_url = `${backendUrl}/images/${req.file.filename}`;
      // Clean up previous image if it was local
      deleteLocalImageIfExists(deck.image_url);
    } else if (req.body.image_url !== undefined && req.body.image_url.trim()) {
      if (req.body.image_url.trim() !== deck.image_url) {
        deleteLocalImageIfExists(deck.image_url);
      }
      updates.image_url = req.body.image_url.trim();
    }

    await deck.update(updates);
    const updatedDeck = await Deck.findByPk(id);
    return res.json(updatedDeck);
  } catch (err) {
    if (req.file) {
      try { fs.unlinkSync(req.file.path); } catch (_) {}
    }
    console.error('Error updating deck:', err);
    res.status(500).json({ error: 'Failed to update deck' });
  }
});

// Delete deck and all associated cards
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const deck = await Deck.findByPk(id);
    if (!deck) {
      return res.status(404).json({ error: 'Deck not found' });
    }

    const isBuiltIn = BUILT_IN_DECKS.some(
      builtIn => deck.name && deck.name.trim().toLowerCase() === builtIn.toLowerCase()
    );
    if (isBuiltIn) {
      return res.status(403).json({ error: 'Built-in decks cannot be deleted.' });
    }

    const t = await sequelize.transaction();
    try {
      // Cascade delete cards
      await Card.destroy({ where: { deck_id: id }, transaction: t });
      // Delete deck
      await Deck.destroy({ where: { id }, transaction: t });
      await t.commit();
    } catch (txErr) {
      await t.rollback();
      throw txErr;
    }

    // Clean up local image file if present
    deleteLocalImageIfExists(deck.image_url);

    return res.json({ success: true, message: 'Deck and associated cards deleted successfully' });
  } catch (err) {
    console.error('Error deleting deck:', err);
    res.status(500).json({ error: 'Failed to delete deck' });
  }
});

module.exports = router;
