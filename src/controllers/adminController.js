import { validationResult } from 'express-validator';
import { Warranty, User } from '../models/index.js';
import mongoose from 'mongoose';

// Get all warranties with advanced search and pagination
export const getAllWarranties = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = {};
    
    // Status filter
    if (req.query.status) {
      filter.status = req.query.status;
    }
    
    // Priority filter
    if (req.query.priority) {
      filter.priority = req.query.priority;
    }
    
    // Category filter
    if (req.query.category) {
      filter.category = req.query.category;
    }
    
    // Warranty type filter
    if (req.query.warrantyType) {
      filter.warrantyType = req.query.warrantyType;
    }
    
    // Date range filters
    if (req.query.startDate || req.query.endDate) {
      filter.submittedAt = {};
      if (req.query.startDate) {
        filter.submittedAt.$gte = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        filter.submittedAt.$lte = new Date(req.query.endDate);
      }
    }
    
    // Assigned to filter
    if (req.query.assignedTo) {
      filter.assignedTo = req.query.assignedTo;
    }
    
    // Unassigned filter
    if (req.query.unassigned === 'true') {
      filter.assignedTo = null;
    }

    // Advanced search functionality
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      filter.$or = [
        { productName: searchRegex },
        { productBrand: searchRegex },
        { productModel: searchRegex },
        { serialNumber: searchRegex },
        { retailer: searchRegex },
        { issueDescription: searchRegex },
        { adminNotes: searchRegex },
        { resolution: searchRegex }
      ];
    }

    // Build sort object
    let sort = { submittedAt: -1 }; // Default sort by submission date
    if (req.query.sortBy) {
      const sortField = req.query.sortBy;
      const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
      sort = { [sortField]: sortOrder };
    }

    // Execute query with pagination
    const warranties = await Warranty.find(filter)
      .populate('user', 'firstName lastName email')
      .populate('assignedTo', 'firstName lastName email')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await Warranty.countDocuments(filter);

    res.json({
      success: true,
      data: {
        warranties,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get all warranties error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update warranty status and admin fields
export const updateWarrantyStatus = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid warranty ID'
      });
    }

    const warranty = await Warranty.findById(id);

    if (!warranty) {
      return res.status(404).json({
        success: false,
        message: 'Warranty not found'
      });
    }

    // Update warranty with admin data
    Object.assign(warranty, req.body);

    // If assigning to someone, validate the user exists and is admin
    if (req.body.assignedTo) {
      const assignedUser = await User.findById(req.body.assignedTo);
      if (!assignedUser || assignedUser.role !== 'admin') {
        return res.status(400).json({
          success: false,
          message: 'Invalid assigned user - must be an admin'
        });
      }
    }

    await warranty.save();
    await warranty.populate('user', 'firstName lastName email');
    await warranty.populate('assignedTo', 'firstName lastName email');

    res.json({
      success: true,
      message: 'Warranty updated successfully',
      data: { warranty }
    });
  } catch (error) {
    console.error('Update warranty status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Assign warranty to admin
export const assignWarranty = async (req, res) => {
  try {
    const { id } = req.params;
    const { assignedTo } = req.body;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid warranty ID'
      });
    }

    const warranty = await Warranty.findById(id);

    if (!warranty) {
      return res.status(404).json({
        success: false,
        message: 'Warranty not found'
      });
    }

    // Validate assigned user
    if (assignedTo) {
      const assignedUser = await User.findById(assignedTo);
      if (!assignedUser || assignedUser.role !== 'admin') {
        return res.status(400).json({
          success: false,
          message: 'Invalid assigned user - must be an admin'
        });
      }
    }

    warranty.assignedTo = assignedTo || null;
    await warranty.save();
    await warranty.populate('user', 'firstName lastName email');
    await warranty.populate('assignedTo', 'firstName lastName email');

    res.json({
      success: true,
      message: assignedTo ? 'Warranty assigned successfully' : 'Warranty unassigned successfully',
      data: { warranty }
    });
  } catch (error) {
    console.error('Assign warranty error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get comprehensive admin statistics
export const getAdminStats = async (req, res) => {
  try {
    // Overall warranty statistics
    const overallStats = await Warranty.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
          inReview: { $sum: { $cond: [{ $eq: ['$status', 'in_review'] }, 1, 0] } },
          approved: { $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] } },
          rejected: { $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] } },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
          cancelled: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } },
          unassigned: { $sum: { $cond: [{ $eq: ['$assignedTo', null] }, 1, 0] } },
          avgPurchasePrice: { $avg: '$purchasePrice' }
        }
      }
    ]);

    // Status distribution
    const statusStats = await Warranty.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Priority distribution
    const priorityStats = await Warranty.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Category distribution
    const categoryStats = await Warranty.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          avgPrice: { $avg: '$purchasePrice' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Monthly submission trends (last 12 months)
    const monthlyStats = await Warranty.aggregate([
      {
        $match: {
          submittedAt: {
            $gte: new Date(new Date().setMonth(new Date().getMonth() - 12))
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$submittedAt' },
            month: { $month: '$submittedAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Top brands by warranty claims
    const brandStats = await Warranty.aggregate([
      {
        $group: {
          _id: '$productBrand',
          count: { $sum: 1 },
          avgPrice: { $avg: '$purchasePrice' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Admin workload (warranties assigned to each admin)
    const adminWorkload = await Warranty.aggregate([
      {
        $match: { assignedTo: { $ne: null } }
      },
      {
        $group: {
          _id: '$assignedTo',
          count: { $sum: 1 },
          pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
          inReview: { $sum: { $cond: [{ $eq: ['$status', 'in_review'] }, 1, 0] } }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'admin'
        }
      },
      {
        $unwind: '$admin'
      },
      {
        $project: {
          adminName: { $concat: ['$admin.firstName', ' ', '$admin.lastName'] },
          adminEmail: '$admin.email',
          totalAssigned: '$count',
          pendingCount: '$pending',
          inReviewCount: '$inReview'
        }
      },
      { $sort: { totalAssigned: -1 } }
    ]);

    // User statistics
    const userStats = await User.aggregate([
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          activeUsers: { $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] } },
          adminUsers: { $sum: { $cond: [{ $eq: ['$role', 'admin'] }, 1, 0] } },
          regularUsers: { $sum: { $cond: [{ $eq: ['$role', 'user'] }, 1, 0] } },
          googleUsers: { $sum: { $cond: [{ $ne: ['$googleId', null] }, 1, 0] } }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        overview: overallStats[0] || {
          total: 0, pending: 0, inReview: 0, approved: 0,
          rejected: 0, completed: 0, cancelled: 0, unassigned: 0,
          avgPurchasePrice: 0
        },
        statusDistribution: statusStats,
        priorityDistribution: priorityStats,
        categoryDistribution: categoryStats,
        monthlyTrends: monthlyStats,
        topBrands: brandStats,
        adminWorkload: adminWorkload,
        userStats: userStats[0] || {
          totalUsers: 0, activeUsers: 0, adminUsers: 0,
          regularUsers: 0, googleUsers: 0
        }
      }
    });
  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get all admin users
export const getAdminUsers = async (req, res) => {
  try {
    const admins = await User.find({ role: 'admin', isActive: true })
      .select('firstName lastName email lastLogin createdAt')
      .sort({ firstName: 1 });

    res.json({
      success: true,
      data: { admins }
    });
  } catch (error) {
    console.error('Get admin users error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get warranties assigned to current admin
export const getMyAssignedWarranties = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = { assignedTo: req.user._id };
    
    // Add status filter if provided
    if (req.query.status) {
      filter.status = req.query.status;
    }

    // Build sort object
    let sort = { submittedAt: -1 };
    if (req.query.sortBy) {
      const sortField = req.query.sortBy;
      const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
      sort = { [sortField]: sortOrder };
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
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get my assigned warranties error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Bulk update warranties
export const bulkUpdateWarranties = async (req, res) => {
  try {
    const { warrantyIds, updateData } = req.body;

    if (!warrantyIds || !Array.isArray(warrantyIds) || warrantyIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Warranty IDs array is required'
      });
    }

    if (!updateData || Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Update data is required'
      });
    }

    // Validate all warranty IDs
    const invalidIds = warrantyIds.filter(id => !mongoose.Types.ObjectId.isValid(id));
    if (invalidIds.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid warranty IDs found',
        invalidIds
      });
    }

    // Perform bulk update
    const result = await Warranty.updateMany(
      { _id: { $in: warrantyIds } },
      updateData
    );

    res.json({
      success: true,
      message: `Successfully updated ${result.modifiedCount} warranties`,
      data: {
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount
      }
    });
  } catch (error) {
    console.error('Bulk update warranties error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

