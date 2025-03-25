import React, { useState, useEffect, useMemo } from 'react';

function Puzzle({ imageUrl, rows = 3, cols = 3, aspectRatio = 1 }) {
  const [pieces, setPieces] = useState([]);
  const [firstSelectedIndex, setFirstSelectedIndex] = useState(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  // Shuffle funktion
  const shuffle = (array) => {
    const arrCopy = [...array];
    for (let i = arrCopy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arrCopy[i], arrCopy[j]] = [arrCopy[j], arrCopy[i]];
    }
    return arrCopy;
  };

  // Initialisér brikker
  useEffect(() => {
    const total = rows * cols;
    const ordered = Array.from({ length: total }, (_, i) => i);
    setPieces(shuffle(ordered));
  }, [rows, cols]);

  // Lyt til skærmstørrelse og tilpas containeren
  useEffect(() => {
    const updateSize = () => {
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;
      const screenRatio = screenWidth / screenHeight;

      let width, height;

      if (screenRatio > aspectRatio) {
        // Skærmen er bredere end billedet
        height = screenHeight;
        width = height * aspectRatio;
      } else {
        // Skærmen er højere end billedet
        width = screenWidth;
        height = width / aspectRatio;
      }

      setContainerSize({ width, height });
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [aspectRatio]);

  const isPuzzleSolved = useMemo(() => {
    return pieces.every((val, index) => val === index);
  }, [pieces]);

  const handlePieceClick = (clickedIndex) => {
    if (firstSelectedIndex === null) {
      setFirstSelectedIndex(clickedIndex);
    } else {
      const newPieces = [...pieces];
      [newPieces[firstSelectedIndex], newPieces[clickedIndex]] =
        [newPieces[clickedIndex], newPieces[firstSelectedIndex]];
      setPieces(newPieces);
      setFirstSelectedIndex(null);

      if (newPieces.every((val, index) => val === index)) {
        alert('Tillykke! Du har samlet puzzlet!');
      }
    }
  };

  return (
    <div
      style={{
        ...styles.puzzleContainer,
        width: containerSize.width,
        height: containerSize.height,
      }}
    >
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
              backgroundImage: `url(${imageUrl})`,
              backgroundSize: `${cols * 100}% ${rows * 100}%`,
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
    display: 'flex',
    flexWrap: 'wrap',
    margin: '0 auto',
    border: '2px solid #000',
    position: 'relative',
    background: '#000',
    touchAction: 'none',
    overflow: 'hidden',
  },
  piece: {
    aspectRatio: '1',
    boxSizing: 'border-box',
    border: '1px solid #555',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    backgroundSize: 'cover',
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
