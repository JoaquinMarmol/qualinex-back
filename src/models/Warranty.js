import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const warrantySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  
  country: {
    type: String,
    required: [true, 'Country is required'],
    trim: true
  },
  constructionShop: { type: String, trim: true },
  carColour: { type: String, trim: true },
  licensePlate: { type: String, required: [true, 'License plate is required'], trim: true },
  carModel: { type: String, trim: true },
  productSeries: { type: String, trim: true },
  applicationDate: { type: Date },
  contactNumber: { type: String, trim: true },
  detailTechnician: { type: String, trim: true },
  filmCoreSerial: { type: String, trim: true },

  // ⚡ Nuevo campo warrantyCode
  warrantyCode: {
    type: String,
    unique: true,
    sparse: true,
    default: () => uuidv4()
  },

  status: {
    type: String,
    enum: ['pending', 'in_review', 'approved', 'rejected', 'completed', 'cancelled'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  adminNotes: { type: String, trim: true },
  resolution: { type: String, trim: true },
  tags: [{ type: String, trim: true }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices
warrantySchema.index({ user: 1 });
warrantySchema.index({ status: 1 });
warrantySchema.index({ productSeries: 1 });
warrantySchema.index({ licensePlate: 1 });

// Virtual
warrantySchema.virtual('daysSinceSubmission').get(function() {
  const diff = new Date() - this.createdAt;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
});

const Warranty = mongoose.model('Warranty', warrantySchema);
export default Warranty;
