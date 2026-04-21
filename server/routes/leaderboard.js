const express = require('express');
const router = express.Router();
const User = require('../models/User');

// GET top reporters
router.get('/', async (req, res) => {
  try {
    const users = await User.find({ role: 'citizen' })
      .select('name zone points avatar')
      .sort({ points: -1 })
      .limit(20);
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;