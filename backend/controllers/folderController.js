const prisma = require('../utils/prisma');

// Recursive helper to build folder tree
const buildTree = (folders, parentId = null) => {
    return folders
        .filter(f => f.parentFolderId === parentId)
        .map(f => ({
            ...f,
            children: buildTree(folders, f.id)
        }));
};

const createFolder = async (req, res) => {
    try {
        const { name, parentFolderId } = req.body;
        if (!name) return res.status(400).json({ error: 'Folder name is required' });
        const folder = await prisma.folder.create({
            data: { name, parentFolderId: parentFolderId || null, createdBy: req.user.id },
            include: { subFolders: true }
        });
        res.status(201).json(folder);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const getFolders = async (req, res) => {
    try {
        // Fetch ALL folders flat, then build tree
        const folders = await prisma.folder.findMany({
            include: {
                _count: { select: { subFolders: true, tasks: true, docs: true, whiteboards: true } }
            },
            orderBy: { createdAt: 'asc' }
        });
        const tree = buildTree(folders);
        res.json({ tree, flat: folders });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getFolderById = async (req, res) => {
    try {
        const { id } = req.params;
        const folder = await prisma.folder.findUnique({
            where: { id },
            include: {
                subFolders: {
                    include: { _count: { select: { subFolders: true, tasks: true, docs: true, files: true } } }
                },
                parent: true,
                _count: { select: { tasks: true, docs: true, whiteboards: true, files: true } }
            }
        });
        if (!folder) return res.status(404).json({ error: 'Folder not found' });
        res.json(folder);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getFolderContent = async (req, res) => {
    try {
        const { id } = req.params;
        const [tasks, docs, whiteboards, subFolders, files] = await Promise.all([
            prisma.task.findMany({
                where: { folderId: id },
                include: { assignee: { select: { id: true, name: true, email: true } } }
            }),
            prisma.doc.findMany({ where: { folderId: id }, orderBy: { updatedAt: 'desc' } }),
            prisma.whiteboard.findMany({ where: { folderId: id } }),
            prisma.folder.findMany({
                where: { parentFolderId: id },
                include: { _count: { select: { tasks: true, docs: true, subFolders: true, files: true } } }
            }),
            prisma.file.findMany({ where: { folderId: id }, orderBy: { createdAt: 'desc' } })
        ]);
        // Parse task labels
        const parsedTasks = tasks.map(t => ({
            ...t,
            labels: t.labels ? t.labels.split(',').filter(Boolean) : []
        }));
        res.json({ tasks: parsedTasks, docs, whiteboards, subFolders, files });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateFolder = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, parentFolderId } = req.body;
        const folder = await prisma.folder.update({
            where: { id },
            data: { name, parentFolderId: parentFolderId || null }
        });
        res.json(folder);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Recursively collect all descendant folder IDs
const getAllDescendantIds = async (folderId) => {
    const children = await prisma.folder.findMany({ where: { parentFolderId: folderId } });
    const ids = [folderId];
    for (const child of children) {
        const childIds = await getAllDescendantIds(child.id);
        ids.push(...childIds);
    }
    return ids;
};

const deleteFolder = async (req, res) => {
    try {
        const { id } = req.params;
        const { cascade = true } = req.query;
        
        if (cascade !== 'false') {
            // Delete all descendants and their contained items
            const allIds = await getAllDescendantIds(id);
            // Nullify references in tasks/docs/whiteboards
            await prisma.task.updateMany({ where: { folderId: { in: allIds } }, data: { folderId: null } });
            await prisma.doc.updateMany({ where: { folderId: { in: allIds } }, data: { folderId: null } });
            await prisma.whiteboard.updateMany({ where: { folderId: { in: allIds } }, data: { folderId: null } });
            // Delete folders from deepest first
            for (const fid of [...allIds].reverse()) {
                await prisma.folder.delete({ where: { id: fid } });
            }
        } else {
            // Just delete the folder, move children to parent
            const folder = await prisma.folder.findUnique({ where: { id } });
            await prisma.folder.updateMany({
                where: { parentFolderId: id },
                data: { parentFolderId: folder?.parentFolderId || null }
            });
            await prisma.folder.delete({ where: { id } });
        }
        res.json({ message: 'Folder deleted successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

module.exports = { createFolder, getFolders, getFolderById, getFolderContent, updateFolder, deleteFolder };
