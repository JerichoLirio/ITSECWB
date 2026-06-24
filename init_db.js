/* Short script to initialize some data into the db */
const mongoose = require('mongoose');
const User = require('./models/User');
const Lab = require('./models/Lab');
const Reservation = require('./models/Reservation');
const mongoURL = 'mongodb://127.0.0.1:27017/userdb';

// Added hashing for initial test users otherwise login would not work for them
const bcrypt = require('bcryptjs');
const SALT_ROUNDS = 10;


const testUsers = [
  { username: 'johndoe', email: 'johndoe@dlsu.edu.ph', password: 'password123', role: 'student', description: 'Hey there'}, 
  { username: 'janedoe', email: 'janedoe@dlsu.edu.ph', password: 'password123', role: 'student', description: 'ZZZ'},
  { username: 'tech',email: 'techadmin@dlsu.edu.ph', password: 'tech', role: 'technician', description: 'Lab technician'}, 
  { username: 'admin', email: 'admin@dlsu.edu.ph',     password: 'admin', role: 'admin', description: 'System admin'}, 
  { username: 'arnoldschwarzenegger', email: 'arnold@dlsu.edu.ph',    password: 'password123', role: 'student',    description: 'Get to the choppa' },
  { username: 'brucelee',  email: 'bruce@dlsu.edu.ph', password: 'password123', role: 'student', description: 'Kapow'}, 
];

async function hashPasswords() {
  for (const user of testUsers) {
    user.password = await bcrypt.hash(user.password, SALT_ROUNDS);
  }
}


// May not be necessary to use labs as a model
// const testLabs = [
//   { name: 'G404A' },
//   { name: 'G404B' },
//   { name: 'V101' },
// ];

async function initialize() {
  try {
    await mongoose.connect(mongoURL);

    // Insert initial data
    await hashPasswords();
    const users = await User.insertMany(testUsers);
  
    const testReservations = [
      // G404A - 7:30-8:00
      { userId: users[0]._id, lab: 'G404A', seat: 'S1',  date: '2026-04-01', startTime: '7:30', endTime: '8:00', anonymous: false },
      { userId: users[1]._id, lab: 'G404A', seat: 'S2',  date: '2026-04-01', startTime: '7:30', endTime: '8:00', anonymous: false },
      { userId: users[4]._id, lab: 'G404A', seat: 'S3',  date: '2026-04-01', startTime: '7:30', endTime: '8:00', anonymous: false },
      { userId: users[5]._id, lab: 'G404A', seat: 'S4',  date: '2026-04-01', startTime: '7:30', endTime: '8:00', anonymous: true  },
      { userId: users[4]._id, lab: 'G404A', seat: 'S5',  date: '2026-04-01', startTime: '7:30', endTime: '8:00', anonymous: false },
 
      // G404A - 8:00-8:30
      { userId: users[5]._id, lab: 'G404A', seat: 'S6',  date: '2026-04-01', startTime: '8:00', endTime: '8:30', anonymous: false },
      { userId: users[0]._id, lab: 'G404A', seat: 'S7',  date: '2026-04-01', startTime: '8:00', endTime: '8:30', anonymous: true  },
      { userId: users[1]._id, lab: 'G404A', seat: 'S8',  date: '2026-04-01', startTime: '8:00', endTime: '8:30', anonymous: false },
      { userId: users[4]._id, lab: 'G404A', seat: 'S9',  date: '2026-04-01', startTime: '8:00', endTime: '8:30', anonymous: false },
      { userId: users[5]._id, lab: 'G404A', seat: 'S10', date: '2026-04-01', startTime: '8:00', endTime: '8:30', anonymous: false },
 
      // G404B - 7:30-8:00
      { userId: users[4]._id, lab: 'G404B', seat: 'S1',  date: '2026-04-01', startTime: '7:30', endTime: '8:00', anonymous: false },
      { userId: users[5]._id, lab: 'G404B', seat: 'S2',  date: '2026-04-01', startTime: '7:30', endTime: '8:00', anonymous: false },
      { userId: users[0]._id, lab: 'G404B', seat: 'S3',  date: '2026-04-01', startTime: '7:30', endTime: '8:00', anonymous: true  },
      { userId: users[1]._id, lab: 'G404B', seat: 'S4',  date: '2026-04-01', startTime: '7:30', endTime: '8:00', anonymous: false },
      { userId: users[4]._id, lab: 'G404B', seat: 'S5',  date: '2026-04-01', startTime: '7:30', endTime: '8:00', anonymous: false },
 
      // G404B - 8:00-8:30
      { userId: users[5]._id, lab: 'G404B', seat: 'S6',  date: '2026-04-01', startTime: '8:00', endTime: '8:30', anonymous: false },
      { userId: users[4]._id, lab: 'G404B', seat: 'S7',  date: '2026-04-01', startTime: '8:00', endTime: '8:30', anonymous: false },
      { userId: users[0]._id, lab: 'G404B', seat: 'S8',  date: '2026-04-01', startTime: '8:00', endTime: '8:30', anonymous: true  },
      { userId: users[1]._id, lab: 'G404B', seat: 'S9',  date: '2026-04-01', startTime: '8:00', endTime: '8:30', anonymous: false },
      { userId: users[5]._id, lab: 'G404B', seat: 'S10', date: '2026-04-01', startTime: '8:00', endTime: '8:30', anonymous: false },
    ];

    await Reservation.insertMany(testReservations);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

initialize();