import React from 'react';
import Puzzle from './Puzzle';

function App() {
  return (
    <div style={{ padding: '1rem', textAlign: 'center' }}>
      <h1>gigPhotoPuzzle</h1>
      <p>Klik på to brikker for at bytte dem og samle billedet.</p>
      <Puzzle />
    </div>
  );
}

export default App;
