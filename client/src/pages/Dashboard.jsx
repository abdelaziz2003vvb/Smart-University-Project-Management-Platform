import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import './Dashboard.css';

const Dashboard = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    classroom: '',
    studentId: ''
  });

  useEffect(() => {
    fetchProjects();
    if (user?.role === 'teacher' || user?.role === 'admin') {
      fetchStudents();
    }
  }, [user]);

  const fetchProjects = async () => {
    try {
      const { data } = await api.get('/projects');
      setProjects(data.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch projects');
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const { data } = await api.get('/users/students');
      setUsers(data.data);
    } catch (err) {
      console.error('Failed to fetch students:', err);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      await api.post('/projects', newProject);
      setShowCreateModal(false);
      setNewProject({ title: '', description: '', classroom: '', studentId: '' });
      fetchProjects();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create project');
    }
  };

  const handleDeleteProject = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    
    try {
      await api.delete(`/projects/${id}`);
      fetchProjects();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete project');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: '#6c757d',
      assigned: '#17a2b8',
      submitted: '#ffc107',
      in_review: '#fd7e14',
      approved: '#28a745',
      rejected: '#dc3545'
    };
    return colors[status] || '#6c757d';
  };

  const getStatusBadge = (status) => (
    <span className="status-badge" style={{ backgroundColor: getStatusColor(status) }}>
      {status.replace('_', ' ').toUpperCase()}
    </span>
  );

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading">Loading projects...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <h1>🎓 Smart University Platform</h1>
          <div className="user-info">
            <span className="user-name">{user?.name}</span>
            <span className="user-role">{user?.role}</span>
            <button onClick={onLogout} className="btn-logout">Logout</button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-main">
        <div className="dashboard-actions">
          <h2>Projects Dashboard</h2>
          {(user?.role === 'teacher' || user?.role === 'admin') && (
            <button 
              onClick={() => setShowCreateModal(true)} 
              className="btn-primary"
            >
              + Create New Project
            </button>
          )}
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {/* Statistics Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Projects</h3>
            <p className="stat-number">{projects.length}</p>
          </div>
          <div className="stat-card">
            <h3>In Progress</h3>
            <p className="stat-number">
              {projects.filter(p => p.status === 'assigned' || p.status === 'draft').length}
            </p>
          </div>
          <div className="stat-card">
            <h3>Submitted</h3>
            <p className="stat-number">
              {projects.filter(p => p.status === 'submitted').length}
            </p>
          </div>
          <div className="stat-card">
            <h3>Approved</h3>
            <p className="stat-number">
              {projects.filter(p => p.status === 'approved').length}
            </p>
          </div>
        </div>

        {/* Projects List */}
        <div className="projects-list">
          {projects.length === 0 ? (
            <div className="empty-state">
              <p>No projects found. {(user?.role === 'teacher' || user?.role === 'admin') && 'Create your first project!'}</p>
            </div>
          ) : (
            <div className="projects-grid">
              {projects.map((project) => (
                <div key={project._id} className="project-card">
                  <div className="project-header">
                    <h3>{project.title}</h3>
                    {getStatusBadge(project.status)}
                  </div>
                  
                  <p className="project-description">{project.description}</p>
                  
                  <div className="project-meta">
                    {project.classroom && (
                      <div className="meta-item">
                        <strong>Classroom:</strong> {project.classroom}
                      </div>
                    )}
                    {project.studentId && (
                      <div className="meta-item">
                        <strong>Student:</strong> {project.studentId.name}
                      </div>
                    )}
                    {project.teacherId && (
                      <div className="meta-item">
                        <strong>Teacher:</strong> {project.teacherId.name}
                      </div>
                    )}
                    {project.grade !== undefined && project.grade !== null && (
                      <div className="meta-item">
                        <strong>Grade:</strong> {project.grade}/100
                      </div>
                    )}
                  </div>

                  {project.tasks && project.tasks.length > 0 && (
                    <div className="project-tasks">
                      <strong>Tasks:</strong> {project.tasks.length} 
                      <span className="tasks-completed">
                        ({project.tasks.filter(t => t.status === 'completed').length} completed)
                      </span>
                    </div>
                  )}

                  <div className="project-actions">
                    <button 
                      onClick={() => navigate(`/projects/${project._id}`)}
                      className="btn-view"
                    >
                      View Details
                    </button>
                    {user?.role === 'admin' && (
                      <button 
                        onClick={() => handleDeleteProject(project._id)}
                        className="btn-delete"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create New Project</h2>
              <button onClick={() => setShowCreateModal(false)} className="btn-close">×</button>
            </div>
            
            <form onSubmit={handleCreateProject}>
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  value={newProject.title}
                  onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Description *</label>
                <textarea
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  required
                  rows="4"
                />
              </div>

              <div className="form-group">
                <label>Classroom</label>
                <input
                  type="text"
                  value={newProject.classroom}
                  onChange={(e) => setNewProject({ ...newProject, classroom: e.target.value })}
                  placeholder="e.g., CS401"
                />
              </div>

              <div className="form-group">
                <label>Assign to Student</label>
                <select
                  value={newProject.studentId}
                  onChange={(e) => setNewProject({ ...newProject, studentId: e.target.value })}
                >
                  <option value="">-- Select Student (Optional) --</option>
                  {users.map((student) => (
                    <option key={student._id} value={student._id}>
                      {student.name} ({student.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;