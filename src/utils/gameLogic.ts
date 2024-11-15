interface Cell {
  atoms: number;
  playerId: string | null;
}

export const MAX_ATOMS = {
  corner: 1,
  edge: 2,
  center: 3,
};

export function getCellCapacity(row: number, col: number, gridSize: number): number {
  const isCorner = (row === 0 || row === gridSize - 1) && (col === 0 || col === gridSize - 1);
  const isEdge = row === 0 || row === gridSize - 1 || col === 0 || col === gridSize - 1;
  
  return isCorner ? MAX_ATOMS.corner : isEdge ? MAX_ATOMS.edge : MAX_ATOMS.center;
}

export function getAdjacentCells(row: number, col: number, gridSize: number) {
  const adjacent: [number, number][] = [];
  
  if (row > 0) adjacent.push([row - 1, col]); // top
  if (row < gridSize - 1) adjacent.push([row + 1, col]); // bottom
  if (col > 0) adjacent.push([row, col - 1]); // left
  if (col < gridSize - 1) adjacent.push([row, col + 1]); // right
  
  return adjacent;
}

export function processChainReaction(
  grid: Cell[][],
  row: number,
  col: number,
  playerId: string
): Cell[][] {
  const gridSize = grid.length;
  const newGrid = JSON.parse(JSON.stringify(grid));
  const cellsToProcess: [number, number][] = [[row, col]];
  
  while (cellsToProcess.length > 0) {
    const [currentRow, currentCol] = cellsToProcess.shift()!;
    const cell = newGrid[currentRow][currentCol];
    const capacity = getCellCapacity(currentRow, currentCol, gridSize);
    
    // Add atom to current cell
    if (cell.atoms === 0) {
      cell.playerId = playerId;
    }
    cell.atoms += 1;
    
    // Check if cell exceeds capacity
    if (cell.atoms > capacity) {
      cell.atoms = 0;
      cell.playerId = null;
      
      // Distribute atoms to adjacent cells
      const adjacent = getAdjacentCells(currentRow, currentCol, gridSize);
      adjacent.forEach(([adjRow, adjCol]) => {
        cellsToProcess.push([adjRow, adjCol]);
      });
    }
  }
  
  return newGrid;
}