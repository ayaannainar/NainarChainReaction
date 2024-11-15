export interface Player {
  id: string;
  name: string;
  color: string;
  isReady: boolean;
}

export interface Room {
  id: string;
  players: Player[];
  gameStarted: boolean;
  currentTurn: number;
}

export interface Cell {
  atoms: number;
  playerId: string | null;
}