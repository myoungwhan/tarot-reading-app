const express = require('express');
const router = express.Router();
const AppSettings = require('../models/appSettings');
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

router.get('/how-to-use', async (_req, res) => {
  try {
    const settings = await AppSettings.findByPk(SETTINGS_ID);
    return res.json(toPublicYoutubeSettings(settings));
  } catch (error) {
    console.error('Error fetching app settings:', error);
    return res.status(500).json({ error: 'Failed to fetch app settings' });
  }
});

router.put('/how-to-use', requireAdmin, async (req, res) => {
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
