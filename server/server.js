const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const authRoutes = require('./routes/auth');
const missionRoutes = require('./routes/missions');
const usersRoutes = require('./routes/users');

const app = express();
const server = http.createServer(app);

const CLIENT_ORIGINS = (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map(s => s.trim());

const io = new Server(server, {
  cors: { origin: CLIENT_ORIGINS }
});

const PORT = process.env.PORT || 3001;

app.use(cors({ origin: CLIENT_ORIGINS }));
app.use(express.json());

const dataDir = path.join(__dirname, 'data');

function readJSON(filename) {
  const raw = fs.readFileSync(path.join(dataDir, filename), 'utf8');
  const sanitized = raw.replace(/^\uFEFF/, '');
  return JSON.parse(sanitized);
}

function writeJSON(filename, data) {
  fs.writeFileSync(path.join(dataDir, filename), JSON.stringify(data, null, 2), 'utf8');
}

app.locals.readJSON = readJSON;
app.locals.writeJSON = writeJSON;
app.locals.dataDir = dataDir;
app.locals.io = io;

let messages = [];
try {
  messages = readJSON('chat.json');
} catch {
  messages = [];
}

function addChatMessage(msg) {
  messages.push(msg);
  if (messages.length > 200) messages.shift();
  writeJSON('chat.json', messages);
  io.emit('chat_message', msg);
}

app.locals.addChatMessage = addChatMessage;

io.on('connection', (socket) => {
  socket.emit('chat_history', messages);

  socket.on('chat_message', (msg) => {
    const entry = { ...msg, timestamp: new Date().toISOString() };
    addChatMessage(entry);
  });
});

// Simple root route so hitting the bare domain doesn't show "Cannot GET /"
app.get('/', (req, res) => {
  res.send('Gotcha API is running');
});

app.use('/api', authRoutes);
app.use('/api/missions', missionRoutes);
app.use('/api/users', usersRoutes);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
