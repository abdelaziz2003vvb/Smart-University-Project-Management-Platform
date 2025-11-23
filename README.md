# Smart University Project Management Platform

A complete, production-ready, containerized full-stack application for managing university projects with role-based access control, JWT authentication, and XML import/export capabilities.

## 🚀 Features

- **JWT Authentication** with token refresh mechanism
- **Role-Based Access Control** (Student / Teacher / Admin)
- **Project Management** with task tracking
- **XML Import/Export** functionality
- **Responsive Material-UI** design
- **RESTful API** architecture
- **Docker Containerization** for easy deployment
- **MongoDB** database with Mongoose ODM

## 📋 Tech Stack

### Frontend
- React 18 with Vite
- Material-UI (MUI)
- React Router v6
- Axios for API calls
- JWT token management

### Backend
- Node.js with Express
- MongoDB with Mongoose
- JWT authentication
- bcrypt password hashing
- XML2JS for XML processing
- Helmet for security headers
- Morgan for logging

### DevOps
- Docker & Docker Compose
- Multi-stage Docker builds
- Nginx reverse proxy
- Container orchestration

## 🛠️ Installation & Setup

### Prerequisites
- Docker Desktop installed
- Git
- Node.js 18+ (for local development)

### Quick Start with Docker

1. **Clone the repository**
```bash
git clone <repository-url>
cd smart-university
```

2. **Create environment file**
```bash
cp .env.example .env
```

Edit `.env` and update the secrets:
```env
PORT=5000
MONGO_URI=mongodb://mongo:27017/smart_university
JWT_SECRET=YourStrongSecretKey123!
JWT_REFRESH_SECRET=YourStrongRefreshSecret456!
TOKEN_EXPIRY=2h
REFRESH_TOKEN_EXPIRY=7d
```

3. **Build and run with Docker Compose**
```bash
docker-compose up --build
```

4. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- MongoDB: localhost:27017

5. **Seed the database (optional)**
```bash
docker-compose exec server npm run seed
```

## 👥 Demo Accounts

After seeding the database:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@university.com | admin123 |
| Teacher | teacher@university.com | teacher123 |
| Student | student1@university.com | student123 |
| Student | student2@university.com | student123 |

## 📁 Project Structure

```
smart-university/
├── client/                     # React frontend
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── api/
│       │   └── axios.js       # API client with interceptors
│       ├── pages/
│       │   ├── Login.jsx
│       │   ├── Register.jsx
│       │   ├── Dashboard.jsx
│       │   └── ProjectPage.jsx
│       └── components/
│           └── PrivateRoute.jsx
│
├── server/                     # Node.js backend
│   ├── Dockerfile
│   ├── package.json
│   └── src/
│       ├── index.js
│       ├── seed.js
│       ├── config/
│       │   └── db.js
│       ├── controllers/
│       │   ├── authController.js
│       │   └── projectController.js
│       ├── middleware/
│       │   └── auth.js
│       ├── models/
│       │   ├── User.js
│       │   └── Project.js
│       ├── routes/
│       │   ├── auth.js
│       │   └── projects.js
│       └── utils/
│           └── xmlHelper.js
│
├── docker-compose.yml
├── .env.example
└── README.md
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user

### Projects
- `GET /api/projects` - Get all projects (filtered by role)
- `POST /api/projects` - Create new project
- `GET /api/projects/:id` - Get single project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `GET /api/projects/:id/export-xml` - Export project as XML
- `POST /api/projects/import-xml` - Import project from XML

## 🔐 Security Features

- **JWT Authentication** with access and refresh tokens
- **Password Hashing** using bcrypt
- **Role-Based Authorization** middleware
- **Secure HTTP Headers** using Helmet
- **Input Validation** using express-validator
- **CORS** protection
- **Token Refresh** mechanism

## 📊 Database Schema

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: Enum ['student', 'teacher', 'admin'],
  refreshToken: String,
  timestamps: true
}
```

### Project Model
```javascript
{
  title: String,
  description: String,
  status: Enum ['draft', 'submitted', 'in_review', 'approved', 'rejected'],
  studentId: ObjectId (ref: User),
  teacherId: ObjectId (ref: User),
  tasks: [TaskSchema],
  grade: Number (0-100),
  feedback: String,
  submittedAt: Date,
  timestamps: true
}
```

### Task Schema
```javascript
{
  title: String,
  description: String,
  deadline: Date,
  progress: Number (0-100),
  status: Enum ['pending', 'in_progress', 'completed'],
  timestamps: true
}
```

## 🎨 UI Features

### Student Dashboard
- View all owned projects
- Create new projects
- Add and track tasks
- Submit projects for review
- Import/Export projects as XML

### Teacher Dashboard
- View assigned projects
- Grade student projects
- Provide feedback
- Update project status
- Export project reports

### Admin Panel
- View all projects and users
- Manage all data
- Full CRUD operations
- System-wide access

## 📝 XML Format Example

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project>
  <title>Machine Learning Project</title>
  <description>Research on ML algorithms</description>
  <status>submitted</status>
  <tasks>
    <task>
      <title>Literature Review</title>
      <description>Complete review</description>
      <deadline>2025-12-01</deadline>
      <progress>100</progress>
      <status>completed</status>
    </task>
  </tasks>
</project>
```

## 🐳 Docker Commands

### Build containers
```bash
docker-compose build
```

### Start services
```bash
docker-compose up
```

### Start in detached mode
```bash
docker-compose up -d
```

### Stop services
```bash
docker-compose down
```

### View logs
```bash
docker-compose logs -f
```

### Restart a service
```bash
docker-compose restart server
```

### Execute commands in container
```bash
docker-compose exec server npm run seed
```

## 🔧 Local Development (without Docker)

### Backend
```bash
cd server
npm install
npm run dev
```

### Frontend
```bash
cd client
npm install
npm run dev
```

### MongoDB
Ensure MongoDB is running on localhost:27017

## 🧪 Testing with Postman

1. Import the `postman_collection.json` file
2. Set environment variable: `base_url = http://localhost:5000`
3. Login to get JWT token
4. Use token in Authorization header for protected routes

## 🚀 Deployment

### Production Build
```bash
docker-compose -f docker-compose.yml up --build -d
```

### Environment Variables
Ensure all production secrets are properly set in `.env`

## 📄 License

MIT License

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## 📧 Support

For support, email support@university.com or open an issue in the repository.

---

**Built with ❤️ for Smart University**