import React from 'react';
import Puzzle from './Puzzle';

function App() {
  return (
    <div style={{ textAlign: 'center' }}>
      <h1>PhotoPuzzle</h1>
      <p>Prøv at klikke på to brikker for at bytte dem!</p>
      <Puzzle />
    </div>
  );
}

export default App;
