const mongoose = require('mongoose');
module.exports = mongoose.model('Consultation', new mongoose.Schema({ patientId: { type: String, required: true }, doctorId: String, scheduledFor: Date, status: { type: String, default: 'REQUESTED' }, notes: String }, { timestamps: true }));
