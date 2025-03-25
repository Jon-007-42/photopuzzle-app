import React, { useState } from 'react';

const rows = 3;
const cols = 3;

function Puzzle() {
  const shuffle = (array) => {
    const arrCopy = [...array];
    for (let i = arrCopy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arrCopy[i], arrCopy[j]] = [arrCopy[j], arrCopy[i]];
    }
    return arrCopy;
  };

  const generateInitialPieces = () => {
    const array = Array.from({ length: rows * cols }, (_, i) => i);
    return shuffle(array);
  };

  const [pieces, setPieces] = useState(generateInitialPieces);
  const [firstSelectedIndex, setFirstSelectedIndex] = useState(null);

  const isPuzzleSolved = (arr) => {
    return arr.every((val, index) => val === index);
  };

  const handlePieceClick = (clickedIndex) => {
    if (firstSelectedIndex === null) {
      setFirstSelectedIndex(clickedIndex);
    } else {
      const newPieces = [...pieces];
      [newPieces[firstSelectedIndex], newPieces[clickedIndex]] =
        [newPieces[clickedIndex], newPieces[firstSelectedIndex]];
      setPieces(newPieces);
      setFirstSelectedIndex(null);

      if (isPuzzleSolved(newPieces)) {
        alert('Tillykke! Du har samlet puzzlet!');
      }
    }
  };

  return (
    <div style={styles.puzzleContainer}>
      {pieces.map((pieceValue, index) => {
        const pieceRow = Math.floor(pieceValue / cols);
        const pieceCol = pieceValue % cols;

        return (
          <div
            key={index}
            onClick={() => handlePieceClick(index)}
            style={{
              ...styles.piece,
              width: `${100 / cols}%`,
              backgroundPosition: `${(pieceCol * 100) / (cols - 1)}% ${(pieceRow * 100) / (rows - 1)}%`,
            }}
          >
            {index === firstSelectedIndex && <div style={styles.highlight} />}
          </div>
        );
      })}
    </div>
  );
}

const styles = {
  puzzleContainer: {
    width: '90vw',
    height: '90vw',
    maxWidth: '90vh',
    maxHeight: '90vh',
    margin: '0 auto',
    display: 'flex',
    flexWrap: 'wrap',
    border: '2px solid #ccc',
    position: 'relative',
  },
  piece: {
    aspectRatio: '1',
    boxSizing: 'border-box',
    border: '1px solid #999',
    backgroundImage: 'url("/sample.jpg")',
    backgroundSize: `${cols * 100}% ${rows * 100}%`,
    cursor: 'pointer',
    position: 'relative',
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
