require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

const fs = require('fs');
const path = require('path');
const multer = require('multer');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'tvoja_tajna_ključa';

app.use(cors({
  origin: ['http://localhost:5173', 'https://ubevk.github.io']  // your GitHub Pages URL
})); 

app.use(express.json());

/*mongoose.connect('mongodb://localhost:27017/tasks');*/

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));



const UserSchema = new mongoose.Schema({
  name: { type: String, unique: true, required: true, lowercase: true },
  password: { type: String, required: true }, // DODAJ
  wallpaper: { type: String, default: 'praprot.jpg' }
});

const User = mongoose.model('User', UserSchema);

// For demo, assume a single user (could be improved with auth)

// Middleware: pridobi user iz JWT
app.use(async (req, res, next) => {
  if (
    req.path === '/login' ||
    req.path === '/register'
    // ODSTRANI: || req.path.startsWith('/upload-background')
  ) {
    return next();
  }

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });

  try {
    const decoded = jwt.verify(token, SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) return res.status(401).json({ error: 'User not found' });
    req.user = user;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid token' });
  }
});

// GET current wallpaper for user
app.get('/user/wallpaper', async (req, res) => {
  res.json({ wallpaper: req.user.wallpaper });
});

// UPDATE wallpaper for user
app.put('/user/wallpaper', async (req, res) => {
  const { wallpaper } = req.body;
  if (!wallpaper) return res.status(400).json({ error: 'Wallpaper is required' });

  req.user.wallpaper = wallpaper;
  await req.user.save();
  res.json({ message: 'Wallpaper updated', wallpaper });
});


const TaskSchema = new mongoose.Schema({
  name: String,
  checked: Boolean,
  order: Number,
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // DODAJ
});

const Task = mongoose.model('Task', TaskSchema);

// Get all tasks
app.get('/tasks', async (req, res) => {
  const tasks = await Task.find({ user: req.user._id }).sort({ order: 1 });
  res.json(tasks);
});

// Create a new task
app.post('/tasks', async (req, res) => {
  const taskCount = await Task.countDocuments({ user: req.user._id });
  const newTask = new Task({ ...req.body, order: taskCount, user: req.user._id });
  await newTask.save();
  res.json(newTask);
});

app.delete('/tasks/deleteAll', async (req, res) => {
    try {
        await Task.deleteMany({ user: req.user._id });
        res.json({ message: 'ALl tasks deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting tasks', details: error.message });
    }
});

app.delete('/tasks/:id', async (req, res) => {
    try {
      const { id } = req.params;
  
      // Convert the string ID into a valid ObjectId
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: "Invalid Task ID" });
      }
  
      const deletedTask = await Task.findOneAndDelete({ _id: id, user: req.user._id });
  
      if (!deletedTask) {
        return res.status(404).json({ error: "Task not found" });
      }
  
      res.json({ message: "Task deleted", deletedTask });
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
});

app.put('/tasks/reorder', async (req, res) => {
  try {
    const updates = req.body; // array of { _id, order }
    await Promise.all(
      updates.map(({ _id, order }) =>
        Task.findOneAndUpdate({ _id, user: req.user._id }, { order })
      )
    );
    res.json({ message: "Order updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error updating task order" });
  }
});

app.put('/tasks/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { checked, name } = req.body; // checkbox state

        const updatedTask = await Task.findOneAndUpdate( { _id: id, user: req.user._id }, { checked, name }, { new: true });
        
        if (!updatedTask) {
            return res.status(404).json({ error: "Task not found" });
        }

        res.json(updatedTask);
    } catch (error) {
        res.status(500).json({ error: "Error updating task status" });
    }
});

/*
app.listen(8080, () => {
  console.log('Backend server running on port 8080');
});*/

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});



// wallpaper upload
const backgroundsDir = path.join(__dirname, '../to-do-app/public/backgrounds');

if (!fs.existsSync(backgroundsDir)) {
  fs.mkdirSync(backgroundsDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, '../to-do-app/public/backgrounds/'),
  filename: (req, file, cb) => cb(null, file.originalname),
});
const upload = multer({ storage });


app.post('/upload-background', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  res.json({ message: 'Upload successful', filename: req.file.filename });
});

// REGISTRACIJA
app.post('/register', async (req, res) => {
  const { name, password } = req.body;
  if (!name || !password) return res.status(400).json({ error: 'Name and password required' });

  const userExists = await User.findOne({ name });
  if (userExists) return res.status(400).json({ error: 'The user already exists.' });

  const hashed = await bcrypt.hash(password, 10);
  const user = new User({ name, password: hashed });
  await user.save();

  res.json({ message: 'User registered' });
});

// PRIJAVA
app.post('/login', async (req, res) => {
  const { name, password } = req.body;
  if (!name || !password) return res.status(400).json({ error: 'Name and password required' });

  const user = await User.findOne({ name });
  if (!user) return res.status(400).json({ error: 'Wrong username.' });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(400).json({ error: 'Wrong password.' });

  const token = jwt.sign({ userId: user._id, name: user.name }, SECRET, { expiresIn: '2h' });
  res.json({ token });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});
