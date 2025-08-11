const express = require('express');
const router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcryptjs');

// Login API
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ where: { username } });
  if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });
  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ success: false, message: 'Invalid credentials' });
  res.json({ success: true, message: 'Login successful', user: { id: user.id, username: user.username } });
});

// Change password API
router.post('/change-password', async (req, res) => {
  const { username, oldPassword, newPassword } = req.body;
  const user = await User.findOne({ where: { username } });
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  const match = await bcrypt.compare(oldPassword, user.password);
  if (!match) return res.status(401).json({ success: false, message: 'Old password incorrect' });
  const hashed = await bcrypt.hash(newPassword, 10);
  await user.update({ password: hashed });
  res.json({ success: true, message: 'Password changed successfully' });
});

module.exports = router;
