const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

router.patch('/:id', auth, async (req, res) => {
  try {
    const { name, zone } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, zone },
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;