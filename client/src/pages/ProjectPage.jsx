import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  LinearProgress,
  AppBar,
  Toolbar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
} from '@mui/material';
import {
  ArrowBack,
  Edit as EditIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import api from '../api/axios';

const ProjectPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openTaskDialog, setOpenTaskDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    deadline: '',
    progress: 0,
    status: 'pending',
  });
  const [editData, setEditData] = useState({
    status: '',
    grade: '',
    feedback: '',
  });

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    setUser(userData);
    fetchProject();
  }, [id]);

  const fetchProject = async () => {
    try {
      const response = await api.get(`/projects/${id}`);
      setProject(response.data.data);
      setEditData({
        status: response.data.data.status,
        grade: response.data.data.grade || '',
        feedback: response.data.data.feedback || '',
      });
    } catch (err) {
      setError('Failed to fetch project');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async () => {
    try {
      const updatedTasks = [...project.tasks, newTask];
      await api.put(`/projects/${id}`, { tasks: updatedTasks });
      setOpenTaskDialog(false);
      setNewTask({
        title: '',
        description: '',
        deadline: '',
        progress: 0,
        status: 'pending',
      });
      fetchProject();
    } catch (err) {
      setError('Failed to add task');
    }
  };

  const handleUpdateProject = async () => {
    try {
      await api.put(`/projects/${id}`, editData);
      setOpenEditDialog(false);
      fetchProject();
    } catch (err) {
      setError('Failed to update project');
    }
  };

  const handleDeleteProject = async () => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await api.delete(`/projects/${id}`);
        navigate('/dashboard');
      } catch (err) {
        setError('Failed to delete project');
      }
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: 'default',
      pending: 'default',
      submitted: 'primary',
      in_progress: 'info',
      in_review: 'warning',
      approved: 'success',
      completed: 'success',
      rejected: 'error',
    };
    return colors[status] || 'default';
  };

  if (loading) return <Typography>Loading...</Typography>;
  if (!project) return <Typography>Project not found</Typography>;

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <IconButton color="inherit" onClick={() => navigate('/dashboard')}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Project Details
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h4">{project.title}</Typography>
            <Box>
              {(user?.role === 'teacher' || user?.role === 'admin') && (
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={() => setOpenEditDialog(true)}
                  sx={{ mr: 1 }}
                >
                  Edit
                </Button>
              )}
              {(user?.role === 'student' || user?.role === 'admin') && (
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={handleDeleteProject}
                >
                  Delete
                </Button>
              )}
            </Box>
          </Box>

          <Typography variant="body1" paragraph>
            {project.description}
          </Typography>

          <Box sx={{ mb: 2 }}>
            <Chip
              label={project.status.replace('_', ' ').toUpperCase()}
              color={getStatusColor(project.status)}
              sx={{ mr: 1 }}
            />
            {project.grade && (
              <Chip label={`Grade: ${project.grade}/100`} color="success" />
            )}
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">
                <strong>Student:</strong> {project.studentId?.name}
              </Typography>
            </Grid>
            {project.teacherId && (
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">
                  <strong>Teacher:</strong> {project.teacherId?.name}
                </Typography>
              </Grid>
            )}
          </Grid>

          {project.feedback && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                Feedback:
              </Typography>
              <Typography variant="body2">{project.feedback}</Typography>
            </Box>
          )}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h5">Tasks</Typography>
          {user?.role === 'student' && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenTaskDialog(true)}
            >
              Add Task
            </Button>
          )}
        </Box>

        <Grid container spacing={2}>
          {project.tasks?.map((task, index) => (
            <Grid item xs={12} key={index}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="h6">{task.title}</Typography>
                    <Chip
                      label={task.status.replace('_', ' ').toUpperCase()}
                      color={getStatusColor(task.status)}
                      size="small"
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {task.description}
                  </Typography>
                  {task.deadline && (
                    <Typography variant="body2" color="text.secondary">
                      Deadline: {new Date(task.deadline).toLocaleDateString()}
                    </Typography>
                  )}
                  <Box sx={{ mt: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Progress</Typography>
                      <Typography variant="body2">{task.progress}%</Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={task.progress}
                      color={task.progress === 100 ? 'success' : 'primary'}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Add Task Dialog */}
      <Dialog open={openTaskDialog} onClose={() => setOpenTaskDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Task</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Task Title"
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Description"
            value={newTask.description}
            onChange={(e) =>
              setNewTask({ ...newTask, description: e.target.value })
            }
            margin="normal"
            multiline
            rows={3}
          />
          <TextField
            fullWidth
            label="Deadline"
            type="date"
            value={newTask.deadline}
            onChange={(e) =>
              setNewTask({ ...newTask, deadline: e.target.value })
            }
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            fullWidth
            label="Progress"
            type="number"
            value={newTask.progress}
            onChange={(e) =>
              setNewTask({ ...newTask, progress: parseInt(e.target.value) })
            }
            margin="normal"
            inputProps={{ min: 0, max: 100 }}
          />
          <TextField
            fullWidth
            select
            label="Status"
            value={newTask.status}
            onChange={(e) => setNewTask({ ...newTask, status: e.target.value })}
            margin="normal"
          >
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="in_progress">In Progress</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenTaskDialog(false)}>Cancel</Button>
          <Button onClick={handleAddTask} variant="contained">
            Add Task
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Project Dialog */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Project</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            select
            label="Status"
            value={editData.status}
            onChange={(e) => setEditData({ ...editData, status: e.target.value })}
            margin="normal"
          >
            <MenuItem value="draft">Draft</MenuItem>
            <MenuItem value="submitted">Submitted</MenuItem>
            <MenuItem value="in_review">In Review</MenuItem>
            <MenuItem value="approved">Approved</MenuItem>
            <MenuItem value="rejected">Rejected</MenuItem>
          </TextField>
          {(user?.role === 'teacher' || user?.role === 'admin') && (
            <>
              <TextField
                fullWidth
                label="Grade (0-100)"
                type="number"
                value={editData.grade}
                onChange={(e) =>
                  setEditData({ ...editData, grade: parseInt(e.target.value) })
                }
                margin="normal"
                inputProps={{ min: 0, max: 100 }}
              />
              <TextField
                fullWidth
                label="Feedback"
                value={editData.feedback}
                onChange={(e) =>
                  setEditData({ ...editData, feedback: e.target.value })
                }
                margin="normal"
                multiline
                rows={4}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
          <Button onClick={handleUpdateProject} variant="contained">
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ProjectPage;