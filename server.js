const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const exphbs = require('express-handlebars');
const mongoose = require('mongoose');

const pageRoutes = require('./routes/pageRoutes');
const authRoutes = require('./routes/authRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const apiRoutes = require('./routes/apiRoutes');
const { writeLog } = require('./utils/security');
const { sanitizeRequest } = require('./middleware/sanitizeMiddleware');

const app = express();
const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/userdb')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err.message));

app.engine('handlebars', exphbs.engine({
  defaultLayout: 'main',
  layoutsDir: path.join(__dirname, 'views', 'layouts'),
  helpers: {
    eq: (a, b) => a === b,
    notEq: (a, b) => a !== b,
    formatDate: (value) => value ? new Date(value).toLocaleString() : '',
    roleName: (role) => role === 'admin' ? 'Administrator' : (role === 'lab_manager' ? 'Lab Manager' : 'Student')
  }
}));
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

app.use(session({
  secret: process.env.SESSION_SECRET || 'ChangeThisStudentProjectSecret',
  name: 'lrs.sid',
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'lax', secure: false }
}));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: '1mb' }));
app.use(sanitizeRequest);
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', pageRoutes);
app.use('/api', authRoutes);
app.use('/api', reservationRoutes);
app.use('/api', apiRoutes);

app.use(async (req, res) => {
  await writeLog(req, 'ROUTE_NOT_FOUND', 'failure', { path: req.originalUrl });
  if (req.accepts('html')) {
    return res.status(404).render('error', { title: 'Page Not Found', message: 'The page you are looking for does not exist.' });
  }
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.use(async (err, req, res, next) => {
  console.error(err);
  await writeLog(req, 'SERVER_ERROR', 'failure', { path: req.originalUrl });
  if (req.accepts('html')) {
    return res.status(500).render('error', { title: 'Server Error', message: 'Something went wrong. Please try again later.' });
  }
  res.status(500).json({ success: false, message: 'Something went wrong. Please try again later.' });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
