import React, { useState, useEffect } from 'react';
import Puzzle from './Puzzle';

function App() {
  const [showOverlay, setShowOverlay] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowOverlay(false), 3000); // Skjul efter 3 sek.
    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={styles.app}>
      {showOverlay && (
        <div style={styles.overlay}>
          <h1>PhotoPuzzle</h1>
          <p>Byt brikkerne og saml billedet!</p>
        </div>
      )}
      <Puzzle />
    </div>
  );
}

const styles = {
  app: {
    height: '100vh',
    width: '100vw',
    position: 'relative',
    overflow: 'hidden',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 10,
    width: '100%',
    height: '100%',
    background: 'rgba(0, 0, 0, 0.85)',
    color: '#fff',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    padding: '2rem',
    fontSize: '1.5rem',
  },
};

export default App;
