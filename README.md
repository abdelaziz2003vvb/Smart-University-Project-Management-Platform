# 🎓 Smart University Platform

A comprehensive full-stack web application for managing university projects, enabling teachers to create and track projects while allowing students to submit their work efficiently.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![React](https://img.shields.io/badge/react-18.2.0-blue.svg)
![MongoDB](https://img.shields.io/badge/mongodb-6.0-green.svg)

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Running the Application](#-running-the-application)
- [Demo Credentials](#-demo-credentials)
- [API Documentation](#-api-documentation)
- [Project Structure](#-project-structure)
- [Usage Guide](#-usage-guide)
- [Docker Commands](#-docker-commands)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### For Teachers
- ✅ Create and manage projects
- ✅ Assign projects to students
- ✅ Track project progress in real-time
- ✅ Grade submissions with feedback
- ✅ Approve or reject projects
- ✅ Export/Import projects as XML
- ✅ Organize projects by classroom
- ✅ View all student submissions

### For Students
- ✅ View assigned projects
- ✅ Create and manage project tasks
- ✅ Track task completion progress
- ✅ Upload project files (PDF, XML)
- ✅ Submit projects for review
- ✅ View grades and feedback
- ✅ Download project resources

### For Administrators
- ✅ Full access to all projects
- ✅ User management (CRUD operations)
- ✅ Delete projects and users
- ✅ System-wide monitoring

### General Features
- 🔐 JWT-based authentication with refresh tokens
- 🎨 Modern, responsive UI design
- 📊 Real-time statistics dashboard
- 🔍 Search and filter functionality
- 📁 File upload/download system
- 🌐 RESTful API architecture
- 🐳 Fully Dockerized application

---

## 🚀 Tech Stack

### Frontend
- **React 18.2** - UI library
- **React Router DOM 6** - Client-side routing
- **Axios** - HTTP client
- **CSS3** - Styling with modern features

### Backend
- **Node.js 20** - Runtime environment
- **Express.js** - Web framework
- **MongoDB 6.0** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication tokens
- **Bcrypt** - Password hashing
- **Multer** - File upload handling
- **xml2js** - XML parsing/building

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Nginx** - Web server for React app

---

## 🏗️ Architecture

```
┌─────────────┐      HTTP/REST      ┌─────────────┐      Mongoose      ┌─────────────┐
│             │  ←─────────────────→ │             │  ←────────────────→│             │
│   React     │                      │  Express    │                    │   MongoDB   │
│   Client    │      Port 3000       │   Server    │     Port 27017     │   Database  │
│  (Nginx)    │                      │  (Node.js)  │                    │             │
└─────────────┘                      └─────────────┘                    └─────────────┘
      │                                     │
      │                                     │
      └──────────── JWT Auth ───────────────┘
```

### Three-Tier Architecture
1. **Presentation Layer** (Frontend) - React SPA
2. **Application Layer** (Backend) - Express REST API
3. **Data Layer** (Database) - MongoDB

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Docker** (v20.10+) - [Install Docker](https://docs.docker.com/get-docker/)
- **Docker Compose** (v2.0+) - [Install Docker Compose](https://docs.docker.com/compose/install/)
- **Git** - [Install Git](https://git-scm.com/downloads)

**OR** for local development:

- **Node.js** (v18+) - [Install Node.js](https://nodejs.org/)
- **MongoDB** (v6.0+) - [Install MongoDB](https://www.mongodb.com/try/download/community)
- **npm** or **yarn**

---

## 🔧 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/smart-university-platform.git
cd smart-university-platform
```

### 2. Environment Variables

Create a `.env` file in the root directory:

```bash
# MongoDB Configuration
MONGO_URI=mongodb://mongo:27017/smart_university

# JWT Secrets (CHANGE THESE IN PRODUCTION!)
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-refresh-secret-key-change-in-production

# Token Expiration
TOKEN_EXPIRY=2h
REFRESH_TOKEN_EXPIRY=7d

# Server Configuration
NODE_ENV=development
PORT=5000

# Client Configuration
VITE_API_URL=http://localhost:5000/api
```

⚠️ **Security Warning**: Change the JWT secrets in production!

---

## ⚙️ Configuration

### Docker Configuration

The application uses three Docker services defined in `docker-compose.yml`:

1. **mongo** - MongoDB database (Port 27017)
2. **server** - Express API server (Port 5000)
3. **client** - React application via Nginx (Port 3000)

### Network
All services communicate through `smart_university_network`.

### Volumes
- `mongodb_data` - Persists MongoDB data
- `./uploads` - Stores uploaded files

---

## 🚀 Running the Application

### Using Docker (Recommended)

#### First Time Setup

```bash
# Build and start all containers
docker-compose up --build

# In another terminal, seed the database
docker-compose exec server npm run seed
```

#### Subsequent Runs

```bash
# Start all services
docker-compose up

# Or run in detached mode
docker-compose up -d
```

#### Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **MongoDB**: localhost:27017

### Local Development (Without Docker)

#### Backend Setup

```bash
cd server
npm install
npm run seed  # Populate database
npm run dev   # Start development server
```

#### Frontend Setup

```bash
cd client
npm install
npm run dev   # Start development server
```

---

## 🔑 Demo Credentials

After running the seed script, you can use these demo accounts:

| Role    | Email                      | Password    |
|---------|----------------------------|-------------|
| Admin   | admin@university.com       | admin123    |
| Teacher | teacher@university.com     | teacher123  |
| Student | student1@university.com    | student123  |
| Student | student2@university.com    | student123  |

---

## 📚 API Documentation

### Authentication Endpoints

```http
POST   /api/auth/register       # Register new user
POST   /api/auth/login          # Login user
POST   /api/auth/refresh        # Refresh access token
GET    /api/auth/me             # Get current user info
POST   /api/auth/logout         # Logout user
```

### Project Endpoints

```http
GET    /api/projects                    # Get all projects
POST   /api/projects                    # Create new project (Teacher)
GET    /api/projects/:id                # Get project details
PUT    /api/projects/:id                # Update project
DELETE /api/projects/:id                # Delete project (Admin)
POST   /api/projects/import-xml         # Import project from XML
GET    /api/projects/:id/export-xml     # Export project as XML
POST   /api/projects/:id/upload         # Upload file to project
GET    /api/projects/:id/files/:fileId  # Download file
GET    /api/projects/classroom/:name    # Get projects by classroom
```

### User Endpoints

```http
GET    /api/users              # Get all users (Admin/Teacher)
GET    /api/users/students     # Get all students (Admin/Teacher)
GET    /api/users/:id          # Get user details (Admin)
PUT    /api/users/:id          # Update user (Admin)
DELETE /api/users/:id          # Delete user (Admin)
```

### Request Examples

#### Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teacher@university.com",
    "password": "teacher123"
  }'
```

#### Create Project

```bash
curl -X POST http://localhost:5000/api/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Machine Learning Project",
    "description": "Implement ML algorithms",
    "classroom": "CS401",
    "studentId": "STUDENT_ID"
  }'
```

---

## 📁 Project Structure

```
smart-university-platform/
├── client/                          # React Frontend
│   ├── public/
│   │   └── vite.svg
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js            # API client configuration
│   │   ├── assets/
│   │   ├── components/
│   │   │   └── PrivateRoute.jsx    # Protected route component
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx       # Main dashboard
│   │   │   ├── Login.jsx           # Login page
│   │   │   ├── Register.jsx        # Registration page
│   │   │   └── ProjectPage.jsx     # Project details page
│   │   ├── App.jsx                 # Main App component
│   │   ├── App.css                 # Global styles
│   │   ├── index.css               # Root styles
│   │   └── main.jsx                # Entry point
│   ├── Dockerfile                  # Docker config for client
│   ├── nginx.conf                  # Nginx configuration
│   ├── package.json
│   └── vite.config.js              # Vite configuration
│
├── server/                          # Express Backend
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js               # MongoDB connection
│   │   ├── controllers/
│   │   │   ├── authController.js   # Authentication logic
│   │   │   ├── projectController.js # Project CRUD logic
│   │   │   └── userController.js   # User management logic
│   │   ├── middleware/
│   │   │   ├── auth.js             # JWT authentication
│   │   │   └── upload.js           # File upload handling
│   │   ├── models/
│   │   │   ├── Project.js          # Project schema
│   │   │   ├── Task.js             # Task schema
│   │   │   └── User.js             # User schema
│   │   ├── routes/
│   │   │   ├── auth.js             # Auth routes
│   │   │   ├── projects.js         # Project routes
│   │   │   └── users.js            # User routes
│   │   ├── utils/
│   │   │   └── xmlHelper.js        # XML conversion utilities
│   │   ├── index.js                # Server entry point
│   │   └── seed.js                 # Database seeding script
│   ├── Dockerfile                  # Docker config for server
│   └── package.json
│
├── uploads/                         # Uploaded files storage
├── .env                             # Environment variables
├── docker-compose.yml               # Docker Compose config
└── README.md                        # This file
```

---

## 📖 Usage Guide

### For Teachers

#### 1. Create a Project
1. Login with teacher credentials
2. Navigate to Dashboard
3. Click **"Create New Project"** button
4. Fill in:
   - Project title
   - Description
   - Classroom (e.g., CS401)
   - Assign to a student (optional)
5. Click **"Create Project"**

#### 2. Grade a Submission
1. Navigate to Dashboard
2. Click on a submitted project (status: SUBMITTED)
3. Review student's work:
   - Check completed tasks
   - Download submitted files
4. Click **"Grade Project"**
5. Enter grade (0-100) and feedback
6. Click **"Submit Grade"**
7. Optionally approve the project

#### 3. Track Progress
- View all projects in Dashboard
- See statistics (total, in progress, submitted, approved)
- Filter by classroom or status
- Click on any project for detailed view

### For Students

#### 1. Work on Assigned Project
1. Login with student credentials
2. View assigned projects on Dashboard
3. Click on a project to open details
4. Add tasks:
   - Click **"Add Task"**
   - Enter task title, description, deadline
5. Update task progress:
   - Use progress slider (0-100%)
   - Change status (pending → in_progress → completed)

#### 2. Submit Project
1. Ensure all tasks are completed
2. Upload required files (PDF, XML)
3. Click **"Submit Project"**
4. Confirm submission
5. Project status changes to SUBMITTED
6. Wait for teacher's grade and feedback

#### 3. View Feedback
1. After teacher grades your project
2. Open the project
3. View:
   - Grade (shown prominently)
   - Teacher's feedback
   - Project status (approved/rejected)

### File Upload
- Supported formats: PDF, XML
- Maximum size: 10MB per file
- Files are stored securely on server
- Download anytime from project page

---

## 🐳 Docker Commands

### Basic Operations

```bash
# Start all services
docker-compose up

# Start in detached mode (background)
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f server
docker-compose logs -f client
docker-compose logs -f mongo

# Rebuild and start
docker-compose up --build

# Remove all containers and volumes
docker-compose down -v
```

### Database Operations

```bash
# Seed database
docker-compose exec server npm run seed

# Access MongoDB shell
docker-compose exec mongo mongosh smart_university

# Backup MongoDB
docker-compose exec mongo mongodump --out /backup

# Restore MongoDB
docker-compose exec mongo mongorestore /backup
```

### Development Commands

```bash
# Access server container
docker-compose exec server sh

# Access client container
docker-compose exec client sh

# Install new npm package in server
docker-compose exec server npm install package-name

# Run tests (if configured)
docker-compose exec server npm test
```

### Clean Up

```bash
# Remove stopped containers
docker-compose rm

# Remove all unused images
docker image prune -a

# Remove all unused volumes
docker volume prune

# Complete cleanup
docker-compose down -v
docker system prune -a
```

---

## 🔍 Troubleshooting

### Common Issues

#### 1. Port Already in Use

**Problem**: `Error: Port 3000/5000/27017 is already in use`

**Solution**:
```bash
# Find process using the port
lsof -i :3000  # On Mac/Linux
netstat -ano | findstr :3000  # On Windows

# Kill the process or change port in docker-compose.yml
```

#### 2. MongoDB Connection Failed

**Problem**: `MongooseError: connect ECONNREFUSED`

**Solution**:
```bash
# Restart MongoDB service
docker-compose restart mongo

# Check if MongoDB is running
docker-compose ps

# Check logs
docker-compose logs mongo
```

#### 3. Cannot Login / Token Invalid

**Problem**: Login fails or 401 Unauthorized errors

**Solution**:
```bash
# Clear browser localStorage
# Check if JWT_SECRET matches in .env
# Restart server
docker-compose restart server

# Re-seed database
docker-compose exec server npm run seed
```

#### 4. File Upload Fails

**Problem**: Files don't upload or 500 error

**Solution**:
```bash
# Check uploads directory exists and has permissions
mkdir -p uploads
chmod 755 uploads

# Check file size (max 10MB)
# Check file type (only PDF, XML allowed)
```

#### 5. Docker Build Fails

**Problem**: Cannot resolve node:20-alpine or network errors

**Solution**:
```bash
# Configure Docker DNS
# Edit Docker Desktop → Settings → Docker Engine
# Add: "dns": ["8.8.8.8", "8.8.4.4"]

# Or try pulling images manually
docker pull node:20-alpine
docker pull mongo:6.0
docker pull nginx:alpine
```

#### 6. React App Shows Blank Page

**Problem**: White screen or 404 errors

**Solution**:
```bash
# Rebuild client
docker-compose build client --no-cache
docker-compose up client

# Check browser console for errors
# Verify VITE_API_URL in .env
```

### Debug Mode

Enable detailed logging:

```bash
# Server
docker-compose exec server npm run dev

# View all logs
docker-compose logs -f --tail=100
```

### Reset Everything

If all else fails:

```bash
# Nuclear option - complete reset
docker-compose down -v
docker system prune -a
rm -rf node_modules
docker-compose up --build
docker-compose exec server npm run seed
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add some AmazingFeature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/AmazingFeature
   ```
5. **Open a Pull Request**

### Development Guidelines

- Follow existing code style
- Write meaningful commit messages
- Add comments for complex logic
- Update documentation as needed
- Test your changes thoroughly

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Authors

- **Your Name** - *Initial work* - [YourGitHub](https://github.com/yourusername)

---

## 🙏 Acknowledgments

- Built with React, Express, and MongoDB
- Inspired by modern university management systems
- Thanks to all contributors and testers

---

## 📞 Support

For support, email support@smartuniversity.com or open an issue on GitHub.

---

## 🔮 Future Enhancements

- [ ] Real-time notifications with WebSockets
- [ ] Email notifications for project submissions
- [ ] Advanced analytics dashboard
- [ ] Bulk project operations
- [ ] Calendar integration for deadlines
- [ ] Mobile app (React Native)
- [ ] Multi-language support (i18n)
- [ ] Dark mode theme
- [ ] Export reports as PDF
- [ ] Integration with Learning Management Systems (LMS)

---

## 📊 Project Status

**Status**: ✅ Active Development

**Version**: 1.0.0

**Last Updated**: December 2025

---