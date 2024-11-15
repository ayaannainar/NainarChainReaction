import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? "https://your-production-domain.com"  // Update this with your domain
      : "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('dist'));
  app.get('*', (req, res) => {
    res.sendFile(join(__dirname, 'dist', 'index.html'));
  });
}

const rooms = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('createRoom', ({ playerName }) => {
    const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    const player = {
      id: socket.id,
      name: playerName,
      color: 'red',
      isReady: false
    };

    rooms.set(roomId, {
      id: roomId,
      players: [player],
      gameStarted: false,
      currentTurn: 0,
      grid: Array(10).fill(null).map(() =>
        Array(10).fill(null).map(() => ({ atoms: 0, playerId: null }))
      )
    });

    socket.join(roomId);
    socket.emit('roomCreated', { room: rooms.get(roomId), player });
  });

  socket.on('joinRoom', ({ roomId, playerName }) => {
    const room = rooms.get(roomId);
    if (!room) {
      socket.emit('error', { message: 'Room not found' });
      return;
    }

    if (room.players.length >= 8) {
      socket.emit('error', { message: 'Room is full' });
      return;
    }

    const player = {
      id: socket.id,
      name: playerName,
      color: ['red', 'blue', 'green', 'yellow', 'purple', 'pink', 'indigo', 'orange'][room.players.length],
      isReady: false
    };

    room.players.push(player);
    socket.join(roomId);
    socket.emit('roomJoined', { room, player });
    io.to(roomId).emit('roomUpdate', room);
  });

  socket.on('playerReady', ({ roomId }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    const player = room.players.find(p => p.id === socket.id);
    if (player) {
      player.isReady = true;
      io.to(roomId).emit('roomUpdate', room);
    }
  });

  socket.on('startGame', ({ roomId }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    room.gameStarted = true;
    io.to(roomId).emit('roomUpdate', room);
    io.to(roomId).emit('gameState', room.grid);
  });

  socket.on('move', ({ roomId, row, col }) => {
    const room = rooms.get(roomId);
    if (!room || !room.gameStarted) return;

    const currentPlayer = room.players[room.currentTurn];
    if (currentPlayer.id !== socket.id) return;

    const cell = room.grid[row][col];
    if (cell.playerId && cell.playerId !== socket.id) return;

    // Process move
    cell.atoms++;
    cell.playerId = socket.id;

    // Chain reaction logic
    const processChainReaction = (grid, r, c) => {
      const capacity = (r === 0 || r === 9) && (c === 0 || c === 9) ? 1 :
                      (r === 0 || r === 9 || c === 0 || c === 9) ? 2 : 3;

      if (grid[r][c].atoms > capacity) {
        grid[r][c].atoms = 0;
        grid[r][c].playerId = null;

        // Spread to adjacent cells
        if (r > 0) processMove(grid, r - 1, c, socket.id);
        if (r < 9) processMove(grid, r + 1, c, socket.id);
        if (c > 0) processMove(grid, r, c - 1, socket.id);
        if (c < 9) processMove(grid, r, c + 1, socket.id);
      }
    };

    const processMove = (grid, r, c, playerId) => {
      grid[r][c].atoms++;
      grid[r][c].playerId = playerId;
      processChainReaction(grid, r, c);
    };

    processChainReaction(room.grid, row, col);

    // Check for winner
    const remainingPlayers = new Set();
    room.grid.forEach(row => {
      row.forEach(cell => {
        if (cell.playerId) remainingPlayers.add(cell.playerId);
      });
    });

    if (remainingPlayers.size === 1) {
      const winnerId = Array.from(remainingPlayers)[0];
      io.to(roomId).emit('gameOver', { winnerId });
      room.gameStarted = false;
    } else {
      // Next turn
      room.currentTurn = (room.currentTurn + 1) % room.players.length;
      io.to(roomId).emit('roomUpdate', room);
      io.to(roomId).emit('gameState', room.grid);
    }
  });

  socket.on('disconnect', () => {
    rooms.forEach((room, roomId) => {
      const playerIndex = room.players.findIndex(p => p.id === socket.id);
      if (playerIndex !== -1) {
        room.players.splice(playerIndex, 1);
        if (room.players.length === 0) {
          rooms.delete(roomId);
        } else {
          io.to(roomId).emit('roomUpdate', room);
        }
      }
    });
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});