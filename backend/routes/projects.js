const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const { protect, admin } = require('../middleware/auth');

// Get all projects
router.get('/', protect, async (req, res) => {
  try {
    let query = {};
    if (req.user.role !== 'Admin') {
      query = { $or: [{ createdBy: req.user._id }, { members: req.user._id }] };
    }
    const projects = await Project.find(query)
      .populate('createdBy', 'name email')
      .populate('members', 'name email')
      .populate('updates.user', 'name');
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a single project
router.get('/:id', protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('members', 'name email')
      .populate('updates.user', 'name');
    if (project) {
      res.json(project);
    } else {
      res.status(404).json({ message: 'Project not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a project (Admin only)
router.post('/', protect, admin, async (req, res) => {
  try {
    const { name, description, members } = req.body;
    const project = new Project({
      name,
      description,
      members: members || [],
      createdBy: req.user._id
    });
    const createdProject = await project.save();
    res.status(201).json(createdProject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update a project (Admin only)
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const { name, description, members, status, submission } = req.body;
    const project = await Project.findById(req.params.id);
    
    if (project) {
      project.name = name || project.name;
      project.description = description !== undefined ? description : project.description;
      if (members) project.members = members;
      
      // Enforce: Only Admins can mark as Completed
      if (status === 'Completed' && req.user.role !== 'Admin') {
        return res.status(403).json({ message: 'Only Admins can mark projects as Completed.' });
      }

      // Enforce: Once Completed, do not revert to Active.
      if (project.status === 'Completed' && status && status !== 'Completed') {
        return res.status(400).json({ message: 'Completed projects cannot be marked Active again.' });
      }
      if (status) project.status = status;
      if (submission !== undefined) project.submission = submission;

      const updatedProject = await project.save();
      res.json(updatedProject);
    } else {
      res.status(404).json({ message: 'Project not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Member Update Project (Status up to Pending Validation, and push text updates)
router.put('/:id/member-update', protect, async (req, res) => {
  try {
    const { status, updateText } = req.body;
    const project = await Project.findById(req.params.id);
    
    if (project) {
      // Check if user is an allotted member or admin
      const isMember = project.members.some(m => m.toString() === req.user._id.toString());
      if (!isMember && req.user.role !== 'Admin') {
        return res.status(403).json({ message: 'You are not a member of this project.' });
      }

      if (status === 'Completed' && req.user.role !== 'Admin') {
        return res.status(403).json({ message: 'Only Admins can mark projects as Completed.' });
      }

      if (status) {
        // Once Completed, don't revert
        if (project.status === 'Completed' && status !== 'Completed') {
          return res.status(400).json({ message: 'Completed projects cannot be changed.' });
        }
        project.status = status;
      }

      if (updateText) {
        project.updates.push({
          text: updateText,
          user: req.user._id
        });
      }

      const updatedProject = await project.save();
      
      // Return populated version
      const populatedProject = await Project.findById(updatedProject._id)
        .populate('createdBy', 'name email')
        .populate('members', 'name email')
        .populate('updates.user', 'name');
        
      res.json(populatedProject);
    } else {
      res.status(404).json({ message: 'Project not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
