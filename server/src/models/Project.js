const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: String,
  description: String,
  deadline: Date,
  progress: { type: Number, default: 0 },
  status: { type: String, enum: ['pending', 'in_progress', 'completed'], default: 'pending' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'users' }
}, { timestamps: true });

const fileSchema = new mongoose.Schema({
  filename: String,
  originalName: String,
  path: String,
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
  fileType: String,
  fileSize: Number,
  uploadedAt: { type: Date, default: Date.now }
});

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  classroom: String,
  // FIX: Added 'assigned' to the enum values
  status: { 
    type: String, 
    enum: ['draft', 'assigned', 'submitted', 'in_review', 'approved', 'rejected'], 
    default: 'draft' 
  },
  // FIX: Changed ref from 'User' to 'users' and made it not required by default
  studentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'users',
    default: null
  },
  teacherId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'users' 
  },
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'users',
    required: true
  },
  tasks: [taskSchema],
  files: [fileSchema],
  grade: { type: Number, min: 0, max: 100 },
  feedback: String,
  submittedAt: Date,
  xmlTemplate: String
}, { timestamps: true });

// Index for better query performance
projectSchema.index({ studentId: 1, status: 1 });
projectSchema.index({ teacherId: 1 });
projectSchema.index({ classroom: 1 });

module.exports = mongoose.model('projects', projectSchema);