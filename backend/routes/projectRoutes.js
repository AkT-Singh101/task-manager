const express = require('express');
const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');
const { protect, admin } = require('../middleware/auth');
const router = express.Router();

// GET /projects (Admin sees all, Member sees assigned)
router.get('/', protect, async (req, res) => {
  try {
    let projects;
    if (req.user.role === 'Admin') {
      projects = await Project.find().populate('members', 'name email');
    } else {
      projects = await Project.find({ members: req.user._id }).populate('members', 'name email');
    }
    
    // Add task counts for each project
    const projectsWithCounts = await Promise.all(projects.map(async (project) => {
      const taskCount = await Task.countDocuments({ projectId: project._id });
      return { ...project.toObject(), taskCount, memberCount: project.members.length };
    }));

    res.json(projectsWithCounts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /projects/:id (Project details)
router.get('/:id', protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('members', 'name email')
      .populate('createdBy', 'name');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if member is part of the project or is admin
    if (req.user.role !== 'Admin' && !project.members.some(m => m._id.equals(req.user._id))) {
       return res.status(403).json({ message: 'Not authorized to view this project' });
    }

    // Member Progress Tracking logic can be processed here or on frontend. 
    // We will send all tasks for the project and calculate on frontend, or calculate here.
    const tasks = await Task.find({ projectId: project._id }).populate('assignedTo', 'name email');
    
    // Let's calculate member progress
    const memberProgress = project.members.map(member => {
      const assignedTasks = tasks.filter(t => t.assignedTo.some(a => a._id.equals(member._id)));
      const completedTasks = assignedTasks.filter(t => t.status === 'Completed');
      const activeTasks = assignedTasks.filter(t => t.status !== 'Completed');
      return {
        member,
        assignedCount: assignedTasks.length,
        completedCount: completedTasks.length,
        activeCount: activeTasks.length
      };
    });

    res.json({ project, tasks, memberProgress });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /projects (Admin only)
router.post('/', protect, admin, async (req, res) => {
  const { name, members } = req.body;
  try {
    const project = new Project({
      name,
      createdBy: req.user._id,
      members: members || [] // Array of user IDs
    });
    const createdProject = await project.save();
    res.status(201).json(createdProject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /projects/:id/add-member (Admin only)
router.post('/:id/add-member', protect, admin, async (req, res) => {
  const { userId } = req.body;
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (project.members.includes(userId)) {
      return res.status(400).json({ message: 'User already a member' });
    }

    project.members.push(userId);
    await project.save();
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /users (for admin to list users to add)
router.get('/users/all', protect, admin, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
