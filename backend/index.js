const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/tasks');


const UserSchema = new mongoose.Schema({
  name: String, // username or ID for real app auth
  wallpaper: { type: String, default: 'praprot.jpg' }
});

const User = mongoose.model('User', UserSchema);

// For demo, assume a single user (could be improved with auth)
const USER_ID = "64b7a60d6e1234567890abcd"; // Example fixed user ID

// Middleware to ensure user exists (for demo)
app.use(async (req, res, next) => {
  let user = await User.findById(USER_ID);
  if (!user) {
    user = new User({ _id: USER_ID, name: 'defaultUser' });
    await user.save();
  }
  req.user = user;
  next();
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
  order: Number, // to keep the order when user reorders tasks
});

const Task = mongoose.model('Task', TaskSchema);

// Get all tasks
app.get('/tasks', async (req, res) => {
  const tasks = await Task.find().sort({ order: 1 });
  res.json(tasks);
});

// Create a new task
app.post('/tasks', async (req, res) => {
  const taskCount = await Task.countDocuments();
  const newTask = new Task({...req.body, order: taskCount }); // assign order
  await newTask.save();
  res.json(newTask);
});

app.delete('/tasks/deleteAll', async (req, res) => {
    try {
        await Task.deleteMany({});
        res.json({ mssage: 'ALl tasks deleted successfully' });
    } catch {
        res.status(500).json({ error: 'Error deleting tasks' });
    }
});

app.delete('/tasks/:id', async (req, res) => {
    try {
      const { id } = req.params;
  
      // Convert the string ID into a valid ObjectId
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: "Invalid Task ID" });
      }
  
      const deletedTask = await Task.findByIdAndDelete(id);
  
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
            updates.map(({ _id, order }) => Task.findByIdAndUpdate(_id, { order }))
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

        const updatedTask = await Task.findByIdAndUpdate( id, { checked, name }, { new: true });
        
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

const cors = require('cors');
app.use(cors({
  origin: 'https://ubevk.github.io'  // your GitHub Pages URL
}));
