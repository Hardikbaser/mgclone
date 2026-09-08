const mongoose = require('mongoose');
module.exports = mongoose.model('Prescription', new mongoose.Schema({ userId: { type: String, required: true }, fileUrl: { type: String, required: true }, status: { type: String, default: 'PENDING_VERIFICATION' }, rejectionReason: String }, { timestamps: true }));
