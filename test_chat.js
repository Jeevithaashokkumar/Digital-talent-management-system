const axios = require('axios');

const test = async () => {
    try {
        const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'admin@dtms.com',
            password: 'password123'
        });
        const token = loginRes.data.token;
        console.log('Login successful');

        const usersRes = await axios.get('http://localhost:5000/api/users', {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Users found:', usersRes.data.length);

        const msgRes = await axios.post('http://localhost:5000/api/messages', {
            content: 'Test message ' + Date.now(),
            receiverId: null
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Message saved:', msgRes.data.id);

        const historyRes = await axios.get('http://localhost:5000/api/messages', {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Messages in DB:', historyRes.data.length);

    } catch (e) {
        console.error('Test failed:', e.response?.data || e.message);
    }
};

test();
