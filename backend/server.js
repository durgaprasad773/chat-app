// server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/chatApp', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false, // To avoid deprecation warning for findOneAndUpdate
  useCreateIndex: true // To avoid deprecation warning for createIndex
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// Chat schema
const chatSchema = new mongoose.Schema({
  username: String,
  message: String,
});
const Chat = mongoose.model('Chat', chatSchema);

// Socket.io
io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });

  socket.on('chatMessage', (data) => {
    const { username, message } = data;
    const newMessage = new Chat({ username, message });
    newMessage.save((err) => {
      if (err) return console.error(err);
      io.emit('message', { username, message });
    });
  });
});

const PORT = 4000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
