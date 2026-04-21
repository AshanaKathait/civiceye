const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  description: { type: String, required: true },
  image_url:   { type: String, default: '' },
  category:    { type: String, default: 'unknown' },
  severity:    { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  location: {
    lat:     { type: Number },
    lng:     { type: Number },
    zone:    { type: String, default: 'unknown' },
    address: { type: String, default: '' }
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'resolved'],
    default: 'pending'
  },
  upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  aiAnalysis: {
    category:   { type: String, default: '' },
    severity:   { type: String, default: '' },
    confidence: { type: Number, default: 0 }
  }
}, { timestamps: true });

module.exports = mongoose.model('Report', ReportSchema);