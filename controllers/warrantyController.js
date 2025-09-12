const { validationResult } = require('express-validator');
const Warranty = require('../models/Warranty');

// Create new warranty
const createWarranty = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Datos de entrada inválidos',
        errors: errors.array()
      });
    }

    const {
      vehicleMake,
      vehicleModel,
      vehicleYear,
      vehicleVIN,
      installerName,
      warrantyCode
    } = req.body;

    // Check if warranty code already exists
    const existingWarranty = await Warranty.findOne({ warrantyCode });
    if (existingWarranty) {
      return res.status(400).json({
        message: 'Ya existe una garantía con este código'
      });
    }

    // Create new warranty
    const warranty = new Warranty({
      user: req.user._id, // Set from auth middleware
      vehicleMake,
      vehicleModel,
      vehicleYear,
      vehicleVIN,
      installerName,
      warrantyCode
    });

    await warranty.save();

    // Populate user data for response
    await warranty.populate('user', 'fullName email');

    res.status(201).json({
      message: 'Warranty activated successfully!',
      warranty
    });
  } catch (error) {
    console.error('Create warranty error:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        message: 'Ya existe una garantía con este código'
      });
    }
    
    res.status(500).json({
      message: 'Error interno del servidor'
    });
  }
};

// Get all warranties (admin only)
const getAllWarranties = async (req, res) => {
  try {
    const warranties = await Warranty.find()
      .populate('user', 'fullName email')
      .sort({ createdAt: -1 }); // Sort by newest first

    res.status(200).json(warranties);
  } catch (error) {
    console.error('Get warranties error:', error);
    res.status(500).json({
      message: 'Error interno del servidor'
    });
  }
};

// Get user's warranties
const getUserWarranties = async (req, res) => {
  try {
    const warranties = await Warranty.find({ user: req.user._id })
      .populate('user', 'fullName email')
      .sort({ createdAt: -1 });

    res.status(200).json(warranties);
  } catch (error) {
    console.error('Get user warranties error:', error);
    res.status(500).json({
      message: 'Error interno del servidor'
    });
  }
};

module.exports = {
  createWarranty,
  getAllWarranties,
  getUserWarranties
};

