import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.PROD 
  ? 'https://your-production-domain.com'  // You'll need to update this with your actual domain
  : 'http://localhost:3001';

export const socket = io(SOCKET_URL);

export const createRoom = (playerName: string) => {
  socket.emit('createRoom', { playerName });
};

export const joinRoom = (roomId: string, playerName: string) => {
  socket.emit('joinRoom', { roomId, playerName });
};

export const playerReady = (roomId: string) => {
  socket.emit('playerReady', { roomId });
};

export const startGame = (roomId: string) => {
  socket.emit('startGame', { roomId });
};

export const makeMove = (roomId: string, row: number, col: number) => {
  socket.emit('move', { roomId, row, col });
};