const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Reservation = require('./models/Reservation');
const AuditLog = require('./models/AuditLog');

const mongoURL = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/userdb';
const SALT_ROUNDS = 10;


function getNextValidReservationDate() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  if (date.getDay() === 0) date.setDate(date.getDate() + 1);
  return date.toISOString().slice(0, 10);
}

const testUsers = [
  // 1.1.1 admin account
  {
    username: 'admin',
    email: 'admin@dlsu.edu.ph',
    password: 'Admin123!',
    role: 'admin',
    description: 'Website Administrator',
    securityQuestion: 'What is the admin demo recovery phrase?',
    securityAnswer: 'GreenArcherAdmin'
  },
  // 1.1.2 lab manager account
  {
    username: 'labmanager',
    email: 'labmanager@dlsu.edu.ph',
    password: 'Manager123!',
    role: 'lab_manager',
    description: 'Lab Manager',
    securityQuestion: 'What is the lab manager demo recovery phrase?',
    securityAnswer: 'GoksLabManager'
  },
  // 1.1.3 student account
  {
    username: 'student',
    email: 'student@dlsu.edu.ph',
    password: 'Student123!',
    role: 'student',
    description: 'Student account',
    securityQuestion: 'What is the student demo recovery phrase?',
    securityAnswer: 'AnimoStudent'
  },
  {
    username: 'janedoe',
    email: 'janedoe@dlsu.edu.ph',
    password: 'Student123!',
    role: 'student',
    description: 'Another student account',
    securityQuestion: 'What is your assigned demo recovery phrase?',
    securityAnswer: 'JaneDemoAnswer'
  }
];

async function initialize() {
  try {
    await mongoose.connect(mongoURL);

    await User.deleteMany({});
    await Reservation.deleteMany({});
    await AuditLog.deleteMany({});

    for (const user of testUsers) {
      const plainPassword = user.password;
      user.password = await bcrypt.hash(plainPassword, SALT_ROUNDS);
      user.securityAnswerHash = await bcrypt.hash(user.securityAnswer.toLowerCase(), SALT_ROUNDS);
      user.passwordHistory = [user.password];
      delete user.securityAnswer;
    }

    const users = await User.insertMany(testUsers);
    const student = users.find(u => u.username === 'student');
    const jane = users.find(u => u.username === 'janedoe');

    const demoDate = getNextValidReservationDate();
    const testReservations = [
      { userId: student._id, lab: 'G404A', seat: 'S1', date: demoDate, startTime: '7:30', endTime: '8:00', anonymous: false },
      { userId: jane._id, lab: 'G404A', seat: 'S2', date: demoDate, startTime: '7:30', endTime: '8:00', anonymous: false },
      { userId: student._id, lab: 'G404B', seat: 'S3', date: demoDate, startTime: '8:00', endTime: '8:30', anonymous: true },
      { userId: users.find(u => u.username === 'labmanager')._id, lab: 'V101', seat: 'S4', date: demoDate, startTime: '9:00', endTime: '9:30', anonymous: false, walkInName: 'Walk In Student' }
    ];
    await Reservation.insertMany(testReservations);

    await AuditLog.create({ eventType: 'DATABASE_SEED', status: 'success', username: 'system', role: 'system', details: { message: 'Demo accounts created' } });

    console.log('Database initialized successfully.');
    console.log('Demo accounts:');
    console.log('admin / Admin123!');
    console.log('labmanager / Manager123!');
    console.log('student / Student123!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

initialize();
