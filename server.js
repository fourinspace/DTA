const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
    cors: { origin: "*" } // Allows connections from GitHub Pages
});

const PORT = process.env.PORT || 3000;

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Relay messages between callers
    socket.on('offer', (data) => socket.broadcast.emit('offer', data));
    socket.on('answer', (data) => socket.broadcast.emit('answer', data));
    socket.on('candidate', (data) => socket.broadcast.emit('candidate', data));

    socket.on('disconnect', () => console.log('User disconnected'));
});

http.listen(PORT, () => {
    console.log(`Signaling server running on port ${PORT}`);
});
