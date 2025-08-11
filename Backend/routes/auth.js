const express = require('express');
const router = express.Router();
const User = require('../models/user');
const jwt = require('jsonwebtoken');

// Dummy admin credentials (replace with DB or env in production)

const bcrypt = require('bcryptjs');
const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASS || 'password';


router.post('/login', async (req, res) => {
  const { username, password } = req.body;
    // If ADMIN_PASS is a bcrypt hash, compare with bcrypt
    const adminUserDetails = await User.findOne({ where: { username: ADMIN_USER } });
    console.log(adminUserDetails, "adminUserDetails");
    // If admin user does not exist, return unauthorized
    if (!adminUserDetails) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(password, adminUserDetails.dataValues.password);
    if (valid) {
      return res.json({ success: true, message: 'Login successful', token:jwt.sign({ user:adminUserDetails }, process.env.JWT_SECRET) });
    } else {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
});

module.exports = router;

// Change password API
router.post('/change-password', async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  console.log(req.headers.authorization);

  const userToken = req.headers.authorization?.split(' ')[1];
  if (!userToken) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  const decodedUserDetails = jwt.decode(userToken);
  console.log(decodedUserDetails, "decodedUserDetails");
  const username = decodedUserDetails?.user?.username;

  if (!username || !oldPassword || !newPassword) {
    return res.status(400).json({ success: false, message: 'username, oldPassword, and newPassword are required' });
  }
  const user = await User.findOne({ where: { username } });
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  const match = await bcrypt.compare(oldPassword, user.password);
  if (!match) return res.status(401).json({ success: false, message: 'Old password incorrect' });
  const hashed = await bcrypt.hash(newPassword, 10);
  await user.update({ password: hashed });
  res.json({ success: true, message: 'Password changed successfully' });
});
