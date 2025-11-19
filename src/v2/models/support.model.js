const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const SupportSchema = new mongoose.Schema(
  {
    support_id: {
      type: String,
      default: () => uuidv4(),
      unique: true,
      primaryKey: true,
    },
    user_id: {
      type: String,
      required: [true, 'User ID is required'],
      index: true,
    },
    userType: {
      type: String,
      enum: ['student', 'driver', 'admin'],
      required: [true, 'User type is required'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      maxlength: [200, 'Subject cannot exceed 200 characters'],
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      minlength: [10, 'Message must be at least 10 characters'],
      maxlength: [5000, 'Message cannot exceed 5000 characters'],
    },
    category: {
      type: String,
      enum: ['technical', 'payment', 'booking', 'general', 'complaint'],
      default: 'general',
    },
    status: {
      type: String,
      enum: ['open', 'in-progress', 'resolved', 'closed'],
      default: 'open',
      index: true,
    },
    attachments: [
      {
        type: String,
        filename: String,
        url: String,
      },
    ],
    response: {
      text: String,
      respondedBy: String,
      respondedAt: Date,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    resolution_time: {
      type: Number, // in hours
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    collection: 'supports',
  }
);

// Index for common queries
SupportSchema.index({ user_id: 1, status: 1 });
SupportSchema.index({ category: 1, status: 1 });
SupportSchema.index({ createdAt: -1 });

// Pre-save validation
SupportSchema.pre('save', async function (next) {
  if (!this.isNew) {
    // If status changed to resolved/closed, calculate resolution time
    const original = await mongoose.model('Support').findById(this._id);
    if (original && original.status !== this.status && (this.status === 'resolved' || this.status === 'closed')) {
      const diffInMs = Date.now() - this.createdAt;
      this.resolution_time = Math.ceil(diffInMs / (1000 * 60 * 60)); // Convert to hours
    }
  }
  next();
});

module.exports = mongoose.model('Support', SupportSchema);
