const express = require('express');
const Task = require('../models/Task');
const Project = require('../models/Project');
const { protect } = require('../middleware/auth');
const router = express.Router();

// GET /dashboard
router.get('/', protect, async (req, res) => {
  try {
    let tasks;
    if (req.user.role === 'Admin') {
      tasks = await Task.find();
    } else {
      tasks = await Task.find({ assignedTo: req.user._id });
    }

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'Completed').length;
    
    // Check overdue (dueDate < today and status != Completed)
    const today = new Date();
    const overdueTasks = tasks.filter(t => t.dueDate && new Date(t.dueDate) < today && t.status !== 'Completed').length;

    res.json({
      totalTasks,
      completedTasks,
      overdueTasks
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
