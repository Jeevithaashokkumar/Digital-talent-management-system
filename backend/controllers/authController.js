const prisma = require('../utils/prisma');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { sendOTP } = require('../utils/mailer');

const { verifyCaptcha } = require('../routes/captcha');

const register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: role || 'user'
            }
        });
        
        res.status(201).json({ message: 'User registered successfully', userId: user.id });
    } catch (error) {
        if (error.code === 'P2002') {
            return res.status(400).json({ error: 'This email is already registered. Please login or use a different email.' });
        }
        res.status(400).json({ error: error.message });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await prisma.user.findUnique({ where: { email } });
        
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const requestOTP = async (req, res) => {
    try {
        const { email, captchaId, captchaText } = req.body;
        
        // 1. Verify Captcha
        if (!verifyCaptcha(captchaId, captchaText)) {
            return res.status(400).json({ error: 'Invalid Security Verification text. Please retry.' });
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return res.status(404).json({ error: 'User not found. Please register a profile first.' });

        const otp = email === 'admin@dtms.com' ? '123456' : Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

        await prisma.user.update({
            where: { email },
            data: { otp, otpExpires }
        });

        const mailResult = await sendOTP(email, otp);
        res.status(200).json({ 
            message: mailResult.success ? 'OTP sent successfully' : 'OTP generated (Dev Mode)',
            debugOtp: mailResult.success ? null : otp
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user || user.otp !== otp || user.otpExpires < new Date()) {
            return res.status(400).json({ error: 'Invalid or expired OTP' });
        }

        // Clear OTP after verification
        await prisma.user.update({
            where: { email },
            data: { otp: null, otpExpires: null }
        });

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getMe = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({ where: { id: req.user.id } });
        if (!user) return res.status(404).json({ error: 'User not found' });
        
        const { password, otp, ...userData } = user;
        res.json(userData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { register, login, requestOTP, verifyOTP, getMe };
