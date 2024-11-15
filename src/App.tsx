import React, { useState, useEffect } from 'react';
import { Logo } from './components/Logo';
import { Lobby } from './components/Lobby';
import { GameRoom } from './components/GameRoom';
import { Game } from './components/Game';
import { Player, Room, Cell } from './types';
import { socket, createRoom, joinRoom, playerReady, startGame, makeMove } from './socket';

function App() {
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [grid, setGrid] = useState<Cell[][]>([]);

  useEffect(() => {
    socket.on('roomCreated', ({ room, player }) => {
      setCurrentPlayer(player);
      setRoom(room);
      setGrid(room.grid);
    });

    socket.on('roomJoined', ({ room, player }) => {
      setCurrentPlayer(player);
      setRoom(room);
      setGrid(room.grid);
    });

    socket.on('roomUpdate', (updatedRoom) => {
      setRoom(updatedRoom);
    });

    socket.on('gameState', (newGrid) => {
      setGrid(newGrid);
    });

    socket.on('gameOver', ({ winnerId }) => {
      const winner = room?.players.find(p => p.id === winnerId);
      alert(`Game Over! ${winner?.name} wins!`);
    });

    socket.on('error', ({ message }) => {
      alert(message);
    });

    return () => {
      socket.off('roomCreated');
      socket.off('roomJoined');
      socket.off('roomUpdate');
      socket.off('gameState');
      socket.off('gameOver');
      socket.off('error');
    };
  }, [room]);

  const handleCreateRoom = (playerName: string) => {
    createRoom(playerName);
  };

  const handleJoinRoom = (roomId: string, playerName: string) => {
    joinRoom(roomId, playerName);
  };

  const handleReady = () => {
    if (room) {
      playerReady(room.id);
    }
  };

  const handleStartGame = () => {
    if (room) {
      startGame(room.id);
    }
  };

  const handleCellClick = (row: number, col: number) => {
    if (room) {
      makeMove(room.id, row, col);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <Logo />
        </div>

        {!currentPlayer ? (
          <Lobby
            onCreateRoom={handleCreateRoom}
            onJoinRoom={handleJoinRoom}
          />
        ) : room && !room.gameStarted ? (
          <GameRoom
            room={room}
            currentPlayer={currentPlayer}
            onReady={handleReady}
            onStartGame={handleStartGame}
          />
        ) : room && room.gameStarted ? (
          <Game
            room={room}
            currentPlayer={currentPlayer}
            grid={grid}
            onCellClick={handleCellClick}
          />
        ) : null}
      </div>
    </div>
  );
}

export default App;