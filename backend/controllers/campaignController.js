const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Create a new campaign
const createCampaign = async (req, res) => {
    try {
        const { campaignName, type, budget, startDate, endDate, assignedTeam } = req.body;
        const campaign = await prisma.campaign.create({
            data: {
                campaignName,
                type,
                budget: parseFloat(budget) || 0,
                startDate: startDate ? new Date(startDate) : null,
                endDate: endDate ? new Date(endDate) : null,
                assignedTeam,
                createdBy: req.user.id
            }
        });
        res.status(201).json(campaign);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Get all campaigns
const getCampaigns = async (req, res) => {
    try {
        const campaigns = await prisma.campaign.findMany({
            include: {
                creator: { select: { name: true, email: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(campaigns);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Update a campaign
const updateCampaign = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = { ...req.body };
        
        if (updateData.budget) updateData.budget = parseFloat(updateData.budget);
        if (updateData.startDate) updateData.startDate = new Date(updateData.startDate);
        if (updateData.endDate) updateData.endDate = new Date(updateData.endDate);

        const campaign = await prisma.campaign.update({
            where: { id },
            data: updateData
        });
        res.json(campaign);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Delete a campaign
const deleteCampaign = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.campaign.delete({ where: { id } });
        res.json({ message: 'Campaign deleted' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

module.exports = {
    createCampaign,
    getCampaigns,
    updateCampaign,
    deleteCampaign
};
