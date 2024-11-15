import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Player, Room } from '../types';
import { Copy, Check } from 'lucide-react';

interface GameRoomProps {
  room: Room;
  currentPlayer: Player;
  onReady: () => void;
  onStartGame: () => void;
}

const PLAYER_COLORS = [
  'bg-red-500',
  'bg-blue-500',
  'bg-green-500',
  'bg-yellow-500',
  'bg-purple-500',
  'bg-pink-500',
  'bg-indigo-500',
  'bg-orange-500',
];

export const GameRoom: React.FC<GameRoomProps> = ({
  room,
  currentPlayer,
  onReady,
  onStartGame,
}) => {
  const [copied, setCopied] = useState(false);
  const isHost = room.players[0]?.id === currentPlayer.id;
  const canStartGame = room.players.length >= 2 && 
                      room.players.every(p => p.isReady) &&
                      isHost;

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(room.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy room code');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-2xl w-full mx-auto p-8 bg-white rounded-2xl shadow-xl"
    >
      <div className="space-y-6">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">Game Room</h2>
          
          <div className="inline-flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-lg">
            <span className="text-sm text-gray-500">Room Code:</span>
            <span className="font-mono font-bold text-lg text-gray-900">{room.id}</span>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleCopyCode}
              className="p-1 hover:bg-gray-200 rounded-md transition-colors"
              title="Copy room code"
            >
              <AnimatePresence mode="wait">
                {copied ? (
                  <motion.div
                    key="check"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                  >
                    <Check className="w-4 h-4 text-green-500" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="copy"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                  >
                    <Copy className="w-4 h-4 text-gray-500" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>

          {isHost && (
            <p className="text-sm text-gray-600">
              Share this code with other players to join the game
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, index) => {
            const player = room.players[index];
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-lg ${
                  player ? PLAYER_COLORS[index] : 'bg-gray-100'
                } transition-colors`}
              >
                {player ? (
                  <div className="text-white">
                    <p className="font-medium truncate">{player.name}</p>
                    <p className="text-sm opacity-75">
                      {player.isReady ? 'Ready' : 'Not Ready'}
                    </p>
                    {index === 0 && (
                      <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                        Host
                      </span>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center text-sm">
                    Waiting for player...
                  </p>
                )}
              </motion.div>
            );
          })}
        </div>

        <div className="flex justify-center gap-4">
          {!currentPlayer.isReady && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onReady}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Ready
            </motion.button>
          )}
          {canStartGame && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onStartGame}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Start Game
            </motion.button>
          )}
        </div>

        {isHost && !canStartGame && room.players.length >= 2 && (
          <p className="text-sm text-center text-gray-600">
            Waiting for all players to be ready...
          </p>
        )}
        
        {isHost && room.players.length < 2 && (
          <p className="text-sm text-center text-gray-600">
            Waiting for more players to join...
          </p>
        )}
      </div>
    </motion.div>
  );
};