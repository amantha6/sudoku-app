# Sudoku Game - A React Implementation

A fully interactive Sudoku game built with React that features multiple difficulty levels, user interaction, and an auto-solving visualization.

## Demo

[Play the game on Vercel](https://your-vercel-url-here.vercel.app/)

## Features

- **Multiple Difficulty Levels**: Choose between Easy, Medium, and Hard puzzles
- **Interactive Gameplay**: Click cells and input numbers to solve puzzles
- **Auto-Solve Visualization**: Watch the backtracking algorithm solve puzzles step by step
- **Statistics Tracking**: Keep track of wins and current streak
- **Mobile-Friendly**: On-screen number pad for easy input on mobile devices

## How It Works

### Core Game Logic

The game's core functionality revolves around a few key concepts:

#### 1. Board Representation

The Sudoku board is represented as a 9×9 grid (a 2D array):

```javascript
// Example of an empty board
const EMPTY_BOARD = Array(9).fill().map(() => Array(9).fill(0));

// State management for the board
const [board, setBoard] = useState(EMPTY_BOARD);
const [originalBoard, setOriginalBoard] = useState(EMPTY_BOARD);
```

#### 2. User Input Handling

When a user clicks on a cell and inputs a number:

```javascript
// Handle cell selection
const handleCellClick = (rowIndex, colIndex) => {
  if (!playMode || solving || generating) return;
  
  // Don't allow changing original cells
  if (originalBoard[rowIndex][colIndex] !== 0) return;
  
  setSelectedCell([rowIndex, colIndex]);
};

// Handle number input (from keyboard)
const handleKeyDown = (e) => {
  if (!selectedCell || !playMode || solving || generating) return;
  
  const [row, col] = selectedCell;
  
  // Check if key is a number 1-9
  if (e.key >= '1' && e.key <= '9') {
    const num = parseInt(e.key);
    
    // Update the board
    const newBoard = [...board];
    newBoard[row][col] = num;
    setBoard(newBoard);
    
    // Check if the board is complete and correct
    if (isBoardComplete(newBoard) && isBoardValid(newBoard)) {
      handleWin();
    }
  } else if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') {
    // Clear the cell
    const newBoard = [...board];
    newBoard[row][col] = 0;
    setBoard(newBoard);
  }
};
```

#### 3. Validating the Board

The game checks if a number placement is valid and if the puzzle is solved:

```javascript
// Check if the entire board is filled
const isBoardComplete = (board) => {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === 0) return false;
    }
  }
  return true;
};

// Check if the board follows Sudoku rules
const isBoardValid = (board) => {
  // Check each row, column, and 3x3 box
  for (let i = 0; i < 9; i++) {
    // Check rows
    const rowSet = new Set();
    for (let j = 0; j < 9; j++) {
      if (board[i][j] !== 0) {
        if (rowSet.has(board[i][j])) return false;
        rowSet.add(board[i][j]);
      }
    }
    
    // Check columns
    const colSet = new Set();
    for (let j = 0; j < 9; j++) {
      if (board[j][i] !== 0) {
        if (colSet.has(board[j][i])) return false;
        colSet.add(board[j][i]);
      }
    }
    
    // Check 3x3 boxes
    const boxRow = Math.floor(i / 3) * 3;
    const boxCol = (i % 3) * 3;
    const boxSet = new Set();
    
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        const value = board[boxRow + r][boxCol + c];
        if (value !== 0) {
          if (boxSet.has(value)) return false;
          boxSet.add(value);
        }
      }
    }
  }
  
  return true;
};
```

#### 4. Auto-Solving Algorithm

The game uses a backtracking algorithm to solve puzzles:

```javascript
const solveBoard = async (board) => {
  const emptySquares = [];
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === 0) {
        emptySquares.push([row, col]);
      }
    }
  }

  const totalSquares = emptySquares.length;
  let filledSquares = 0;

  while (emptySquares.length > 0) {
    let bestScore = Infinity;
    let bestSquare = null;

    // Find the cell with fewest possible values (most constrained)
    for (const [row, col] of emptySquares) {
      const options = getPossibleNumbers(board, row, col);
      if (options.length < bestScore) {
        bestScore = options.length;
        bestSquare = [row, col];
        if (bestScore === 1) break;
      }
    }

    if (!bestSquare) return false;

    const [row, col] = bestSquare;
    const options = getPossibleNumbers(board, row, col);
    
    // Remove this square from our list
    const index = emptySquares.findIndex(([r, c]) => r === row && c === col);
    if (index > -1) {
      emptySquares.splice(index, 1);
    }

    for (const num of options) {
      board[row][col] = num;
      setBoard([...board]);
      filledSquares++;
      setSolveProgress(filledSquares / totalSquares);
      await new Promise(resolve => setTimeout(resolve, 500));

      if (await solveBoard(board)) {
        return true;
      }

      board[row][col] = 0;
      setBoard([...board]);
      filledSquares--;
      setSolveProgress(filledSquares / totalSquares);
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    emptySquares.push([row, col]); // Put it back
    return false;
  }

  return true;
};

// Get all possible valid numbers for a cell
const getPossibleNumbers = (board, row, col) => {
  const options = [];
  for (let num = 1; num <= 9; num++) {
    if (isSafe(board, row, col, num)) {
      options.push(num);
    }
  }
  return options;
};

// Check if it's safe to place a number in a cell
const isSafe = (board, row, col, num) => {
  for (let x = 0; x < 9; x++) {
    if (board[row][x] === num || board[x][col] === num) {
      return false;
    }
  }
  const startRow = row - row % 3;
  const startCol = col - col % 3;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[i + startRow][j + startCol] === num) {
        return false;
      }
    }
  }
  return true;
};
```

## Project Structure

```
sudoku-app/
├── public/
│   └── index.html
├── src/
│   ├── App.js              # Main application component
│   ├── SudokuBoard.js      # Sudoku game logic and UI
│   ├── SudokuBoard.css     # Styling for the game
│   └── index.js            # Entry point
└── package.json
```

## Technical Implementation Details

1. **State Management**:
   - Uses React useState hooks to manage game state
   - Tracks original board, current board, play mode, and solving state

2. **Predefined Puzzles**:
   - Includes arrays of puzzles at different difficulty levels
   - Randomly selects a puzzle based on chosen difficulty

3. **User Interaction**:
   - Cell selection with mouse/touch
   - Number input via keyboard or on-screen number pad
   - Difficulty selection buttons

4. **Auto-Solve Visualization**:
   - Step-by-step visualization of the backtracking algorithm
   - Color coding to show progress
   - Progress bar for solving progress

5. **Validation**:
   - Checks row, column, and 3x3 box constraints
   - Validates entire board on completion

## Development Setup

1. Clone the repository:
```bash
git clone https://github.com/amantha6/sudoku-app.git
cd sudoku-game
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

