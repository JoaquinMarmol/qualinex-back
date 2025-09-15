import { validationResult } from 'express-validator';
import Warranty from '../models/Warranty.js';
import mongoose from 'mongoose';

// Campos permitidos desde el front
const FRONT_FIELDS = [
  'country',
  'productSeries',
  'constructionShop',
  'carColour',
  'licensePlate',
  'carModel',
  'applicationDate',
  'contactNumber',
  'detailTechnician',
  'filmCoreSerial',
  'tags'
];

// Crear nueva garantía
export const createWarranty = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) 
      return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });

    const warrantyData = {
      ...req.body,
      user: req.user._id
      // ⚡ warrantyCode se genera automáticamente
    };

    const warranty = new Warranty(warrantyData);
    await warranty.save();
    await warranty.populate('user', 'firstName lastName email');

    res.status(201).json({
      success: true,
      message: 'Warranty created successfully',
      data: { warranty }
    });
  } catch (error) {
    console.error('Create warranty error:', error);

    // Manejo de duplicados por si ocurre algo raro
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Duplicate warranty code, please try again' });
    }

    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};


// Obtener todas las garantías del usuario
export const getUserWarranties = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = { user: req.user._id };
    if (req.query.status) filter.status = req.query.status;
    if (req.query.search) {
      const regex = new RegExp(req.query.search, 'i');
      filter.$or = FRONT_FIELDS.map(field => ({ [field]: regex }));
    }

    let sort = { createdAt: -1 };
    if (req.query.sortBy) {
      const order = req.query.sortOrder === 'asc' ? 1 : -1;
      sort = { [req.query.sortBy]: order };
    }

    const warranties = await Warranty.find(filter)
      .populate('user', 'firstName lastName email')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Warranty.countDocuments(filter);

    res.json({
      success: true,
      data: {
        warranties,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) }
      }
    });
  } catch (error) {
    console.error('Get user warranties error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Obtener garantía por ID
export const getWarrantyById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) 
      return res.status(400).json({ success: false, message: 'Invalid warranty ID' });

    const warranty = await Warranty.findById(id)
      .populate('user', 'firstName lastName email')
      .populate('assignedTo', 'firstName lastName email');

    if (!warranty) return res.status(404).json({ success: false, message: 'Warranty not found' });
    if (warranty.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') 
      return res.status(403).json({ success: false, message: 'Access denied' });

    res.json({ success: true, data: { warranty } });
  } catch (error) {
    console.error('Get warranty by ID error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Actualizar garantía
export const updateWarranty = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) 
      return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) 
      return res.status(400).json({ success: false, message: 'Invalid warranty ID' });

    const warranty = await Warranty.findById(id);
    if (!warranty) return res.status(404).json({ success: false, message: 'Warranty not found' });
    if (warranty.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') 
      return res.status(403).json({ success: false, message: 'Access denied' });

    FRONT_FIELDS.forEach(field => {
      if (req.body[field] !== undefined) warranty[field] = req.body[field];
    });

    await warranty.save();
    await warranty.populate('user', 'firstName lastName email');
    await warranty.populate('assignedTo', 'firstName lastName email');

    res.json({
      success: true,
      message: 'Warranty updated successfully',
      data: { warranty }
    });
  } catch (error) {
    console.error('Update warranty error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// controllers/warrantyController.js
export const getAllWarranties = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.search) {
      const regex = new RegExp(req.query.search, 'i');
      filter.$or = FRONT_FIELDS.map(field => ({ [field]: regex }));
    }

    const warranties = await Warranty.find(filter)
      .populate('user', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Warranty.countDocuments(filter);

    res.json({
      success: true,
      data: {
        warranties,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) }
      }
    });
  } catch (error) {
    console.error('Get all warranties error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};


// Eliminar garantía
export const deleteWarranty = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) 
      return res.status(400).json({ success: false, message: 'Invalid warranty ID' });

    const warranty = await Warranty.findById(id);
    if (!warranty) return res.status(404).json({ success: false, message: 'Warranty not found' });
    if (warranty.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') 
      return res.status(403).json({ success: false, message: 'Access denied' });

    if (req.user.role !== 'admin' && warranty.status !== 'pending') 
      return res.status(400).json({ success: false, message: 'Cannot delete warranty that is no longer pending' });

    await Warranty.findByIdAndDelete(id);
    res.json({ success: true, message: 'Warranty deleted successfully' });
  } catch (error) {
    console.error('Delete warranty error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Obtener estadísticas de garantías del usuario
export const getUserWarrantyStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const stats = await Warranty.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
          inReview: { $sum: { $cond: [{ $eq: ['$status', 'in_review'] }, 1, 0] } },
          approved: { $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] } },
          rejected: { $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] } },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
          cancelled: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } }
        }
      }
    ]);

    const seriesStats = await Warranty.aggregate([
      { $match: { user: userId } },
      { $group: { _id: '$productSeries', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        overview: stats[0] || { total:0, pending:0, inReview:0, approved:0, rejected:0, completed:0, cancelled:0 },
        byProductSeries: seriesStats
      }
    });
  } catch (error) {
    console.error('Get user warranty stats error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
