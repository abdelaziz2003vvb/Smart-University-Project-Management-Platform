const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'projects', // Assuming 'projects' is the model name for Project.js
    required: true
  },
  deadline: {
    type: Date
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed'],
    default: 'pending'
  },
  // FIX 3: Change ref from 'User' to 'users' to match the registered model name.
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users' 
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  completedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for faster queries
taskSchema.index({ projectId: 1, status: 1 });
taskSchema.index({ assignedTo: 1 });

// Method to mark task as completed
taskSchema.methods.markAsCompleted = function() {
  this.status = 'completed';
  this.progress = 100;
  this.completedAt = new Date();
  return this.save();
};

// Static method to get tasks by project
taskSchema.statics.getByProject = function(projectId) {
  return this.find({ projectId })
    .populate('assignedTo', 'name email')
    .sort({ createdAt: -1 });
};

// Static method to get overdue tasks
taskSchema.statics.getOverdueTasks = function() {
  return this.find({
    deadline: { $lt: new Date() },
    status: { $ne: 'completed' }
  })
    .populate('projectId', 'title')
    .populate('assignedTo', 'name email')
    .sort({ deadline: 1 });
};

module.exports = mongoose.model('tasks', taskSchema);