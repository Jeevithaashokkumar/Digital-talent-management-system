const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getKnowledgeNodes = async (req, res) => {
    try {
        const nodes = await prisma.knowledgeNode.findMany({
            where: { createdBy: req.user.id },
            include: { 
                outgoing: { include: { targetNode: true } },
                incoming: { include: { sourceNode: true } }
            }
        });
        res.json(nodes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const createKnowledgeNode = async (req, res) => {
    try {
        const { name, type, sourceId } = req.body;
        const node = await prisma.knowledgeNode.create({
            data: {
                name,
                type,
                sourceId,
                createdBy: req.user.id
            }
        });
        res.status(201).json(node);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const createRelationship = async (req, res) => {
    try {
        const { sourceNodeId, targetNodeId, relationType } = req.body;
        const relationship = await prisma.knowledgeRelationship.create({
            data: {
                sourceNodeId,
                targetNodeId,
                relationType
            }
        });
        res.status(201).json(relationship);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const syncKnowledge = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Potential logic to auto-generate nodes/relationships from existing tasks, users, docs
        // This is a placeholder for the 'Auto-generate' feature
        // 1. Fetch all tasks relevant to the user (assigned to OR created by)
        const tasks = await prisma.task.findMany({ 
            where: {
                OR: [
                    { assignedTo: userId },
                    { createdBy: userId }
                ]
            }, 
            include: { assignee: true } 
        });
        
        // 2. Fetch all docs created by the user
        const docs = await prisma.doc.findMany({ where: { createdBy: userId } });
        
        // 3. Sync Tasks and Associate with Users
        for (const task of tasks) {
            let knode = await prisma.knowledgeNode.findFirst({ 
                where: { sourceId: task.id, type: 'task' } 
            });
            
            if (!knode) {
                knode = await prisma.knowledgeNode.create({
                    data: { name: task.title, type: 'task', sourceId: task.id, createdBy: userId }
                });
            }
            
            // Link to Assignee
            if (task.assignee) {
                let unode = await prisma.knowledgeNode.findFirst({ 
                    where: { sourceId: task.assignee.id, type: 'user' } 
                });
                
                if (!unode) {
                    unode = await prisma.knowledgeNode.create({
                        data: { name: task.assignee.name || task.assignee.email, type: 'user', sourceId: task.assignee.id, createdBy: userId }
                    });
                }
                
                // Create relationship if missing
                const rel = await prisma.knowledgeRelationship.findFirst({
                    where: { sourceNodeId: knode.id, targetNodeId: unode.id, relationType: 'assigned_to' }
                });
                if (!rel) {
                    await prisma.knowledgeRelationship.create({
                        data: { sourceNodeId: knode.id, targetNodeId: unode.id, relationType: 'assigned_to' }
                    });
                }
            }
        }

        // 4. Sync Docs
        for (const doc of docs) {
            let dnode = await prisma.knowledgeNode.findFirst({ 
                where: { sourceId: doc.id, type: 'document' } 
            });
            if (!dnode) {
                await prisma.knowledgeNode.create({
                    data: { name: doc.title, type: 'document', sourceId: doc.id, createdBy: userId }
                });
            }
        }

        res.json({ message: 'Knowledge Graph Synchronized' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { getKnowledgeNodes, createKnowledgeNode, createRelationship, syncKnowledge };
