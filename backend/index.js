const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/tasks');

const TaskSchema = new mongoose.Schema({
  name: String,
  checked: Boolean,
});

const Task = mongoose.model('Task', TaskSchema);


/*app.get('/', async (req,res) => {
    res.json("Hello Bine");
}) */


// Get all tasks
app.get('/tasks', async (req, res) => {
  const tasks = await Task.find();
  res.json(tasks);
});

// Create a new task
app.post('/tasks', async (req, res) => {
  console.log(req.body);
  const newTask = new Task(req.body);
  await newTask.save();
  res.json(newTask);
});

// Delete a task
app.delete('/tasks/:id', async (req, res) => {
  await Task.findByIdAndDelete(req.params.id);
  res.json({ message: 'Task deleted' });
});

app.listen(8080, () => {
  console.log('Backend server running on port 8080');
});
