require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Project = require('./models/Project');
const connectDB = require('./config/db');

const seedData = async () => {
  try {
    await connectDB();
    const existingAdmin = await User.findOne({ email: 'admin@university.com' });
    
    await User.deleteMany({ email: { $regex: /@university\.com$/ } });
    await Project.deleteMany({ title: { $in: ['Machine Learning Research Project', 'Web Development Capstone', 'Database Design Project'] } });
    console.log('Sample data cleared');

    const admin = await User.create({ name: 'Admin User', email: 'admin@university.com', password: 'admin123', role: 'admin' });
    const teacher = await User.create({ name: 'Dr. Sarah Johnson', email: 'teacher@university.com', password: 'teacher123', role: 'teacher' });
    const student1 = await User.create({ name: 'John Doe', email: 'student1@university.com', password: 'student123', role: 'student' });
    const student2 = await User.create({ name: 'Jane Smith', email: 'student2@university.com', password: 'student123', role: 'student' });
    console.log('Users created');

    await Project.create({
      title: 'Machine Learning Research Project',
      description: 'Research project on implementing ML algorithms for predictive analytics',
      status: 'submitted',
      createdBy: teacher._id,
      studentId: student1._id,
      teacherId: teacher._id,
      classroom: 'CS401',
      tasks: [
        { title: 'Literature Review', description: 'Complete comprehensive literature review', deadline: new Date('2025-12-01'), progress: 100, status: 'completed' },
        { title: 'Data Collection', description: 'Gather and prepare dataset', deadline: new Date('2025-12-15'), progress: 75, status: 'in_progress' },
        { title: 'Model Implementation', description: 'Implement and train ML models', deadline: new Date('2026-01-10'), progress: 30, status: 'in_progress' }
      ],
      submittedAt: new Date()
    });

    await Project.create({
      title: 'Web Development Capstone',
      description: 'Full-stack web application development project',
      status: 'in_review',
      createdBy: teacher._id,
      studentId: student2._id,
      teacherId: teacher._id,
      classroom: 'CS301',
      tasks: [
        { title: 'Frontend Development', description: 'Build responsive UI with React', deadline: new Date('2025-11-30'), progress: 90, status: 'in_progress' },
        { title: 'Backend API', description: 'Create RESTful API with Node.js', deadline: new Date('2025-12-05'), progress: 85, status: 'in_progress' }
      ],
      grade: 88,
      feedback: 'Good progress. Needs more testing coverage.',
      submittedAt: new Date()
    });

    await Project.create({
      title: 'Database Design Project',
      description: 'Design and implement a complex database system',
      status: 'draft',
      createdBy: teacher._id,
      studentId: student1._id,
      teacherId: teacher._id,
      classroom: 'CS401',
      tasks: [
        { title: 'Requirements Analysis', description: 'Analyze system requirements', deadline: new Date('2025-11-25'), progress: 50, status: 'in_progress' }
      ]
    });

    console.log('Projects created');
    console.log('\n=== SAMPLE USERS ===');
    console.log('Admin: admin@university.com / admin123');
    console.log('Teacher: teacher@university.com / teacher123');
    console.log('Student 1: student1@university.com / student123');
    console.log('Student 2: student2@university.com / student123');
    const userCount = await User.countDocuments();
    const projectCount = await Project.countDocuments();
    console.log(`\nVerification: ${userCount} users and ${projectCount} projects created`);
    console.log('\nDatabase seeded successfully!');
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData();