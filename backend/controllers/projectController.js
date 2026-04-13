const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Create a project submission
const createProject = async (req, res) => {
  try {
    const { title, description, githubLink } = req.body;
    const userId = req.user.id;

    if (!title || !description || !githubLink) {
      return res.status(400).json({ error: "All fields are required for mission validation." });
    }

    const project = await prisma.projectSubmission.create({
      data: {
        title,
        description,
        githubLink,
        userId
      }
    });

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all projects (Admin) or user's projects (User)
const getProjects = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let projects;
    if (userRole === 'admin') {
      projects = await prisma.projectSubmission.findMany({
        include: { user: { select: { name: true, email: true } } },
        orderBy: { createdAt: 'desc' }
      });
    } else {
      projects = await prisma.projectSubmission.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      });
    }

    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update project status (Admin only)
const updateProjectStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'reviewed', 'rejected'].includes(status)) {
      return res.status(400).json({ error: "Invalid status state detected." });
    }

    const project = await prisma.projectSubmission.update({
      where: { id },
      data: { status }
    });

    res.json(project);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = { createProject, getProjects, updateProjectStatus };
