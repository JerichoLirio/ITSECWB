// Package declarations
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const exphbs = require('express-handlebars');
const mongoose = require('mongoose');

// Models 
const Lab = require('./models/Lab');
const Reservation = require('./models/Reservation');
const User = require('./models/User');

// Routes
const pageRoutes = require('./routes/pageRoutes');
const authRoutes = require('./routes/authRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const apiRoutes = require('./routes/apiRoutes');

const app = express();
const PORT = 3000;

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/userdb')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Setup handlebars
app.engine('handlebars', exphbs.engine({
  defaultLayout: 'main',
  layoutsDir: path.join(__dirname, 'views', 'layouts'),
  helpers: {  // https://docs.brightspot.com/docs/developer/helpers, consider refactoring to use this more 
    eq: (a, b) => a === b
  }
}));
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, './views'));
  
// Middleware
app.use(session({
  secret: 'APDEVSecretKey',
  resave: false,
  saveUninitialized: false,
  cookie: { // disable for specs requirement "a user session must persist until the user either logs out or closes the window." this breaches "closes the window" or condition
    secure: false, // set to true if using https
  }
}));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname,'public')));

// Routes
app.use('/', pageRoutes);
app.use('/api', authRoutes);
app.use('/api', reservationRoutes);
app.use('/api', apiRoutes);

// if user goes to route that doesn't exist
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Press Ctrl+C to stop the server`);
});
