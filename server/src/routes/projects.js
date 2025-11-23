const express = require('express');
const { body } = require('express-validator');
const {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  exportProjectXML,
  importProjectXML
} = require('../controllers/projectController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Validation middleware
const projectValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required')
];

// Import XML route (must be before /:id routes)
router.post('/import-xml', protect, importProjectXML);

// Main routes
router.route('/')
  .get(protect, getProjects)
  .post(protect, projectValidation, createProject);

// ID-specific routes
router.route('/:id')
  .get(protect, getProject)
  .put(protect, updateProject)
  .delete(protect, authorize('student', 'admin'), deleteProject);

// Export XML route
router.get('/:id/export-xml', protect, exportProjectXML);

module.exports = router;