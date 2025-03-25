import React, { useState, useEffect } from 'react';

function Puzzle({ imageUrl, rows = 3, cols = 3 }) {
  const [pieces, setPieces] = useState([]);
  const [firstSelectedIndex, setFirstSelectedIndex] = useState(null);

  useEffect(() => {
    const total = rows * cols;
    const arr = Array.from({ length: total }, (_, i) => i);
    // Shuffle
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    setPieces(arr);
  }, [rows, cols]);

  const handlePieceClick = (index) => {
    if (firstSelectedIndex === null) {
      setFirstSelectedIndex(index);
    } else {
      const newPieces = [...pieces];
      [newPieces[firstSelectedIndex], newPieces[index]] =
        [newPieces[index], newPieces[firstSelectedIndex]];
      setPieces(newPieces);
      setFirstSelectedIndex(null);

      // Check solved
      if (newPieces.every((val, idx) => val === idx)) {
        alert('Tillykke! Du har samlet puzzlet!');
      }
    }
  };

  return (
    <div style={styles.container}>
      {pieces.map((pieceValue, index) => {
        const pieceRow = Math.floor(pieceValue / cols);
        const pieceCol = pieceValue % cols;

        // Laver en "dynamisk" position
        const posX = (pieceCol / (cols - 1)) * 100; 
        const posY = (pieceRow / (rows - 1)) * 100;

        return (
          <div
            key={index}
            style={{
              ...styles.piece,
              width: `${100 / cols}%`,
              backgroundImage: `url(${imageUrl})`,
              backgroundSize: 'cover',       // <-- "cover"
              backgroundPosition: 'center',  // <-- center (vi bruger posX/posY i original puzzle, men "cover" overrides det delvist)
            }}
            onClick={() => handlePieceClick(index)}
          >
            {index === firstSelectedIndex && (
              <div style={styles.highlight} />
            )}
          </div>
        );
      })}
    </div>
  );
}

const styles = {
  container: {
    height: '100vh',
    width: '100vw',
    display: 'flex',
    flexWrap: 'wrap',
    margin: 0,
    border: '2px solid #000',
    background: '#000',
    position: 'relative'
  },
  piece: {
    aspectRatio: '1',
    boxSizing: 'border-box',
    border: '1px solid #555',
    cursor: 'pointer',
    position: 'relative',
    backgroundRepeat: 'no-repeat',
  },
  highlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    border: '3px solid red',
  },
};

export default Puzzle;
