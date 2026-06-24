const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

mongoose.connect('mongodb://127.0.0.1:27017/userdb')
  .then(async () => {
    const hashed = await bcrypt.hash('admin', 10);
    await User.findOneAndUpdate(
      { username: 'admin' },
      { password: hashed }
    );
    console.log('Admin password reset successfully');
    mongoose.disconnect();
  })
  .catch(err => console.error(err));

