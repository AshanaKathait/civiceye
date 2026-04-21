const express = require('express');
const router = express.Router();
const Report = require('../models/Report');
const auth = require('../middleware/auth');

// GET all reports
router.get('/', async (req, res) => {
  try {
    const reports = await Report.find()
      .populate('userId', 'name zone')
      .sort({ createdAt: -1 });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single report
router.get('/:id', async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('userId', 'name zone');
    if (!report) return res.status(404).json({ message: 'Report not found' });
    res.json(report);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create report (protected)
router.post('/', auth, async (req, res) => {
  try {
    const report = new Report({
      ...req.body,
      userId: req.user.id
    });
    await report.save();
    res.status(201).json(report);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH update status (admin only)
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    res.json(report);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH upvote a report (protected)
router.patch('/:id/upvote', auth, async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    const alreadyUpvoted = report.upvotes.includes(req.user.id);

    if (alreadyUpvoted) {
      report.upvotes = report.upvotes.filter(
        id => id.toString() !== req.user.id
      );
    } else {
      report.upvotes.push(req.user.id);
    }

    await report.save();
    res.json(report);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET heatmap data
router.get('/map/heatmap', async (req, res) => {
  try {
    const reports = await Report.find({}, 'location status category');
    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;