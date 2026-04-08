const axios = require('axios');
const nodemailer = require('nodemailer');

const sendOTP = async (email, otp) => {
    const isPlaceholder = !process.env.EMAIL_PASS || process.env.EMAIL_PASS === 'your-brevo-api-key';
    
    const data = {
        sender: { name: "DTMS Security", email: process.env.EMAIL_USER || "no-reply@dtms.com" },
        to: [{ email: email }],
        subject: "Your DTMS Login OTP",
        htmlContent: `
            <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                <h2 style="color: #6366f1;">Digital Talent Management System</h2>
                <p>Hello,</p>
                <p>Your verification code for DTMS is:</p>
                <div style="font-size: 24px; font-weight: bold; color: #ec4899; padding: 10px; background: #fdf2f8; border-radius: 5px; display: inline-block;">
                    ${otp}
                </div>
                <p>This code will expire in 10 minutes.</p>
                <p>If you didn't request this, please ignore this email.</p>
            </div>
        `
    };

    const config = {
        headers: {
            'api-key': process.env.EMAIL_PASS,
            'content-type': 'application/json',
            'accept': 'application/json'
        }
    };

    // SMTP Method (Priority)
    if (process.env.SMTP_HOST) {
        try {
            const transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: process.env.SMTP_PORT || 587,
                secure: process.env.SMTP_SECURE === 'true',
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS
                },
                tls: {
                    rejectUnauthorized: false
                }
            });

            await transporter.sendMail({
                from: `"DTMS Secure" <${process.env.SMTP_USER}>`,
                to: email,
                subject: "Your DTMS Login OTP",
                html: data.htmlContent
            });
            console.log(`OTP Email sent via SMTP successfully to ${email}`);
            return { success: true };
        } catch (error) {
            console.error('SMTP Error:', error.message);
        }
    }

    if (otp === '123456' || isPlaceholder) {
        console.log('-----------------------------------------');
        console.log(`|  DEV/PLACEHOLDER OTP FOR ${email}: ${otp}  |`);
        console.log('-----------------------------------------');
        return { success: false, otp, message: isPlaceholder ? 'Email service not configured. OTP logged to console.' : 'Dev mode OTP.' };
    }

    try {
        await axios.post('https://api.brevo.com/v3/smtp/email', data, config);
        console.log(`OTP Email sent via Brevo API successfully to ${email}`);
        return { success: true };
    } catch (error) {
        console.error('Brevo API Error (using console fallback):', error.response?.data?.message || error.message);
        console.log('-----------------------------------------');
        console.log(`|  FALLBACK OTP FOR ${email}: ${otp}  |`);
        console.log('-----------------------------------------');
        return { success: false, otp, error: error.response?.data?.message || error.message };
    }
};

const sendNotificationEmail = async (email, subject, content) => {
    const isPlaceholder = !process.env.EMAIL_PASS || process.env.EMAIL_PASS === 'your-brevo-api-key';
    
    const htmlContent = `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #6366f1; border-radius: 12px; background-color: #f9faff;">
            <h2 style="color: #6366f1; border-bottom: 2px solid #6366f1; padding-bottom: 10px;">DTMS Notification</h2>
            <div style="margin-top: 20px; color: #374151; line-height: 1.6;">
                ${content}
            </div>
            <p style="margin-top: 30px; font-size: 12px; color: #9ca3af;">This is an automated alert from the Digital Talent Management System.</p>
        </div>
    `;

    // SMTP Method
    if (process.env.SMTP_HOST) {
        try {
            const transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: process.env.SMTP_PORT || 587,
                secure: process.env.SMTP_SECURE === 'true',
                auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
                tls: { rejectUnauthorized: false }
            });

            await transporter.sendMail({
                from: `"DTMS Alerts" <${process.env.SMTP_USER}>`,
                to: email,
                subject: subject,
                html: htmlContent
            });
            console.log(`Notification sent to ${email}: ${subject}`);
            return { success: true };
        } catch (error) {
            console.error('SMTP Notification Error:', error.message);
        }
    }

    if (isPlaceholder) {
        console.log('-----------------------------------------');
        console.log(`| NOTIFICATION FOR ${email}: ${subject} |`);
        console.log(`| Body: ${content.substring(0, 50)}... |`);
        console.log('-----------------------------------------');
        return { success: true, mode: 'console' };
    }

    // Brevo Fallback
    try {
        const data = {
            sender: { name: "DTMS Alerts", email: process.env.EMAIL_USER || "no-reply@dtms.com" },
            to: [{ email: email }],
            subject: subject,
            htmlContent: htmlContent
        };
        await axios.post('https://api.brevo.com/v3/smtp/email', data, {
            headers: { 'api-key': process.env.EMAIL_PASS, 'content-type': 'application/json' }
        });
        console.log(`Notification sent via Brevo to ${email}`);
        return { success: true };
    } catch (error) {
        console.error('Brevo API Notification Error:', error.message);
        return { success: false, error: error.message };
    }
};

module.exports = { sendOTP, sendNotificationEmail };
