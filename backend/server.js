const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000", // Adjust for frontend port
        methods: ["GET", "POST"]
    }
});

let document = "";
let styles = { bold: false, italic: false, underline: false };

// Handle socket connections
io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // Send current state to new user
    socket.on('joinRoom', (room) => {
        socket.join(room);
        socket.emit('updateContent', document);
        socket.emit('updateStyleBold', styles.bold);
        socket.emit('updateStyleItalic', styles.italic);
        socket.emit('updateStyleUnderline', styles.underline);
        console.log(`User joined room: ${room}`);
    });

    // Handle text edits
    socket.on('edit', ({ room, content }) => {
        document = content;
        socket.to(room).emit('updateContent', content);
    });

    // Handle style updates
    socket.on('bold', ({ room, bold }) => {
        styles.bold = bold;
        socket.to(room).emit('updateStyleBold', bold);
    });

    socket.on('italic', ({ room, italic }) => {
        styles.italic = italic;
        socket.to(room).emit('updateStyleItalic', italic);
    });

    socket.on('underline', ({ room, underline }) => {
        styles.underline = underline;
        socket.to(room).emit('updateStyleUnderline', underline);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

const PORT = 5000;
server.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
