import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import './App.css';

const socket = io('http://localhost:5000'); // Connect to backend

function App() {
    const [room, setRoom] = useState('');
    const [joined, setJoined] = useState(false);
    const [content, setContent] = useState('');
    const [bold, setBold] = useState(false);
    const [italic, setItalic] = useState(false);
    const [underline, setUnderline] = useState(false);

    useEffect(() => {
        if (joined) {
            socket.on('updateContent', setContent);
            socket.on('updateStyleBold', setBold);
            socket.on('updateStyleItalic', setItalic);
            socket.on('updateStyleUnderline', setUnderline);

            return () => {
                socket.off('updateContent');
                socket.off('updateStyleBold');
                socket.off('updateStyleItalic');
                socket.off('updateStyleUnderline');
            };
        }
    }, [joined]);

    const handleJoin = () => {
        if (room.trim() !== '') {
            socket.emit('joinRoom', room);
            setJoined(true);
        }
    };

    const handleEdit = (event) => {
        const updatedContent = event.target.value;
        setContent(updatedContent);
        socket.emit('edit', { room, content: updatedContent });
    };

    const toggleStyle = (style, setStyle, eventName) => {
        const newState = !style;
        setStyle(newState);
        const property = eventName.replace('updateStyle', '').toLowerCase();
        socket.emit(property, { room, [property]: newState });
    };

    return (
        <div className="App">
            {!joined ? (
                <div className="login">
                    <h2>Enter Room Name</h2>
                    <input
                        type="text"
                        value={room}
                        onChange={(e) => setRoom(e.target.value)}
                        placeholder="Enter room name"
                    />
                    <button onClick={handleJoin}>Join</button>
                </div>
            ) : (
                <div className="editor">
                    <h1>Room: {room}</h1>
                    <div className="controls">
                        <button onClick={() => toggleStyle(bold, setBold, 'updateStyleBold')} style={{ fontWeight: bold ? 'bold' : 'normal' }}>
                            B
                        </button>
                        <button onClick={() => toggleStyle(italic, setItalic, 'updateStyleItalic')} style={{ fontStyle: italic ? 'italic' : 'normal' }}>
                            I
                        </button>
                        <button onClick={() => toggleStyle(underline, setUnderline, 'updateStyleUnderline')} style={{ textDecoration: underline ? 'underline' : 'none' }}>
                            U
                        </button>
                    </div>
                    <textarea
                        value={content}
                        onChange={handleEdit}
                        rows={10}
                        cols={50}
                        style={{
                            fontWeight: bold ? 'bold' : 'normal',
                            fontStyle: italic ? 'italic' : 'normal',
                            textDecoration: underline ? 'underline' : 'none'
                        }}
                    />
                </div>
            )}
        </div>
    );
}

export default App;
