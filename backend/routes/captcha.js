const express = require('express');
const router = express.Router();
const svgCaptcha = require('svg-captcha');

// Global store for captchas (in production, use Redis or session)
const captchaStore = new Map();

router.get('/generate', (req, res) => {
    const captcha = svgCaptcha.create({
        size: 6,
        noise: 2,
        color: true,
        background: '#f0f2f5'
    });
    
    const captchaId = Math.random().toString(36).substring(7);
    captchaStore.set(captchaId, captcha.text.toLowerCase());
    
    // Auto-delete after 5 minutes
    setTimeout(() => captchaStore.delete(captchaId), 5 * 60 * 1000);
    
    res.status(200).json({
        id: captchaId,
        data: captcha.data
    });
});

const verifyCaptcha = (id, text) => {
    const correctText = captchaStore.get(id);
    if (!correctText) return false;
    const isValid = correctText === text.toLowerCase();
    if (isValid) captchaStore.delete(id); // Use once
    return isValid;
};

module.exports = { router, verifyCaptcha };
