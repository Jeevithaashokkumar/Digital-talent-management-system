const net = require('net');

const client = new net.Socket();
client.setTimeout(2000);

client.connect(5432, '127.0.0.1', () => {
    console.log('Successfully connected to 127.0.0.1:5432');
    client.destroy();
});

client.on('error', (err) => {
    console.error('Connection failed:', err.message);
    client.destroy();
});

client.on('timeout', () => {
    console.error('Connection timed out');
    client.destroy();
});
