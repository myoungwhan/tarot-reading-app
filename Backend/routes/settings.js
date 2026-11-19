const express = require('express');
const router = express.Router();
const AppSettings = require('../models/appSettings');
const StandbySettings = require('../models/standbySettings');
const Deck = require('../models/deck');
const { ForeignKeyConstraintError } = require('sequelize');
const jwt = require('jsonwebtoken');
const {
  DEFAULT_YOUTUBE_SETTINGS,
  normalizeYoutubeSettings,
  toPublicYoutubeSettings,
} = require('../utils/youtubeSettings');

const SETTINGS_ID = 1;

const requireAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token || !process.env.JWT_SECRET) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  try {
    req.admin = jwt.verify(token, process.env.JWT_SECRET);
    return next();
  } catch {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
};

router.get('/standby-deck', async (_req, res) => {
  try {
    const settings = await StandbySettings.findByPk(SETTINGS_ID);
    return res.json({ deckId: settings?.deck_id ?? null });
  } catch (error) {
    console.error('Error fetching standby deck:', error);
    return res.status(500).json({ error: 'Failed to load the standby deck setting.' });
  }
});

router.put('/standby-deck', requireAdmin, async (req, res) => {
  const { deckId } = req.body ?? {};
  if (deckId !== null && (!Number.isInteger(deckId) || deckId < 1 || deckId > 2147483647)) {
    return res.status(400).json({ error: 'Choose a deck or use the session deck.' });
  }

  const deckUnavailable = 'That deck is no longer available.';
  try {
    if (deckId !== null && !(await Deck.findByPk(deckId))) {
      return res.status(400).json({ error: deckUnavailable });
    }

    await StandbySettings.upsert({ id: SETTINGS_ID, deck_id: deckId });
    return res.json({ deckId });
  } catch (error) {
    if (error instanceof ForeignKeyConstraintError) {
      return res.status(400).json({ error: deckUnavailable });
    }
    console.error('Error saving standby deck:', error);
    return res.status(500).json({ error: 'Failed to save the standby deck setting.' });
  }
});

router.get('/how-to-use', async (_req, res) => {
  try {
    const settings = await AppSettings.findByPk(SETTINGS_ID);
    return res.json(toPublicYoutubeSettings(settings));
  } catch (error) {
    console.error('Error fetching app settings:', error);
    return res.status(500).json({ error: 'Failed to fetch app settings' });
  }
});

router.put('/how-to-use', async (req, res) => {
  let normalizedSettings;
  try {
    normalizedSettings = normalizeYoutubeSettings(req.body);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }

  try {
    const [settings] = await AppSettings.findOrCreate({
      where: { id: SETTINGS_ID },
      defaults: { id: SETTINGS_ID, ...DEFAULT_YOUTUBE_SETTINGS },
    });

    await settings.update(normalizedSettings);
    return res.json(toPublicYoutubeSettings(settings));
  } catch (error) {
    console.error('Error updating app settings:', error);
    return res.status(500).json({ error: 'Failed to update app settings' });
  }
});

module.exports = router;
