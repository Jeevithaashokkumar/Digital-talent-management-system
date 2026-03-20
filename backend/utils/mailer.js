const axios = require('axios');

const sendOTP = async (email, otp) => {
    const data = {
        sender: { name: "DTMS Security", email: process.env.EMAIL_USER },
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

    try {
        await axios.post('https://api.brevo.com/v3/smtp/email', data, config);
        console.log('OTP Email sent via Brevo API successfully');
    } catch (error) {
        throw new Error(error.response?.data?.message || error.message);
    }
};

module.exports = { sendOTP };
