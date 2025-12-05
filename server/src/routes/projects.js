const express = require('express');
const { body } = require('express-validator');
const {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  exportProjectXML,
  importProjectXML,
  uploadFile,
  downloadFile,
  getProjectsByClassroom
} = require('../controllers/projectController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

const projectValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required')
];

router.route('/').get(protect, getProjects).post(protect, authorize('teacher', 'admin'), projectValidation, createProject);
router.post('/import-xml', protect, authorize('teacher', 'admin'), importProjectXML);
router.get('/classroom/:classroom', protect, getProjectsByClassroom);
router.post('/:id/upload', protect, upload.single('file'), uploadFile);
router.get('/:id/files/:fileId', protect, downloadFile);
router.route('/:id').get(protect, getProject).put(protect, updateProject).delete(protect, authorize('admin'), deleteProject);
router.get('/:id/export-xml', protect, exportProjectXML);

module.exports = router;