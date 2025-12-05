import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import './ProjectPage.css';

const ProjectPage = ({ user, onLogout }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    deadline: '',
    status: 'pending'
  });
  const [gradeData, setGradeData] = useState({
    grade: '',
    feedback: ''
  });

  useEffect(() => {
    fetchProject();
  }, [id]);

  const fetchProject = async () => {
    try {
      const { data } = await api.get(`/projects/${id}`);
      setProject(data.data);
      if (data.data.grade) {
        setGradeData({
          grade: data.data.grade,
          feedback: data.data.feedback || ''
        });
      }
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch project');
      setLoading(false);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    try {
      const updatedTasks = [...(project.tasks || []), newTask];
      await api.put(`/projects/${id}`, { tasks: updatedTasks });
      setShowTaskModal(false);
      setNewTask({ title: '', description: '', deadline: '', status: 'pending' });
      fetchProject();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add task');
    }
  };

  const handleUpdateTaskStatus = async (taskIndex, newStatus) => {
    try {
      const updatedTasks = [...project.tasks];
      updatedTasks[taskIndex].status = newStatus;
      if (newStatus === 'completed') {
        updatedTasks[taskIndex].progress = 100;
      }
      await api.put(`/projects/${id}`, { tasks: updatedTasks });
      fetchProject();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update task');
    }
  };

  const handleUpdateTaskProgress = async (taskIndex, progress) => {
    try {
      const updatedTasks = [...project.tasks];
      updatedTasks[taskIndex].progress = parseInt(progress);
      await api.put(`/projects/${id}`, { tasks: updatedTasks });
      fetchProject();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update progress');
    }
  };

  const handleSubmitProject = async () => {
    if (!window.confirm('Are you sure you want to submit this project?')) return;
    
    try {
      await api.put(`/projects/${id}`, { status: 'submitted' });
      fetchProject();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit project');
    }
  };

  const handleGradeProject = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/projects/${id}`, {
        grade: parseInt(gradeData.grade),
        feedback: gradeData.feedback,
        status: 'in_review'
      });
      setShowGradeModal(false);
      fetchProject();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to grade project');
    }
  };

  const handleApproveProject = async () => {
    try {
      await api.put(`/projects/${id}`, { status: 'approved' });
      fetchProject();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve project');
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile) {
      alert('Please select a file');
      return;
    }

    const formData = new FormData();
    formData.append('file', uploadFile);

    try {
      await api.post(`/projects/${id}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUploadFile(null);
      fetchProject();
      alert('File uploaded successfully');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to upload file');
    }
  };

  const handleExportXML = async () => {
    try {
      const response = await api.get(`/projects/${id}/export-xml`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `project-${id}.xml`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Failed to export XML');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: '#6c757d',
      assigned: '#17a2b8',
      submitted: '#ffc107',
      in_review: '#fd7e14',
      approved: '#28a745',
      rejected: '#dc3545',
      pending: '#6c757d',
      in_progress: '#17a2b8',
      completed: '#28a745'
    };
    return colors[status] || '#6c757d';
  };

  if (loading) return <div className="loading">Loading project...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!project) return <div className="error">Project not found</div>;

  const isStudent = user?.role === 'student';
  const isTeacher = user?.role === 'teacher' || user?.role === 'admin';
  const canEdit = isStudent && (project.status === 'draft' || project.status === 'assigned');

  return (
    <div className="project-page">
      {/* Header */}
      <header className="project-header">
        <div className="header-content">
          <button onClick={() => navigate('/dashboard')} className="btn-back">
            ← Back to Dashboard
          </button>
          <div className="user-info">
            <span className="user-name">{user?.name}</span>
            <button onClick={onLogout} className="btn-logout">Logout</button>
          </div>
        </div>
      </header>

      {/* Project Details */}
      <main className="project-main">
        <div className="project-title-section">
          <div>
            <h1>{project.title}</h1>
            <span 
              className="status-badge" 
              style={{ backgroundColor: getStatusColor(project.status) }}
            >
              {project.status.replace('_', ' ').toUpperCase()}
            </span>
          </div>
          <div className="project-actions-top">
            <button onClick={handleExportXML} className="btn-secondary">
              Export XML
            </button>
            {isTeacher && (
              <button onClick={() => setShowGradeModal(true)} className="btn-primary">
                Grade Project
              </button>
            )}
            {canEdit && (
              <button onClick={handleSubmitProject} className="btn-success">
                Submit Project
              </button>
            )}
          </div>
        </div>

        {/* Project Info Grid */}
        <div className="info-grid">
          <div className="info-card">
            <h3>Description</h3>
            <p>{project.description}</p>
          </div>

          <div className="info-card">
            <h3>Project Details</h3>
            <div className="detail-row">
              <strong>Classroom:</strong>
              <span>{project.classroom || 'N/A'}</span>
            </div>
            <div className="detail-row">
              <strong>Student:</strong>
              <span>{project.studentId?.name || 'Unassigned'}</span>
            </div>
            <div className="detail-row">
              <strong>Teacher:</strong>
              <span>{project.teacherId?.name || 'N/A'}</span>
            </div>
            {project.grade !== undefined && project.grade !== null && (
              <div className="detail-row">
                <strong>Grade:</strong>
                <span className="grade-display">{project.grade}/100</span>
              </div>
            )}
            {project.submittedAt && (
              <div className="detail-row">
                <strong>Submitted:</strong>
                <span>{new Date(project.submittedAt).toLocaleDateString()}</span>
              </div>
            )}
          </div>

          {project.feedback && (
            <div className="info-card feedback-card">
              <h3>Teacher Feedback</h3>
              <p>{project.feedback}</p>
            </div>
          )}
        </div>

        {/* Tasks Section */}
        <div className="tasks-section">
          <div className="section-header">
            <h2>Tasks ({project.tasks?.length || 0})</h2>
            {canEdit && (
              <button onClick={() => setShowTaskModal(true)} className="btn-primary">
                + Add Task
              </button>
            )}
          </div>

          {project.tasks && project.tasks.length > 0 ? (
            <div className="tasks-list">
              {project.tasks.map((task, index) => (
                <div key={index} className="task-card">
                  <div className="task-header">
                    <h3>{task.title}</h3>
                    <span 
                      className="status-badge small"
                      style={{ backgroundColor: getStatusColor(task.status) }}
                    >
                      {task.status.replace('_', ' ')}
                    </span>
                  </div>
                  
                  {task.description && (
                    <p className="task-description">{task.description}</p>
                  )}

                  <div className="task-details">
                    {task.deadline && (
                      <div className="task-detail">
                        <strong>Deadline:</strong>
                        <span>{new Date(task.deadline).toLocaleDateString()}</span>
                      </div>
                    )}
                    
                    <div className="task-progress">
                      <div className="progress-header">
                        <strong>Progress:</strong>
                        <span>{task.progress || 0}%</span>
                      </div>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill"
                          style={{ width: `${task.progress || 0}%` }}
                        />
                      </div>
                      {canEdit && (
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={task.progress || 0}
                          onChange={(e) => handleUpdateTaskProgress(index, e.target.value)}
                          className="progress-slider"
                        />
                      )}
                    </div>

                    {canEdit && (
                      <div className="task-actions">
                        <select
                          value={task.status}
                          onChange={(e) => handleUpdateTaskStatus(index, e.target.value)}
                          className="status-select"
                        >
                          <option value="pending">Pending</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No tasks added yet. {canEdit && 'Add your first task!'}</p>
            </div>
          )}
        </div>

        {/* Files Section */}
        <div className="files-section">
          <h2>Files ({project.files?.length || 0})</h2>
          
          <form onSubmit={handleFileUpload} className="upload-form">
            <input
              type="file"
              onChange={(e) => setUploadFile(e.target.files[0])}
              accept=".pdf,.xml"
            />
            <button type="submit" className="btn-primary">Upload</button>
          </form>

          {project.files && project.files.length > 0 && (
            <div className="files-list">
              {project.files.map((file) => (
                <div key={file._id} className="file-item">
                  <span>📄 {file.originalName}</span>
                  <a 
                    href={`${api.defaults.baseURL.replace('/api', '')}/projects/${id}/files/${file._id}`}
                    className="btn-download"
                    download
                  >
                    Download
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Add Task Modal */}
      {showTaskModal && (
        <div className="modal-overlay" onClick={() => setShowTaskModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Task</h2>
              <button onClick={() => setShowTaskModal(false)} className="btn-close">×</button>
            </div>
            
            <form onSubmit={handleAddTask}>
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label>Deadline</label>
                <input
                  type="date"
                  value={newTask.deadline}
                  onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
                />
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowTaskModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Add Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Grade Modal */}
      {showGradeModal && isTeacher && (
        <div className="modal-overlay" onClick={() => setShowGradeModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Grade Project</h2>
              <button onClick={() => setShowGradeModal(false)} className="btn-close">×</button>
            </div>
            
            <form onSubmit={handleGradeProject}>
              <div className="form-group">
                <label>Grade (0-100) *</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={gradeData.grade}
                  onChange={(e) => setGradeData({ ...gradeData, grade: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Feedback</label>
                <textarea
                  value={gradeData.feedback}
                  onChange={(e) => setGradeData({ ...gradeData, feedback: e.target.value })}
                  rows="4"
                  placeholder="Provide feedback for the student..."
                />
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowGradeModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Submit Grade
                </button>
                {project.status === 'in_review' && (
                  <button 
                    type="button" 
                    onClick={handleApproveProject}
                    className="btn-success"
                  >
                    Approve Project
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectPage;