const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
    cors: { origin: "*" } // Allows your GitHub Pages site to connect
});

// Use the port Render gives us, or 3000 for local testing
const PORT = process.env.PORT || 3000;

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('offer', (data) => socket.broadcast.emit('offer', data));
    socket.on('answer', (data) => socket.broadcast.emit('answer', data));
    socket.on('candidate', (data) => socket.broadcast.emit('candidate', data));

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

http.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
