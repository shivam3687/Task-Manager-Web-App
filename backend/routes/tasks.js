const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const { protect, admin } = require('../middleware/auth');

// Get all tasks (can filter by project)
router.get('/', protect, async (req, res) => {
  try {
    const { project } = req.query;
    let query = {};
    if (project) {
      query.project = project;
    }
    const tasks = await Task.find(query)
      .populate('project', 'name')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a task (Admin only)
router.post('/', protect, admin, async (req, res) => {
  try {
    const { title, description, status, priority, dueDate, project, assignedTo } = req.body;
    
    const task = new Task({
      title,
      description,
      status,
      priority,
      dueDate,
      project,
      assignedTo,
      createdBy: req.user._id
    });
    
    const createdTask = await task.save();
    res.status(201).json(createdTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update a task (status, etc)
router.put('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    
    if (task) {
      // Rule: Only Admin can mark a task as 'Done'
      if (req.body.status === 'Done' && req.user.role !== 'Admin' && task.status !== 'Done') {
         return res.status(403).json({ message: 'Only Admins can mark tasks as Done.' });
      }

      // Rule: Once 'Done', cannot be reverted
      if (task.status === 'Done' && req.body.status && req.body.status !== 'Done') {
         return res.status(400).json({ message: 'Completed tasks cannot be changed back to active statuses.' });
      }

      task.title = req.body.title || task.title;
      task.description = req.body.description !== undefined ? req.body.description : task.description;
      task.status = req.body.status || task.status;
      task.priority = req.body.priority || task.priority;
      task.dueDate = req.body.dueDate || task.dueDate;
      task.assignedTo = req.body.assignedTo || task.assignedTo;

      const updatedTask = await task.save();
      res.json(updatedTask);
    } else {
      res.status(404).json({ message: 'Task not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a task (Admin only)
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (task) {
      await Task.deleteOne({ _id: task._id });
      res.json({ message: 'Task removed' });
    } else {
      res.status(404).json({ message: 'Task not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
