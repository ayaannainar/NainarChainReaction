import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cell, Player, Room } from '../types';
import { getCellCapacity, processChainReaction } from '../utils/gameLogic';

interface GameProps {
  room: Room;
  currentPlayer: Player;
  grid: Cell[][];
  onCellClick: (row: number, col: number) => void;
}

export const Game: React.FC<GameProps> = ({
  room,
  currentPlayer,
  grid,
  onCellClick,
}) => {
  const isCurrentTurn = room.players[room.currentTurn]?.id === currentPlayer.id;
  const currentTurnPlayer = room.players[room.currentTurn];

  const renderAtoms = (atoms: number, playerId: string | null) => {
    if (atoms === 0) return null;

    const player = room.players.find(p => p.id === playerId);
    const positions = {
      1: [{ x: '50%', y: '50%' }],
      2: [{ x: '35%', y: '50%' }, { x: '65%', y: '50%' }],
      3: [{ x: '50%', y: '35%' }, { x: '35%', y: '65%' }, { x: '65%', y: '65%' }],
    };

    const atomPositions = positions[atoms as keyof typeof positions] || positions[1];

    return atomPositions.map((pos, index) => (
      <motion.div
        key={index}
        className={`absolute w-3 h-3 rounded-full bg-${player?.color || 'gray'}-500`}
        style={{
          left: pos.x,
          top: pos.y,
          transform: 'translate(-50%, -50%)',
        }}
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 360],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          delay: index * 0.2,
        }}
      />
    ));
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-6">
        <div className="text-center space-y-2">
          <h2 className="text-xl font-semibold">
            {isCurrentTurn ? (
              <span className="text-green-600">Your Turn!</span>
            ) : (
              <span>
                Waiting for{' '}
                <span className={`text-${currentTurnPlayer?.color}-600`}>
                  {currentTurnPlayer?.name}
                </span>
              </span>
            )}
          </h2>
          <p className="text-sm text-gray-600">
            {isCurrentTurn
              ? "Click any cell to place your atom"
              : "Wait for your turn..."}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-10 gap-1 bg-gray-100 p-4 rounded-xl">
        {grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            const capacity = getCellCapacity(rowIndex, colIndex, grid.length);
            const canPlay = isCurrentTurn && (cell.playerId === null || cell.playerId === currentPlayer.id);
            
            return (
              <motion.button
                key={`${rowIndex}-${colIndex}`}
                whileHover={canPlay ? { scale: 1.05 } : {}}
                whileTap={canPlay ? { scale: 0.95 } : {}}
                className={`
                  relative aspect-square rounded-lg
                  ${canPlay ? 'cursor-pointer hover:bg-gray-50' : 'cursor-not-allowed'}
                  ${cell.playerId ? `bg-${room.players.find(p => p.id === cell.playerId)?.color}-100` : 'bg-white'}
                  ${cell.atoms === capacity ? 'animate-pulse' : ''}
                  transition-colors duration-200
                `}
                onClick={() => canPlay && onCellClick(rowIndex, colIndex)}
                disabled={!canPlay}
              >
                <AnimatePresence>
                  {renderAtoms(cell.atoms, cell.playerId)}
                </AnimatePresence>
              </motion.button>
            );
          })
        )}
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-4">
        {room.players.map((player, index) => (
          <div
            key={player.id}
            className={`
              px-4 py-2 rounded-lg
              ${room.currentTurn === index ? 'ring-2 ring-offset-2' : ''}
              bg-${player.color}-500 text-white
              transition-all duration-200
            `}
          >
            {player.name}
            {player.id === currentPlayer.id && " (You)"}
          </div>
        ))}
      </div>
    </div>
  );
};