const Project = require('../models/Project');
const User = require('../models/User');
const { buildProjectXML, parseProjectXML } = require('../utils/xmlHelper');
const fs = require('fs');
const path = require('path');

// Get all projects
exports.getProjects = async (req, res) => {
  try {
    // FIX: Added safety check for req.user
    if (!req.user || !req.user.role) {
      return res.status(401).json({ message: 'Utilisateur non authentifié' });
    }

    let query = {};
    if (req.user.role === 'student') {
      query.studentId = req.user.id;
    }
    if (req.user.role === 'teacher') {
      query.$or = [{ teacherId: req.user.id }, { createdBy: req.user.id }];
    }
    if (req.query.classroom) {
      query.classroom = req.query.classroom;
    }
    
    const projects = await Project.find(query)
      .populate('studentId', 'name email role')
      .populate('teacherId', 'name email role')
      .populate('createdBy', 'name email role')
      .populate('tasks.assignedTo', 'name email')
      .sort({ createdAt: -1 });
      
    res.json({ success: true, count: projects.length, data: projects });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get single project
exports.getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('studentId', 'name email role')
      .populate('teacherId', 'name email role')
      .populate('createdBy', 'name email role')
      .populate('tasks.assignedTo', 'name email')
      .populate('files.uploadedBy', 'name email');
      
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    const isStudent = req.user.role === 'student' && project.studentId && project.studentId._id.toString() === req.user.id;
    const isTeacher = req.user.role === 'teacher' && ((project.teacherId && project.teacherId._id.toString() === req.user.id) || (project.createdBy && project.createdBy._id.toString() === req.user.id));
    const isAdmin = req.user.role === 'admin';
    
    if (!isStudent && !isTeacher && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to view this project' });
    }
    
    res.json({ success: true, data: project });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create new project (Teacher only)
exports.createProject = async (req, res) => {
  try {
    const { title, description, studentId, classroom, tasks, xmlTemplate } = req.body;
    
    if (!title || !description) {
      return res.status(400).json({ message: 'Please provide title and description' });
    }
    
    if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only teachers can create projects' });
    }
    
    // FIX: Validate studentId if provided
    if (studentId) {
      const student = await User.findById(studentId);
      if (!student || student.role !== 'student') {
        return res.status(400).json({ message: 'Invalid student ID' });
      }
    }
    
    const projectData = {
      title,
      description,
      createdBy: req.user.id,
      teacherId: req.user.id,
      studentId: studentId || null,
      classroom: classroom || null,
      status: studentId ? 'assigned' : 'draft', // FIX: Now 'assigned' is valid
      tasks: tasks || [],
      xmlTemplate: xmlTemplate || null
    };
    
    const project = await Project.create(projectData);
    
    const populatedProject = await Project.findById(project._id)
      .populate('studentId', 'name email role')
      .populate('teacherId', 'name email role')
      .populate('createdBy', 'name email role');
      
    res.status(201).json({ success: true, data: populatedProject });
  } catch (error) {
    console.error('Create project error:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update project
exports.updateProject = async (req, res) => {
  try {
    let project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    const isStudent = req.user.role === 'student' && project.studentId && project.studentId.toString() === req.user.id;
    const isTeacher = req.user.role === 'teacher' && ((project.teacherId && project.teacherId.toString() === req.user.id) || (project.createdBy && project.createdBy.toString() === req.user.id));
    const isAdmin = req.user.role === 'admin';
    
    if (!isStudent && !isTeacher && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to update this project' });
    }
    
    const allowedUpdates = req.user.role === 'student' 
      ? ['status', 'tasks'] 
      : ['title', 'description', 'status', 'tasks', 'grade', 'feedback', 'studentId', 'classroom', 'xmlTemplate'];
    
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        project[key] = req.body[key];
      }
    });
    
    if (req.body.status === 'submitted' && project.status !== 'submitted') {
      project.submittedAt = new Date();
    }
    
    await project.save();
    
    project = await Project.findById(project._id)
      .populate('studentId', 'name email role')
      .populate('teacherId', 'name email role')
      .populate('createdBy', 'name email role')
      .populate('tasks.assignedTo', 'name email');
      
    res.json({ success: true, data: project });
  } catch (error) {
    console.error('Update project error:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete project (Admin only)
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only administrators can delete projects' });
    }
    
    if (project.files && project.files.length > 0) {
      project.files.forEach(file => {
        const filePath = path.join(__dirname, '../../uploads', file.filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
    }
    
    await project.deleteOne();
    res.json({ success: true, message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Upload file to project
exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    const isStudent = req.user.role === 'student' && project.studentId && project.studentId.toString() === req.user.id;
    const isTeacher = req.user.role === 'teacher' && ((project.teacherId && project.teacherId.toString() === req.user.id) || (project.createdBy && project.createdBy.toString() === req.user.id));
    const isAdmin = req.user.role === 'admin';
    
    if (!isStudent && !isTeacher && !isAdmin) {
      fs.unlinkSync(req.file.path);
      return res.status(403).json({ message: 'Not authorized to upload files to this project' });
    }
    
    project.files.push({
      filename: req.file.filename,
      originalName: req.file.originalname,
      uploadedBy: req.user.id,
      fileType: req.file.mimetype,
      fileSize: req.file.size
    });
    
    await project.save();
    
    const updatedProject = await Project.findById(project._id).populate('files.uploadedBy', 'name email');
    res.json({ success: true, message: 'File uploaded successfully', data: updatedProject });
  } catch (error) {
    console.error('Upload file error:', error);
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Download file from project
exports.downloadFile = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    const file = project.files.id(req.params.fileId);
    
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }
    
    const filePath = path.join(__dirname, '../../uploads', file.filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found on server' });
    }
    
    res.download(filePath, file.originalName);
  } catch (error) {
    console.error('Download file error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Export project as XML
exports.exportProjectXML = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('studentId', 'name email')
      .populate('teacherId', 'name email')
      .populate('createdBy', 'name email');
      
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    const xml = buildProjectXML(project);
    res.set('Content-Type', 'application/xml');
    res.set('Content-Disposition', `attachment; filename="project-${project._id}.xml"`);
    res.send(xml);
  } catch (error) {
    console.error('Export XML error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Import project from XML
exports.importProjectXML = async (req, res) => {
  try {
    const { xml } = req.body;
    
    if (!xml) {
      return res.status(400).json({ message: 'XML data is required' });
    }
    
    if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only teachers can import projects' });
    }
    
    const projectData = await parseProjectXML(xml);
    projectData.createdBy = req.user.id;
    projectData.teacherId = req.user.id;
    
    const project = await Project.create(projectData);
    
    const populatedProject = await Project.findById(project._id)
      .populate('studentId', 'name email')
      .populate('teacherId', 'name email')
      .populate('createdBy', 'name email');
      
    res.status(201).json({ success: true, message: 'Project imported successfully', data: populatedProject });
  } catch (error) {
    console.error('Import XML error:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Failed to import XML', error: error.message });
  }
};

// Get projects by classroom
exports.getProjectsByClassroom = async (req, res) => {
  try {
    const { classroom } = req.params;
    let query = { classroom };
    
    if (req.user.role === 'student') {
      query.studentId = req.user.id;
    }
    
    const projects = await Project.find(query)
      .populate('studentId', 'name email role')
      .populate('teacherId', 'name email role')
      .populate('createdBy', 'name email role')
      .sort({ createdAt: -1 });
      
    res.json({ success: true, classroom, count: projects.length, data: projects });
  } catch (error) {
    console.error('Get classroom projects error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};