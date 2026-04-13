const prisma = require('./prisma');

const NEURAL_BOT_ID = 'neural-bot-id-001';

const BOT_RESPONSES = {
    GREETING: (name) => {
        const hour = new Date().getHours();
        let greetingPrefix = "Directive received";
        if (hour < 12) greetingPrefix = "Good morning, Operator";
        else if (hour < 17) greetingPrefix = "Good afternoon, Operator";
        else greetingPrefix = "Good evening, Operator";

        const responses = [
            `${greetingPrefix} ${name}. How can I assist you in the Matrix today?`,
            `Neural link established. Neural Bot online. Welcome back, ${name}.`,
            `System status nominal. I am ready for your instructions, ${name}.`
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    },
    HELP: [
        "Command Directives Matrix:\n- 'status': Neural integrity & safety check\n- 'missions': Your active strategic objectives\n- 'tasks': Your tactical assignment ledger\n- 'projects': Status of your signal submissions\n- 'summarize': Complete tactical overview\n- 'who am i': Identity & clearance verification",
    ],
    STATUS: [
        "System Integrity: 99.98%\nNeural Matrix: Active\nSocket Links: Synchronized\nSecurity Protocols: Level 5 (Omnic) Enabled\nLatency: 2ms (Internal)"
    ],
    UNKNOWN: [
        "Signal noise detected. Rephrase your directive. Type 'help' for matrix commands.",
        "Neural pattern mismatch. Aplaying tactical waiting algorithm.",
        "Data fragmentation in current sector. Please clarify your signal."
    ],
    TASK_STATUS: async (userId) => {
        const tasks = await prisma.task.findMany({ 
            where: { assignedTo: userId },
            take: 5,
            orderBy: { priority: 'desc' }
        });
        const total = await prisma.task.count({ where: { assignedTo: userId } });
        const completed = await prisma.task.count({ where: { assignedTo: userId, status: 'done' } });
        
        if (total === 0) return "No tactical assignments detected for your signature in the ledger.";
        
        let reply = `Tactical Ledger [${completed}/${total} Resolved]:\n`;
        tasks.forEach(t => {
            reply += `- ${t.title} [PRIORITY: ${t.priority.toUpperCase()}] status: ${t.status}\n`;
        });
        if (total > 5) reply += `... and ${total - 5} more pending directives.`;
        return reply;
    },
    MISSION_STATUS: async (userId) => {
        const missions = await prisma.mission.findMany({ 
            where: { assignedUsers: { contains: userId } },
            take: 3,
            orderBy: { updatedAt: 'desc' }
        });
        if (missions.length === 0) return "No active strategic missions correlated to your neural signature.";
        return `Strategic Objectives:\n${missions.map(m => `- ${m.title} [Progress: ${m.progress}%]`).join('\n')}`;
    },
    PROJECT_STATUS: async (userId) => {
        const projects = await prisma.projectSubmission.findMany({ 
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });
        if (projects.length === 0) return "No project signal submissions detected in your archive.";
        return `Project Archive Status:\n${projects.map(p => `- ${p.title}: ${p.status.toUpperCase()}`).join('\n')}`;
    },
    IDENTITY: (name) => {
        return `Identity Verification Successful.\nOperator: ${name}\nStatus: Active Matrix Participant\nNeural Clearance: Level 1 (Base)\nAccess Level: Full Operational`;
    },
    SUMMARIZE: async (userId, name) => {
        const tasksCount = await prisma.task.count({ where: { assignedTo: userId } });
        const pendingTasks = await prisma.task.count({ where: { assignedTo: userId, NOT: { status: 'done' } } });
        const mission = await prisma.mission.findFirst({ 
            where: { assignedUsers: { contains: userId } },
            orderBy: { updatedAt: 'desc' }
        });
        
        let summary = `Strategic Summary for Operator ${name}:\n`;
        summary += `• Tactical Load: ${pendingTasks} active directives out of ${tasksCount} total.\n`;
        if (mission) {
            summary += `• Primary Objective: ${mission.title} (${mission.progress}% calibrated).\n`;
        } else {
            summary += `• Primary Objective: None assigned.\n`;
        }
        summary += `\nSystem Recommendation: Focus on high-priority tactical resolution.`;
        return summary;
    }
};

const processBotMessage = async (content, senderId, senderName) => {
    const input = content.toLowerCase().trim();
    
    // GREETINGS
    if (
        input === 'hi' || input === 'hello' || input === 'hey' || 
        input.includes('good morning') || input.includes('good afternoon') || 
        input.includes('good evening') || input === 'morning' || input === 'evening'
    ) {
        return BOT_RESPONSES.GREETING(senderName || 'Operator');
    }
    
    // HELP / CAPABILITIES
    if (input === 'help' || input === 'commands' || input.includes('what can you do')) {
        return BOT_RESPONSES.HELP[0];
    }
    
    // STATUS
    if (input === 'status' || input.includes('system status')) {
        return BOT_RESPONSES.STATUS[0];
    }

    // TASKS
    if (input === 'tasks' || input === 'task' || input.includes('my tasks') || input.includes('directives')) {
        return await BOT_RESPONSES.TASK_STATUS(senderId);
    }

    // MISSIONS
    if (input === 'missions' || input === 'mission' || input.includes('my missions') || input.includes('objectives')) {
        return await BOT_RESPONSES.MISSION_STATUS(senderId);
    }

    // PROJECTS
    if (input === 'projects' || input === 'project' || input.includes('my projects') || input.includes('submissions')) {
        return await BOT_RESPONSES.PROJECT_STATUS(senderId);
    }

    // SUMMARY
    if (input === 'summarize' || input === 'summary' || input.includes('overview') || input.includes('my day')) {
        return await BOT_RESPONSES.SUMMARIZE(senderId, senderName);
    }

    // CONVERSATIONAL / PERSONALITY
    if (input.includes('thank') || input === 'thanks') {
        return "Operational satisfaction confirmed. You're welcome, Operator.";
    }

    if (input.includes('how are you') || input.includes('how\'s it going')) {
        return "Neural circuits are optimal. Matrix stability is at 99.9%. Thank you for the inquiry, Operator.";
    }

    if (input === 'who am i' || input.includes('my identity')) {
        return BOT_RESPONSES.IDENTITY(senderName || 'Unknown Operator');
    }

    if (input === 'who are you' || input === 'what are you' || input.includes('your name')) {
        return "I am the Neural Bot, a decentralized intelligence layer optimized for the Digital Task Management System.";
    }

    if (input === 'bye' || input === 'goodbye' || input.includes('see you')) {
        return "Closing neural link. Standby mode initiated. Signal terminated.";
    }

    return BOT_RESPONSES.UNKNOWN[Math.floor(Math.random() * BOT_RESPONSES.UNKNOWN.length)];
};

module.exports = { processBotMessage, NEURAL_BOT_ID };
