const mongoose = require('mongoose');

const warrantySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'El usuario es requerido']
  },
  vehicleMake: {
    type: String,
    required: [true, 'La marca del vehículo es requerida'],
    trim: true
  },
  vehicleModel: {
    type: String,
    required: [true, 'El modelo del vehículo es requerido'],
    trim: true
  },
  vehicleYear: {
    type: String,
    required: [true, 'El año del vehículo es requerido'],
    trim: true
  },
  vehicleVIN: {
    type: String,
    required: [true, 'El VIN del vehículo es requerido'],
    trim: true,
    uppercase: true
  },
  installerName: {
    type: String,
    required: [true, 'El nombre del instalador es requerido'],
    trim: true
  },
  warrantyCode: {
    type: String,
    required: [true, 'El código de garantía es requerido'],
    unique: true,
    trim: true,
    uppercase: true
  }
}, {
  timestamps: true
});

// Index for better query performance
warrantySchema.index({ user: 1 });
warrantySchema.index({ warrantyCode: 1 });

module.exports = mongoose.model('Warranty', warrantySchema);

