import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Plus, Loader } from 'lucide-react';

interface LobbyProps {
  onJoinRoom: (roomId: string, playerName: string) => void;
  onCreateRoom: (playerName: string) => void;
}

export const Lobby: React.FC<LobbyProps> = ({ onJoinRoom, onCreateRoom }) => {
  const [playerName, setPlayerName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validatePlayerName = () => {
    if (!playerName.trim()) {
      setError('Please enter your name');
      return false;
    }
    if (playerName.length < 2) {
      setError('Name must be at least 2 characters long');
      return false;
    }
    if (playerName.length > 15) {
      setError('Name must be less than 15 characters');
      return false;
    }
    return true;
  };

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validatePlayerName()) return;

    if (!roomId.trim()) {
      setError('Please enter a room ID');
      return;
    }

    try {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
      onJoinRoom(roomId.toUpperCase(), playerName.trim());
    } catch (err) {
      setError('Failed to join room. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateRoom = async () => {
    setError('');

    if (!validatePlayerName()) return;

    try {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
      onCreateRoom(playerName.trim());
    } catch (err) {
      setError('Failed to create room. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md w-full mx-auto p-8 bg-white rounded-2xl shadow-xl"
    >
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Join Game</h2>
          <p className="mt-2 text-gray-600">Enter your name and room details</p>
        </div>

        <form onSubmit={handleJoinRoom} className="space-y-4">
          <div>
            <label htmlFor="playerName" className="block text-sm font-medium text-gray-700">
              Your Name
            </label>
            <input
              id="playerName"
              type="text"
              value={playerName}
              onChange={(e) => {
                setPlayerName(e.target.value);
                setError('');
              }}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Enter your name"
              maxLength={15}
              disabled={isLoading}
            />
            <p className="mt-1 text-sm text-gray-500">
              {playerName.length}/15 characters
            </p>
          </div>

          <div>
            <label htmlFor="roomId" className="block text-sm font-medium text-gray-700">
              Room ID
            </label>
            <input
              id="roomId"
              type="text"
              value={roomId}
              onChange={(e) => {
                setRoomId(e.target.value.toUpperCase());
                setError('');
              }}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 uppercase transition-colors"
              placeholder="Enter room ID"
              maxLength={6}
              disabled={isLoading}
            />
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-500 text-sm text-center"
            >
              {error}
            </motion.p>
          )}

          <div className="flex gap-4">
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 ${
                isLoading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
              } text-white rounded-md transition-colors disabled:cursor-not-allowed`}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <Users className="w-4 h-4" />
              )}
              Join Room
            </motion.button>
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCreateRoom}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 ${
                isLoading ? 'bg-purple-400' : 'bg-purple-600 hover:bg-purple-700'
              } text-white rounded-md transition-colors disabled:cursor-not-allowed`}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              Create Room
            </motion.button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};