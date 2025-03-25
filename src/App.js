import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';

function App() {
  // 'camera' => vis input til at tage foto
  // 'puzzle' => vis puzzle
  // 'done'   => puzzle l�st -> vis originalbillede
  const [step, setStep] = useState('camera');
  const [imageSrc, setImageSrc] = useState(null);

  // Kaldes, n�r brugeren har taget et foto
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      setImageSrc(evt.target.result);
      setStep('puzzle');  // g� direkte til puzzle
    };
    reader.readAsDataURL(file);
  };

  // Hvis vi stadig venter p� et billede:
  if (step === 'camera') {
    return (
      <div style={styles.center}>
        <h2>Tag et billede</h2>
        <input
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          style={styles.fileInput}
        />
      </div>
    );
  }

  // Puzzle-trin
  if (step === 'puzzle') {
    return (
      <Puzzle
        imageUrl={imageSrc}
        rows={3}
        cols={3}
        onPuzzleComplete={() => setStep('done')}
      />
    );
  }

  // Hvis puzzle er l�st
  if (step === 'done') {
    return (
      <div style={styles.doneContainer}>
        <p>Du har l�st puzzlet!</p>
        <img src={imageSrc} alt="Original" style={styles.doneImage} />
        <button onClick={() => window.location.reload()}>
          Tag nyt billede
        </button>
      </div>
    );
  }

  return null; 
}

// Puzzle-komponenten
function Puzzle({ imageUrl, rows = 3, cols = 3, onPuzzleComplete }) {
  const [pieces, setPieces] = useState([]);
  const [firstSelected, setFirstSelected] = useState(null);

  // Bland brikkerne, n�r komponenten vises
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

  // Bytter to brikker
  const swapPieces = (index) => {
    if (firstSelected === null) {
      setFirstSelected(index);
    } else {
      const newPieces = [...pieces];
      [newPieces[firstSelected], newPieces[index]] =
        [newPieces[index], newPieces[firstSelected]];
      setPieces(newPieces);
      setFirstSelected(null);

      // Tjek om puzzle er l�st
      if (newPieces.every((val, idx) => val === idx)) {
        onPuzzleComplete && onPuzzleComplete();
      }
    }
  };

  return (
    <div style={styles.puzzleContainer}>
      {pieces.map((val, idx) => {
        const row = Math.floor(val / cols);
        const col = val % cols;

        return (
          <div
            key={idx}
            onClick={() => swapPieces(idx)}
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

// Lidt simple styles
const styles = {
  center: {
    width: '100vw',
    height: '100vh',
    background: '#222',
    color: '#fff',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileInput: {
    marginTop: '1rem',
    color: '#fff',
  },
  puzzleContainer: {
    width: '100vw',
    height: '100vh',
    display: 'flex',
    flexWrap: 'wrap',
    margin: 0,
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
  doneContainer: {
    width: '100vw',
    height: '100vh',
    background: '#333',
    color: '#fff',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneImage: {
    maxWidth: '90%',
    maxHeight: '70%',
    marginBottom: '1rem',
  },
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
