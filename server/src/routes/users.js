const express = require('express');
const { getUsers, getUser, updateUser, deleteUser, getStudents } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/students', protect, authorize('teacher', 'admin'), getStudents);
router.route('/').get(protect, authorize('teacher', 'admin'), getUsers);
router.route('/:id').get(protect, authorize('admin'), getUser).put(protect, authorize('admin'), updateUser).delete(protect, authorize('admin'), deleteUser);

module.exports = router;