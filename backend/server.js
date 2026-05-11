const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const { spawn, spawnSync } = require('child_process');

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const taskRoutes = require('./routes/tasks');

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);

// Connect to MongoDB
const PORT = process.env.PORT || 5000;
let MONGO_URI = process.env.MONGO_URI;

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend/dist/index.html'));
  });
}

const defaultLocalMongoUri = 'mongodb://127.0.0.1:27017/team-task-manager';

const isMongodAvailable = () => {
  const result = spawnSync('mongod', ['--version'], { stdio: 'ignore' });
  return result.status === 0;
};

const startLocalMongod = async () => {
  const dataPath = path.join(__dirname, 'data', 'db');
  fs.mkdirSync(dataPath, { recursive: true });

  console.log('Attempting to start local mongod using dbpath:', dataPath);
  const mongoProcess = spawn('mongod', ['--dbpath', dataPath, '--bind_ip', '127.0.0.1', '--port', '27017'], {
    stdio: 'ignore',
    detached: true,
  });
  mongoProcess.unref();

  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  for (let attempt = 0; attempt < 15; attempt += 1) {
    try {
      await mongoose.connect(MONGO_URI, { connectTimeoutMS: 2000 });
      return;
    } catch (error) {
      await wait(1000);
    }
  }
  throw new Error('Unable to connect to local mongod after launch. Ensure MongoDB can start and the port is free.');
};

const startServer = async () => {
  try {
    MONGO_URI = MONGO_URI || defaultLocalMongoUri;
    console.log('Using MongoDB URI:', MONGO_URI);

    try {
      await mongoose.connect(MONGO_URI);
      console.log('Connected to MongoDB at', MONGO_URI);
    } catch (connectError) {
      console.warn('Initial MongoDB connection failed:', connectError.message);
      if (MONGO_URI === defaultLocalMongoUri && isMongodAvailable()) {
        await startLocalMongod();
        console.log('Connected to local mongod at', MONGO_URI);
      } else {
        throw connectError;
      }
    }

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server or connect to MongoDB', err);
    process.exit(1);
  }
};

startServer();
