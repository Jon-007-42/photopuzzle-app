import React, { useState, useEffect } from 'react';

/**
 * Konfiguration af puzzle.
 * rows = 3, cols = 3 => 9 brikker i alt
 */
const rows = 3;
const cols = 3;

function Puzzle() {
  // Opretter en array [0..8] med indexes for hver brik
  const generateInitialPieces = () => {
    const array = Array.from({ length: rows * cols }, (_, i) => i);
    // Bland (shuffle) brikkerne
    return shuffle(array);
  };

  // State: 'pieces' holder den nuværende rækkefølge af brikker
  const [pieces, setPieces] = useState(generateInitialPieces);

  // State: gem indexet på den første klik, så vi ved hvilke to brikker der skal byttes
  const [firstSelectedIndex, setFirstSelectedIndex] = useState(null);

  // Shuffle-funktion (simpel random sort)
  function shuffle(array) {
    const arrCopy = [...array];
    for (let i = arrCopy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arrCopy[i], arrCopy[j]] = [arrCopy[j], arrCopy[i]];
    }
    return arrCopy;
  }

  // Tjek om puzzle er løst: dvs. pieces[i] == i for alle i
  const isPuzzleSolved = (arr) => {
    return arr.every((val, index) => val === index);
  };

  // Når en brik klikkes
  const handlePieceClick = (clickedIndex) => {
    // Hvis der ikke er valgt en brik i forvejen
    if (firstSelectedIndex === null) {
      setFirstSelectedIndex(clickedIndex); // Gem indexet
    } else {
      // Byt de to brikker i 'pieces'
      const newPieces = [...pieces];
      [newPieces[firstSelectedIndex], newPieces[clickedIndex]] =
        [newPieces[clickedIndex], newPieces[firstSelectedIndex]];

      setPieces(newPieces);
      setFirstSelectedIndex(null);

      // Tjek om puzzle nu er løst
      if (isPuzzleSolved(newPieces)) {
        alert('Tillykke! Du har samlet puzzle!');
      }
    }
  };

  // Gør brikkerne klar til at blive vist i et 3x3 grid
  // Hver brik har en baggrundsposition, så den viser det rette udsnit af billedet
  // pieces[i] fortæller, hvor i billedet vi skal "kigge" (brikens "rigtige" position).
  return (
    <div style={styles.puzzleContainer}>
      {pieces.map((pieceValue, index) => {
        // row og col for den *rigtige* position
        const pieceRow = Math.floor(pieceValue / cols);
        const pieceCol = pieceValue % cols;

        return (
          <div
            key={index}
            onClick={() => handlePieceClick(index)}
            style={{
              ...styles.piece,
              backgroundPosition: `-${pieceCol * 100}px -${pieceRow * 100}px`,
              // Bemærk: Du skal justere width/height efter hvor stort billedet er
            }}
          >
            {/* Vis en kant eller farve, hvis dette er den udvalgte brik */}
            {index === firstSelectedIndex && (
              <div style={styles.highlight} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// Inline styles for at gøre eksemplet enkelt
const styles = {
  puzzleContainer: {
    width: '300px',   // Samlet bredde
    height: '300px',  // Samlet højde
    margin: '0 auto', // Centrer på siden
    display: 'flex',
    flexWrap: 'wrap',
    border: '2px solid #ccc',
    position: 'relative',
  },
  piece: {
    width: '100px',   // Bredde på hver brik (300px / 3 brikker)
    height: '100px',  // Højde på hver brik
    boxSizing: 'border-box',
    border: '1px solid #999',
    backgroundImage: 'url("/sample.jpg")', // Billedet du har lagt i public/
    backgroundSize: '300px 300px',         // Viser "hele billedet" i 300x300 
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
