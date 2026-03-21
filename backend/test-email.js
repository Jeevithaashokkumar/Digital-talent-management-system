const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

async function testEmail() {
    console.log('--- Email Configuration Test ---');
    console.log('SMTP_HOST:', process.env.SMTP_HOST || '(not set)');
    console.log('SMTP_USER:', process.env.SMTP_USER || '(not set)');
    console.log('SMTP_PASS:', process.env.SMTP_PASS ? '********' : '(not set)');

    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.error('\nERROR: Missing SMTP configuration in .env');
        console.log('Please fill in SMTP_HOST, SMTP_USER, and SMTP_PASS in your backend/.env file.');
        return;
    }

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

    try {
        console.log('\nAttempting to send test email to:', process.env.SMTP_USER);
        await transporter.sendMail({
            from: `"DTMS Test" <${process.env.SMTP_USER}>`,
            to: process.env.SMTP_USER,
            subject: "DTMS Email Configuration Test",
            text: "Success! Your DTMS email configuration is working correctly."
        });
        console.log('SUCCESS: Test email sent successfully!');
    } catch (error) {
        console.error('\nFAILED to send test email:', error.message);
        if (error.message.includes('Invalid login')) {
            console.log('TIP: If using GMail, make sure you generated an "App Password" and are not using your regular password.');
        }
    }
}

testEmail();
