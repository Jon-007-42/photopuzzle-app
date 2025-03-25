import React, { useState, useEffect } from 'react';

function Puzzle({ imageUrl, rows = 3, cols = 3 }) {
  const [pieces, setPieces] = useState([]);
  const [firstSelected, setFirstSelected] = useState(null);

  // Shuffle stykker ved start:
  useEffect(() => {
    const total = rows * cols;
    const arr = Array.from({ length: total }, (_, i) => i);

    // Fisher-Yates shuffle
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    setPieces(arr);
  }, [rows, cols]);

  const handleClick = (index) => {
    if (firstSelected === null) {
      setFirstSelected(index);
    } else {
      const newPieces = [...pieces];
      [newPieces[firstSelected], newPieces[index]] =
        [newPieces[index], newPieces[firstSelected]];
      setPieces(newPieces);
      setFirstSelected(null);

      // Tjek om puzzle er løst
      if (newPieces.every((val, idx) => val === idx)) {
        alert('Tillykke! Du har samlet puzzlet!');
      }
    }
  };

  return (
    <div style={styles.container}>
      {pieces.map((val, idx) => {
        // "val" fortæller, hvilken del af billedet vi skal vise
        const row = Math.floor(val / cols);
        const col = val % cols;

        return (
          <div
            key={idx}
            onClick={() => handleClick(idx)}
            style={{
              ...styles.piece,
              width: `${100 / cols}%`,
              backgroundImage: `url(${imageUrl})`,
              backgroundSize: `${cols * 100}% ${rows * 100}%`,
              backgroundPosition: `
                ${(col * 100) / (cols - 1)}%
                ${(row * 100) / (rows - 1)}%
              `,
            }}
          >
            {idx === firstSelected && <div style={styles.highlight} />}
          </div>
        );
      })}
    </div>
  );
}

const styles = {
  container: {
    width: '100vw',
    height: '100vh',
    display: 'flex',
    flexWrap: 'wrap',
    margin: 0,
    border: '2px solid #000',
    background: '#000',
    position: 'relative',
  },
  piece: {
    aspectRatio: '1',
    boxSizing: 'border-box',
    border: '1px solid #555',
    cursor: 'pointer',
    backgroundRepeat: 'no-repeat',
    position: 'relative',
  },
  highlight: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    border: '3px solid red',
  },
};

export default Puzzle;
