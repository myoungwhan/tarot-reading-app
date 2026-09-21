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

// Update deck details by id
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [updated] = await Deck.update(req.body, { where: { id } });
    if (updated) {
      const updatedDeck = await Deck.findByPk(id);
      return res.json(updatedDeck);
    }
    res.status(404).json({ error: 'Deck not found' });
  } catch (err) {
    console.error('Error updating deck:', err);
    res.status(500).json({ error: 'Failed to update deck' });
  }
});

module.exports = router;
