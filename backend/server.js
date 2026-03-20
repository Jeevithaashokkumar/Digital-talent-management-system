const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes will be imported here
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');
const boardRoutes = require('./routes/boards');
const listRoutes = require('./routes/lists');
const folderRoutes = require('./routes/folders');
const docRoutes = require('./routes/docs');
const whiteboardRoutes = require('./routes/whiteboards');
const captchaRoutes = require('./routes/captcha').router;

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/boards', boardRoutes);
app.use('/api/lists', listRoutes);
app.use('/api/folders', folderRoutes);
app.use('/api/docs', docRoutes);
app.use('/api/whiteboards', whiteboardRoutes);
app.use('/api/captcha', captchaRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
