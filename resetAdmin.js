const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/userdb')
  .then(async () => {
    const hashed = await bcrypt.hash('Admin123!', 10);
    await User.findOneAndUpdate(
      { username: 'admin' },
      { password: hashed, passwordHistory: [hashed], passwordChangedAt: new Date() }
    );
    console.log('Admin password reset to Admin123!');
    mongoose.disconnect();
  })
  .catch(err => console.error(err));
