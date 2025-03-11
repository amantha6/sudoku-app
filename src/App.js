// App.js
import React from 'react';
import SudokuBoard from './SudokuBoard';
import './App.css';

function App() {
  return (
    <div className="App">
      <h1>Sudoku Generator and Solver</h1>
      <SudokuBoard />
    </div>
  );
}

export default App;