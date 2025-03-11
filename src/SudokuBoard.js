// SudokuBoard.js
import React, { useState } from 'react';
import './SudokuBoard.css';

const EMPTY_BOARD = Array(9).fill().map(() => Array(9).fill(0));

// Pre-defined Sudoku puzzles
const EASY_PUZZLES = [
  [
    [5,3,0,0,7,0,0,0,0],
    [6,0,0,1,9,5,0,0,0],
    [0,9,8,0,0,0,0,6,0],
    [8,0,0,0,6,0,0,0,3],
    [4,0,0,8,0,3,0,0,1],
    [7,0,0,0,2,0,0,0,6],
    [0,6,0,0,0,0,2,8,0],
    [0,0,0,4,1,9,0,0,5],
    [0,0,0,0,8,0,0,7,9]
  ],
  [
    [0,2,0,6,0,8,0,0,0],
    [5,8,0,0,0,9,7,0,0],
    [0,0,0,0,4,0,0,0,0],
    [3,7,0,0,0,0,5,0,0],
    [6,0,0,0,0,0,0,0,4],
    [0,0,8,0,0,0,0,1,3],
    [0,0,0,0,2,0,0,0,0],
    [0,0,9,8,0,0,0,3,6],
    [0,0,0,3,0,6,0,9,0]
  ]
];

const MEDIUM_PUZZLES = [
  [
    [0,0,0,2,6,0,7,0,1],
    [6,8,0,0,7,0,0,9,0],
    [1,9,0,0,0,4,5,0,0],
    [8,2,0,1,0,0,0,4,0],
    [0,0,4,6,0,2,9,0,0],
    [0,5,0,0,0,3,0,2,8],
    [0,0,9,3,0,0,0,7,4],
    [0,4,0,0,5,0,0,3,6],
    [7,0,3,0,1,8,0,0,0]
  ],
  [
    [0,0,0,6,0,0,4,0,0],
    [7,0,0,0,0,3,6,0,0],
    [0,0,0,0,9,1,0,8,0],
    [0,0,0,0,0,0,0,0,0],
    [0,5,0,1,8,0,0,0,3],
    [0,0,0,3,0,6,0,4,5],
    [0,4,0,2,0,0,0,6,0],
    [9,0,3,0,0,0,0,0,0],
    [0,2,0,0,0,0,1,0,0]
  ]
];

const HARD_PUZZLES = [
  [
    [0,2,0,0,0,0,0,0,0],
    [0,0,0,6,0,0,0,0,3],
    [0,7,4,0,8,0,0,0,0],
    [0,0,0,0,0,3,0,0,2],
    [0,8,0,0,4,0,0,1,0],
    [6,0,0,5,0,0,0,0,0],
    [0,0,0,0,1,0,7,8,0],
    [5,0,0,0,0,9,0,0,0],
    [0,0,0,0,0,0,0,4,0]
  ],
  [
    [0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,3,0,8,5],
    [0,0,1,0,2,0,0,0,0],
    [0,0,0,5,0,7,0,0,0],
    [0,0,4,0,0,0,1,0,0],
    [0,9,0,0,0,0,0,0,0],
    [5,0,0,0,0,0,0,7,3],
    [0,0,2,0,1,0,0,0,0],
    [0,0,0,0,4,0,0,0,9]
  ]
];

const SudokuBoard = () => {
  const [board, setBoard] = useState(EMPTY_BOARD);
  const [originalBoard, setOriginalBoard] = useState(EMPTY_BOARD);
  const [solving, setSolving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [solveProgress, setSolveProgress] = useState(0);
  const [selectedCell, setSelectedCell] = useState(null);
  const [userWins, setUserWins] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [playMode, setPlayMode] = useState(true); // true = play mode, false = auto-solve mode
  const [difficulty, setDifficulty] = useState('medium'); // 'easy', 'medium', 'hard'

  const generateSudoku = (difficultyLevel = difficulty) => {
    setGenerating(true);
    let puzzles;
    
    // Select puzzles based on difficulty
    switch(difficultyLevel) {
      case 'easy':
        puzzles = EASY_PUZZLES;
        break;
      case 'hard':
        puzzles = HARD_PUZZLES;
        break;
      case 'medium':
      default:
        puzzles = MEDIUM_PUZZLES;
        break;
    }
    
    // Randomly select a puzzle from the appropriate difficulty level
    const randomIndex = Math.floor(Math.random() * puzzles.length);
    const selectedPuzzle = puzzles[randomIndex];
    
    // Create a deep copy of the selected puzzle
    const newBoard = selectedPuzzle.map(row => [...row]);
    const boardCopy = newBoard.map(row => [...row]); // Create another deep copy for original
    
    setBoard(newBoard);
    setOriginalBoard(boardCopy);
    setDifficulty(difficultyLevel);
    setGenerating(false);
    setSolveProgress(0);
    setSelectedCell(null);
    setPlayMode(true);
  };

  const solveSudoku = async () => {
    setSolving(true);
    setSolveProgress(0);
    setPlayMode(false);
    const solution = JSON.parse(JSON.stringify(board)); // Deep clone
    await solveBoard(solution);
    setSolving(false);
  };
  
  // Initialize the game with a medium puzzle when component mounts
  React.useEffect(() => {
    generateSudoku('medium');
  }, []);
  
  const handleCellClick = (rowIndex, colIndex) => {
    if (!playMode || solving || generating) return;
    
    // Don't allow changing original cells
    if (originalBoard[rowIndex][colIndex] !== 0) return;
    
    setSelectedCell([rowIndex, colIndex]);
  };
  
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
  
  const isBoardComplete = (board) => {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (board[row][col] === 0) return false;
      }
    }
    return true;
  };
  
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
  
  const handleWin = () => {
    alert('Congratulations! You solved the puzzle!');
    setUserWins(prevWins => prevWins + 1);
    setCurrentStreak(prevStreak => prevStreak + 1);
  };

  const generateHardSudoku = () => {
    const board = Array(9).fill().map(() => Array(9).fill(0));
    fillDiagonal(board);
    solveSudokuHelper(board);
    removeNumbers(board);
    return board;
  };

  const fillDiagonal = (board) => {
    for (let i = 0; i < 9; i += 3) {
      fillBox(board, i, i);
    }
  };

  const fillBox = (board, row, col) => {
    const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        let num;
        do {
          num = nums.splice(Math.floor(Math.random() * nums.length), 1)[0];
        } while (!isSafe(board, row + i, col + j, num));
        board[row + i][col + j] = num;
      }
    }
  };

  const removeNumbers = (board) => {
    let count = 40;
    while (count > 0) {
      let row = Math.floor(Math.random() * 9);
      let col = Math.floor(Math.random() * 9);
      if (board[row][col] !== 0) {
        board[row][col] = 0;
        count--;
      }
    }
  };

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

  const getPossibleNumbers = (board, row, col) => {
    const options = [];
    for (let num = 1; num <= 9; num++) {
      if (isSafe(board, row, col, num)) {
        options.push(num);
      }
    }
    return options;
  };

  const solveSudokuHelper = (board) => {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (board[row][col] === 0) {
          for (let num = 1; num <= 9; num++) {
            if (isSafe(board, row, col, num)) {
              board[row][col] = num;
              if (solveSudokuHelper(board)) {
                return true;
              }
              board[row][col] = 0;
            }
          }
          return false;
        }
      }
    }
    return true;
  };

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

  const getCellClassName = (row, col, value) => {
    let className = "sudoku-cell";
    
    // Add border styles
    if (row % 3 === 0) className += " top-border";
    if (col % 3 === 0) className += " left-border";
    if (row === 8) className += " bottom-border";
    if (col === 8) className += " right-border";
    
    // Add selected cell highlight
    if (selectedCell && selectedCell[0] === row && selectedCell[1] === col) {
      className += " selected-cell";
    }
    
    // Add color based on cell status
    if (value === 0) {
      className += " empty-cell";
    } else if (originalBoard[row][col] !== 0) {
      className += " original-cell"; // Original puzzle numbers
    } else if (playMode) {
      className += " user-input-cell"; // User input in play mode
    } else if (solving) {
      className += " solved-cell"; // Auto-solve cells
    }
    
    return className;
  };

  // Effect to handle keyboard input
  React.useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedCell, playMode, solving, generating, board]);

  return (
    <div className="sudoku-container" tabIndex="0">
      <div className="stats-container">
        <div className="stat-box">
          <span className="stat-label">Wins:</span>
          <span className="stat-value">{userWins}</span>
        </div>
        <div className="stat-box">
          <span className="stat-label">Current Streak:</span>
          <span className="stat-value">{currentStreak}</span>
        </div>
        <div className="stat-box">
          <span className="stat-label">Difficulty:</span>
          <span className="stat-value">{difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}</span>
        </div>
      </div>
      
      <div className="difficulty-selector">
        <button 
          className={`difficulty-btn ${difficulty === 'easy' ? 'active' : ''}`}
          onClick={() => generateSudoku('easy')}
          disabled={solving || generating}
        >
          Easy
        </button>
        <button 
          className={`difficulty-btn ${difficulty === 'medium' ? 'active' : ''}`}
          onClick={() => generateSudoku('medium')}
          disabled={solving || generating}
        >
          Medium
        </button>
        <button 
          className={`difficulty-btn ${difficulty === 'hard' ? 'active' : ''}`}
          onClick={() => generateSudoku('hard')}
          disabled={solving || generating}
        >
          Hard
        </button>
      </div>
      
      <div className="mode-indicator">
        {playMode ? "Play Mode: Click cells and use keyboard (1-9) to input numbers" : "Auto-Solve Mode"}
      </div>
      
      <div className="sudoku-board">
        {board.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={getCellClassName(rowIndex, colIndex, cell)}
              style={!playMode && solving && cell !== 0 && originalBoard[rowIndex][colIndex] === 0 ? { 
                backgroundColor: `hsl(${200 + solveProgress * 160}, 70%, 30%)` 
              } : {}}
              onClick={() => handleCellClick(rowIndex, colIndex)}
            >
              {cell !== 0 ? cell : ''}
            </div>
          ))
        )}
      </div>
      
      <div className="number-pad">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
          <button 
            key={num} 
            className="number-btn"
            onClick={() => {
              if (selectedCell && playMode && !solving && !generating) {
                const [row, col] = selectedCell;
                if (originalBoard[row][col] === 0) {
                  const newBoard = [...board];
                  newBoard[row][col] = num;
                  setBoard(newBoard);
                  
                  if (isBoardComplete(newBoard) && isBoardValid(newBoard)) {
                    handleWin();
                  }
                }
              }
            }}
          >
            {num}
          </button>
        ))}
        <button 
          className="number-btn clear-btn"
          onClick={() => {
            if (selectedCell && playMode && !solving && !generating) {
              const [row, col] = selectedCell;
              if (originalBoard[row][col] === 0) {
                const newBoard = [...board];
                newBoard[row][col] = 0;
                setBoard(newBoard);
              }
            }
          }}
        >
          Clear
        </button>
      </div>
      
      <div className="controls">
        <button
          onClick={() => generateSudoku(difficulty)}
          disabled={solving || generating}
          className="generate-btn"
        >
          {generating ? 'Loading...' : 'New Puzzle'}
        </button>
        <button
          onClick={() => {
            if (playMode) {
              solveSudoku();
            } else {
              setPlayMode(true);
              setBoard([...originalBoard]);
            }
          }}
          disabled={solving || generating}
          className={playMode ? "solve-btn" : "play-btn"}
        >
          {solving ? 'Solving...' : (playMode ? 'Auto-Solve' : 'Back to Play Mode')}
        </button>
      </div>
      
      {!playMode && (
        <div className="progress-container">
          <div className="progress-bar" style={{ width: `${solveProgress * 100}%` }}></div>
        </div>
      )}
    </div>
  );
};

export default SudokuBoard;