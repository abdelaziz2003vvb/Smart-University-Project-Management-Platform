require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Project = require('./models/Project');
const connectDB = require('./config/db');

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing data
    await User.deleteMany();
    await Project.deleteMany();

    console.log('Data cleared');

    // Create users
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@university.com',
      password: 'admin123',
      role: 'admin'
    });

    const teacher = await User.create({
      name: 'Dr. Sarah Johnson',
      email: 'teacher@university.com',
      password: 'teacher123',
      role: 'teacher'
    });

    const student1 = await User.create({
      name: 'John Doe',
      email: 'student1@university.com',
      password: 'student123',
      role: 'student'
    });

    const student2 = await User.create({
      name: 'Jane Smith',
      email: 'student2@university.com',
      password: 'student123',
      role: 'student'
    });

    console.log('Users created');

    // Create projects
    const project1 = await Project.create({
      title: 'Machine Learning Research Project',
      description: 'Research project on implementing ML algorithms for predictive analytics',
      status: 'submitted',
      studentId: student1._id,
      teacherId: teacher._id,
      tasks: [
        {
          title: 'Literature Review',
          description: 'Complete comprehensive literature review',
          deadline: new Date('2025-12-01'),
          progress: 100,
          status: 'completed'
        },
        {
          title: 'Data Collection',
          description: 'Gather and prepare dataset',
          deadline: new Date('2025-12-15'),
          progress: 75,
          status: 'in_progress'
        },
        {
          title: 'Model Implementation',
          description: 'Implement and train ML models',
          deadline: new Date('2026-01-10'),
          progress: 30,
          status: 'in_progress'
        }
      ],
      submittedAt: new Date()
    });

    const project2 = await Project.create({
      title: 'Web Development Capstone',
      description: 'Full-stack web application development project',
      status: 'in_review',
      studentId: student2._id,
      teacherId: teacher._id,
      tasks: [
        {
          title: 'Frontend Development',
          description: 'Build responsive UI with React',
          deadline: new Date('2025-11-30'),
          progress: 90,
          status: 'in_progress'
        },
        {
          title: 'Backend API',
          description: 'Create RESTful API with Node.js',
          deadline: new Date('2025-12-05'),
          progress: 85,
          status: 'in_progress'
        }
      ],
      grade: 88,
      feedback: 'Good progress. Needs more testing coverage.',
      submittedAt: new Date()
    });

    const project3 = await Project.create({
      title: 'Database Design Project',
      description: 'Design and implement a complex database system',
      status: 'draft',
      studentId: student1._id,
      tasks: [
        {
          title: 'Requirements Analysis',
          description: 'Analyze system requirements',
          deadline: new Date('2025-11-25'),
          progress: 50,
          status: 'in_progress'
        }
      ]
    });

    console.log('Projects created');

    console.log('\n=== SAMPLE USERS ===');
    console.log('Admin: admin@university.com / admin123');
    console.log('Teacher: teacher@university.com / teacher123');
    console.log('Student 1: student1@university.com / student123');
    console.log('Student 2: student2@university.com / student123');
    console.log('\nDatabase seeded successfully!');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData();