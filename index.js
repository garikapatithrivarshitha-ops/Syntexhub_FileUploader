const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 5000;

// Automatically create "uploads" folder if missing
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Make uploads folder public to serve user images
app.use('/uploads', express.static('uploads'));

// MongoDB connection (IPv4, correct format, no deprecated options)
mongoose.connect('mongodb://127.0.0.1:27017/ecommerce')
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch(err => {
    console.error('❌ MongoDB connection failed:', err.message, err);
    process.exit(1); // Stop if DB connection fails
  });

// User schema and model
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  mobile: String,
  image: String,
});
const User = mongoose.model('User', userSchema);

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// Routes
app.get('/', (req, res) => res.send('Server is running — Home page works!'));
app.get('/debug', (req, res) => res.send('DEBUG ROUTE HIT "GARIKA" at ' + new Date()));
app.get('/zzz', (req, res) => res.send('ZED ZZZ TEST at ' + new Date()));
app.get('/testok', (req, res) => res.send('Route is working'));

// Register user with image upload
app.post('/register', upload.single('image'), async (req, res) => {
  try {
    const { name, email, password, mobile } = req.body;
    const image = req.file ? req.file.filename : null;
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      mobile,
      image,
    });
    await newUser.save();
    res.status(200).json({ message: 'User registered successfully', user: newUser });
  } catch (err) {
    console.error('Error in /register route:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get all users — with verbose error logging
app.get('/users', async (req, res) => {
  try {
    const users = await User.find();
    console.log('Fetched users:', users);
    res.json(users);
  } catch (err) {
    console.error('Error in /users route:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});
