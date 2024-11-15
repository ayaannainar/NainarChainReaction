// Custom EventEmitter implementation for browser
class BrowserEventEmitter {
  private events: { [key: string]: Function[] } = {};

  on(event: string, callback: Function) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
    return this;
  }

  emit(event: string, data?: any) {
    if (this.events[event]) {
      this.events[event].forEach(callback => callback(data));
    }
    return this;
  }

  removeAllListeners() {
    this.events = {};
  }
}

class MockSocket extends BrowserEventEmitter {
  private rooms: Map<string, Room> = new Map();
  private currentPlayer: Player | null = null;
  private grids: Map<string, Cell[][]> = new Map();

  constructor() {
    super();
  }

  connect() {
    return this;
  }

  close() {
    this.removeAllListeners();
  }

  private handleCreateRoom({ playerName }: { playerName: string }) {
    const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    const player: Player = {
      id: Math.random().toString(36).substring(2, 15),
      name: playerName,
      color: 'red',
      isReady: false
    };
    
    const room: Room = {
      id: roomId,
      players: [player],
      gameStarted: false,
      currentTurn: 0
    };

    const grid = Array(10).fill(null).map(() =>
      Array(10).fill(null).map(() => ({ atoms: 0, playerId: null }))
    );

    this.rooms.set(roomId, room);
    this.grids.set(roomId, grid);
    this.currentPlayer = player;
    this.emit('roomUpdate', room);
  }

  private handleJoinRoom({ roomId, playerName }: { roomId: string, playerName: string }) {
    const room = this.rooms.get(roomId);
    if (room && room.players.length < 8) {
      const player: Player = {
        id: Math.random().toString(36).substring(2, 15),
        name: playerName,
        color: ['red', 'blue', 'green', 'yellow', 'purple', 'pink', 'indigo', 'orange'][room.players.length],
        isReady: false
      };
      room.players.push(player);
      this.currentPlayer = player;
      this.emit('roomUpdate', room);
    }
  }

  private handlePlayerReady({ playerId }: { playerId: string }) {
    this.rooms.forEach(room => {
      const player = room.players.find(p => p.id === playerId);
      if (player) {
        player.isReady = true;
        this.emit('roomUpdate', room);
      }
    });
  }

  private handleStartGame({ roomId }: { roomId: string }) {
    const room = this.rooms.get(roomId);
    if (room) {
      room.gameStarted = true;
      this.emit('roomUpdate', room);
      this.emit('gameState', this.grids.get(roomId));
    }
  }

  private handleMove({ row, col, roomId }: { row: number, col: number, roomId: string }) {
    const room = this.rooms.get(roomId);
    const grid = this.grids.get(roomId);
    
    if (room && grid) {
      const currentPlayer = room.players[room.currentTurn];
      const newGrid = processChainReaction(grid, row, col, currentPlayer.id);
      
      // Check if current player has won
      const remainingPlayers = new Set(
        newGrid.flatMap(row => 
          row.filter(cell => cell.playerId !== null)
             .map(cell => cell.playerId)
        )
      );
      
      if (remainingPlayers.size === 1) {
        room.gameStarted = false;
        this.emit('gameOver', { winnerId: currentPlayer.id });
      }
      
      room.currentTurn = (room.currentTurn + 1) % room.players.length;
      this.grids.set(roomId, newGrid);
      
      this.emit('roomUpdate', room);
      this.emit('gameState', newGrid);
    }
  }

  emit(event: string, data: any) {
    switch (event) {
      case 'createRoom':
        this.handleCreateRoom(data);
        break;
      case 'joinRoom':
        this.handleJoinRoom(data);
        break;
      case 'playerReady':
        this.handlePlayerReady(data);
        break;
      case 'startGame':
        this.handleStartGame(data);
        break;
      case 'move':
        this.handleMove(data);
        break;
      default:
        super.emit(event, data);
    }
    return this;
  }
}

export const createMockSocket = () => new MockSocket();