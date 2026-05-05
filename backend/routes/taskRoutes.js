const express = require('express');
const Task = require('../models/Task');
const Project = require('../models/Project');
const { protect, admin } = require('../middleware/auth');
const router = express.Router();

// GET /tasks?projectId=
router.get('/', protect, async (req, res) => {
  const { projectId } = req.query;
  try {
    let query = {};
    if (projectId) {
      query.projectId = projectId;
      // Also ensure user has access to this project
      const project = await Project.findById(projectId);
      if (!project) return res.status(404).json({ message: 'Project not found' });
      
      if (req.user.role !== 'Admin' && !project.members.includes(req.user._id)) {
        return res.status(403).json({ message: 'Not authorized' });
      }
    } else {
       // If no projectId, member sees their tasks, admin sees all
       if (req.user.role !== 'Admin') {
         query.assignedTo = req.user._id;
       }
    }
    
    const tasks = await Task.find(query).populate('assignedTo', 'name email').populate('projectId', 'name');
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /tasks (Admin only)
router.post('/', protect, admin, async (req, res) => {
  const { title, description, status, dueDate, assignedTo, projectId } = req.body;
  try {
    const task = new Task({
      title,
      description,
      status: status || 'To Do',
      dueDate,
      assignedTo: assignedTo || [],
      projectId,
      createdBy: req.user._id
    });
    const createdTask = await task.save();
    res.status(201).json(createdTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /tasks/:id (Admin or assigned member)
router.put('/:id', protect, async (req, res) => {
  const { status, title, description, dueDate, assignedTo } = req.body;
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const isAssigned = task.assignedTo.some(id => id.equals(req.user._id));
    const isAdmin = req.user.role === 'Admin';

    if (!isAssigned && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to update this task' });
    }

    // Members can only update status. Admins can update everything.
    if (isAdmin) {
      task.title = title || task.title;
      task.description = description || task.description;
      task.dueDate = dueDate || task.dueDate;
      task.assignedTo = assignedTo || task.assignedTo;
    }
    
    // Both can update status, but members cannot set to Completed
    if (status) {
      if (status === 'Completed' && !isAdmin) {
        return res.status(403).json({ message: 'Only Admins can approve and complete tasks' });
      }
      task.status = status;
    }

    const updatedTask = await task.save();
    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
