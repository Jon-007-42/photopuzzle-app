import React, { useState, useEffect, useRef } from 'react';

function App() {
  const [step, setStep] = useState('start');
  const [imageSrc, setImageSrc] = useState(null);
  const [finalTime, setFinalTime] = useState(0);
  const fileInputRef = useRef(null);

  // Håndter filvalg (kamera/filvælger)
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      setImageSrc(evt.target.result);
      setStep('puzzle');
    };
    reader.readAsDataURL(file);
  };

  // Start: en hvid skærm med "Take photo"-knap
  if (step === 'start') {
    return (
      <div style={styles.startContainer}>
        <button
          style={styles.takePhotoBtn}
          onClick={() => fileInputRef.current && fileInputRef.current.click()}
        >
          Take photo
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
      </div>
    );
  }

  // Puzzle-skærm
  if (step === 'puzzle') {
    return (
      <Puzzle
        imageUrl={imageSrc}
        onPuzzleComplete={(seconds) => {
          setFinalTime(seconds);
          setStep('done');
        }}
      />
    );
  }

  // Done-skærm => Vis originalbillede i fuldskærm + tid + 2 knapper
  if (step === 'done') {
    return (
      <div style={styles.doneContainer}>
        <img src={imageSrc} alt="Puzzle" style={styles.doneImage} />
        <div style={styles.textOverlay}>
          You used {finalTime} seconds!
        </div>
        <div style={styles.btnRow}>
          <button style={styles.btn} onClick={() => window.location.reload()}>
            Take photo
          </button>
          <button style={styles.btn} onClick={handleShare}>
            Share puzzle
          </button>
        </div>
      </div>
    );
  }

  return null;
}

// Puzzle-komponent
function Puzzle({ imageUrl, onPuzzleComplete }) {
  const [pieces, setPieces] = useState([]);
  const [firstSelected, setFirstSelected] = useState(null);
  const [startTime] = useState(() => Date.now());

  useEffect(() => {
    const rows = 3;
    const cols = 3;
    const total = rows * cols;
    const arr = Array.from({ length: total }, (_, i) => i);

    // Fisher-Yates shuffle
    shuffleArray(arr);

    // Hvis puzzle ender ufatteligt i [0..8], shuffle igen
    let attempts = 0;
    while (arr.every((val, idx) => val === idx) && attempts < 10) {
      shuffleArray(arr);
      attempts++;
    }

    setPieces(arr);
  }, []);

  const swapPieces = (index) => {
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
        const endTime = Date.now();
        const totalSeconds = Math.round((endTime - startTime) / 1000);
        onPuzzleComplete && onPuzzleComplete(totalSeconds);
      }
    }
  };

  return (
    <div style={styles.puzzleContainer}>
      {pieces.map((val, idx) => {
        const rows = 3;
        const cols = 3;
        // Hvilken del af billedet
        const row = Math.floor(val / cols);
        const col = val % cols;
        return (
          <div
            key={idx}
            onClick={() => swapPieces(idx)}
            style={{
              ...styles.piece,
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

// Lidt hjælp
function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

// Knappen "Share puzzle"
function handleShare() {
  if (navigator.share) {
    navigator.share({
      title: 'Puzzle completed!',
      text: 'I completed the puzzle!',
      // url: 'https://your-site.com' // valgfrit
    });
  } else {
    alert('Sharing not supported in this browser.');
  }
}

// CSS-in-JS styles
const styles = {
  // Startskærm
  startContainer: {
    width: '100vw',
    height: '100vh',
    background: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  takePhotoBtn: {
    backgroundColor: 'transparent',
    border: '2px solid lightblue',
    color: 'lightblue',
    fontSize: '1.5rem',
    padding: '1rem 2rem',
    borderRadius: 8,
    transition: 'background-color 0.2s, color 0.2s',
  },

  // Puzzle-skærm => grid layout
  puzzleContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gridTemplateRows: 'repeat(3, 1fr)',
    gap: '3px', // synlig afstand mellem brikker
    width: '100vw',
    height: '100vh',
    background: '#000',
  },
  piece: {
    backgroundRepeat: 'no-repeat',
    backgroundColor: '#222',    // hvis billedet ikke fylder alt
    border: '2px solid #ccc',   // lys kant => tydelige brikker
    position: 'relative',
    cursor: 'pointer',
  },
  highlight: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    border: '3px solid red',
  },

  // Slutskærm
  doneContainer: {
    position: 'relative',
    width: '100vw',
    height: '100vh',
    background: '#000',
  },
  doneImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  textOverlay: {
    position: 'absolute',
    top: '2rem',
    width: '100%',
    textAlign: 'center',
    fontSize: '1.8rem',
    color: '#fff',
    textShadow: '1px 1px 2px #000',
  },
  btnRow: {
    position: 'absolute',
    bottom: '2rem',
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    gap: '1rem',
  },
  btn: {
    backgroundColor: 'transparent',
    border: '2px solid #ccc',
    padding: '0.8rem 1.5rem',
    color: '#fff',
    fontSize: '1rem',
    borderRadius: '8px',
    transition: 'background-color 0.2s, color 0.2s',
  },
};

export default App;
