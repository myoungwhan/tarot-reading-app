const express = require('express');
const router = express.Router();
const Deck = require('../models/deck');

// Get all decks
router.get('/', async (req, res) => {
  try {
    const decks = await Deck.findAll();
    res.json(decks);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch decks' });
  }
});

module.exports = router;

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
