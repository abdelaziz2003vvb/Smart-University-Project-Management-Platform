const Project = require('../models/Project');
const { buildProjectXML, parseProjectXML } = require('../utils/xmlHelper');

// @desc    Get all projects
// @route   GET /api/projects
// @access  Private
exports.getProjects = async (req, res) => {
  try {
    let query = {};

    // Students only see their own projects
    if (req.user.role === 'student') {
      query.studentId = req.user.id;
    }

    // Teachers see projects assigned to them
    if (req.user.role === 'teacher') {
      query.teacherId = req.user.id;
    }

    // Admins see all projects

    const projects = await Project.find(query)
      .populate('studentId', 'name email')
      .populate('teacherId', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: projects.length, data: projects });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Private
exports.getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('studentId', 'name email')
      .populate('teacherId', 'name email');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check authorization
    if (req.user.role === 'student' && project.studentId._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view this project' });
    }

    res.json({ success: true, data: project });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create new project
// @route   POST /api/projects
// @access  Private (Student, Teacher, Admin)
exports.createProject = async (req, res) => {
  try {
    const { title, description, tasks, teacherId } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: 'Please provide title and description' });
    }

    const projectData = {
      title,
      description,
      studentId: req.user.role === 'student' ? req.user.id : req.body.studentId,
      tasks: tasks || [],
      teacherId
    };

    const project = await Project.create(projectData);
    
    const populatedProject = await Project.findById(project._id)
      .populate('studentId', 'name email')
      .populate('teacherId', 'name email');

    res.status(201).json({ success: true, data: populatedProject });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private
exports.updateProject = async (req, res) => {
  try {
    let project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check authorization
    if (req.user.role === 'student' && project.studentId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this project' });
    }

    // Update fields
    const allowedUpdates = ['title', 'description', 'status', 'tasks', 'grade', 'feedback', 'teacherId'];
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        project[key] = req.body[key];
      }
    });

    // Set submitted date if status changes to submitted
    if (req.body.status === 'submitted' && project.status !== 'submitted') {
      project.submittedAt = new Date();
    }

    await project.save();

    project = await Project.findById(project._id)
      .populate('studentId', 'name email')
      .populate('teacherId', 'name email');

    res.json({ success: true, data: project });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private (Student owner, Admin)
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check authorization
    if (req.user.role === 'student' && project.studentId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this project' });
    }

    if (req.user.role === 'teacher') {
      return res.status(403).json({ message: 'Teachers cannot delete projects' });
    }

    await project.deleteOne();

    res.json({ success: true, message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Export project as XML
// @route   GET /api/projects/:id/export-xml
// @access  Private
exports.exportProjectXML = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('studentId', 'name email')
      .populate('teacherId', 'name email');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check authorization
    if (req.user.role === 'student' && project.studentId._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to export this project' });
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

// @desc    Import project from XML
// @route   POST /api/projects/import-xml
// @access  Private
exports.importProjectXML = async (req, res) => {
  try {
    const { xml } = req.body;

    if (!xml) {
      return res.status(400).json({ message: 'XML data is required' });
    }

    const projectData = await parseProjectXML(xml);

    // Set the current user as student
    projectData.studentId = req.user.id;

    const project = await Project.create(projectData);

    const populatedProject = await Project.findById(project._id)
      .populate('studentId', 'name email')
      .populate('teacherId', 'name email');

    res.status(201).json({ 
      success: true, 
      message: 'Project imported successfully', 
      data: populatedProject 
    });
  } catch (error) {
    console.error('Import XML error:', error);
    res.status(500).json({ message: 'Failed to import XML', error: error.message });
  }
};