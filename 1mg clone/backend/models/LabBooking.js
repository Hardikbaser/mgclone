const mongoose = require('mongoose');
module.exports = mongoose.model('LabBooking', new mongoose.Schema({ userId: { type: String, required: true }, testName: { type: String, required: true }, scheduledFor: Date, status: { type: String, default: 'PENDING' } }, { timestamps: true }));
