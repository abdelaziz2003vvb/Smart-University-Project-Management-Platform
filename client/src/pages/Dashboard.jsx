import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  Grid,
  Chip,
  AppBar,
  Toolbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Add as AddIcon,
  Logout as LogoutIcon,
  FileDownload as DownloadIcon,
  Upload as UploadIcon,
  AccountCircle,
} from '@mui/icons-material';
import api from '../api/axios';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openXmlDialog, setOpenXmlDialog] = useState(false);
  const [xmlData, setXmlData] = useState('');
  const [error, setError] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
  });

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    setUser(userData);
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await api.get('/projects');
      setProjects(response.data.data);
    } catch (err) {
      setError('Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const handleCreateProject = async () => {
    try {
      await api.post('/projects', newProject);
      setOpenDialog(false);
      setNewProject({ title: '', description: '' });
      fetchProjects();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create project');
    }
  };

  const handleImportXML = async () => {
    try {
      await api.post('/projects/import-xml', { xml: xmlData });
      setOpenXmlDialog(false);
      setXmlData('');
      fetchProjects();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to import XML');
    }
  };

  const handleExportXML = async (projectId) => {
    try {
      const response = await api.get(`/projects/${projectId}/export-xml`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `project-${projectId}.xml`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError('Failed to export XML');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: 'default',
      submitted: 'primary',
      in_review: 'warning',
      approved: 'success',
      rejected: 'error',
    };
    return colors[status] || 'default';
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Smart University - {user?.role?.toUpperCase()} Dashboard
          </Typography>
          <IconButton color="inherit" onClick={(e) => setAnchorEl(e.currentTarget)}>
            <AccountCircle />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
          >
            <MenuItem disabled>
              <Typography>{user?.name}</Typography>
            </MenuItem>
            <MenuItem disabled>
              <Typography variant="body2">{user?.email}</Typography>
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <LogoutIcon sx={{ mr: 1 }} /> Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h4">My Projects</Typography>
          <Box>
            <Button
              variant="outlined"
              startIcon={<UploadIcon />}
              onClick={() => setOpenXmlDialog(true)}
              sx={{ mr: 1 }}
            >
              Import XML
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenDialog(true)}
            >
              New Project
            </Button>
          </Box>
        </Box>

        {loading ? (
          <Typography>Loading...</Typography>
        ) : projects.length === 0 ? (
          <Typography>No projects found. Create your first project!</Typography>
        ) : (
          <Grid container spacing={3}>
            {projects.map((project) => (
              <Grid item xs={12} md={6} lg={4} key={project._id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {project.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 2 }}
                    >
                      {project.description.substring(0, 100)}...
                    </Typography>
                    <Chip
                      label={project.status.replace('_', ' ').toUpperCase()}
                      color={getStatusColor(project.status)}
                      size="small"
                    />
                    {project.grade && (
                      <Chip
                        label={`Grade: ${project.grade}`}
                        color="success"
                        size="small"
                        sx={{ ml: 1 }}
                      />
                    )}
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      onClick={() => navigate(`/projects/${project._id}`)}
                    >
                      View Details
                    </Button>
                    <IconButton
                      size="small"
                      onClick={() => handleExportXML(project._id)}
                    >
                      <DownloadIcon />
                    </IconButton>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

      {/* Create Project Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Project</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Project Title"
            value={newProject.title}
            onChange={(e) =>
              setNewProject({ ...newProject, title: e.target.value })
            }
            margin="normal"
          />
          <TextField
            fullWidth
            label="Description"
            value={newProject.description}
            onChange={(e) =>
              setNewProject({ ...newProject, description: e.target.value })
            }
            margin="normal"
            multiline
            rows={4}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateProject} variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Import XML Dialog */}
      <Dialog open={openXmlDialog} onClose={() => setOpenXmlDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Import Project from XML</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Paste XML Content"
            value={xmlData}
            onChange={(e) => setXmlData(e.target.value)}
            margin="normal"
            multiline
            rows={10}
            placeholder="<project>...</project>"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenXmlDialog(false)}>Cancel</Button>
          <Button onClick={handleImportXML} variant="contained">
            Import
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Dashboard;