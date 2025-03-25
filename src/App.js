import React, { useState, useEffect, useRef } from 'react';

// Puzzle-komponent (3x3)
function Puzzle({ imageUrl, onPuzzleComplete }) {
  const [pieces, setPieces] = useState([]);
  const [firstSelected, setFirstSelected] = useState(null);

  // Tidsmåling
  const [time, setTime] = useState(0);
  const [timerActive, setTimerActive] = useState(false);

  // Bland brikker ved mount
  useEffect(() => {
    const rows = 3;
    const cols = 3;
    const total = rows * cols;
    const arr = Array.from({ length: total }, (_, i) => i);

    // Fisher-Yates shuffle
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    setPieces(arr);

    // Start tidtagning
    setTime(0);
    setTimerActive(true);
  }, []);

  // Opdater tid
  useEffect(() => {
    if (!timerActive) return;
    const interval = setInterval(() => setTime((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, [timerActive]);

  // Klik på en brik
  const swapPieces = (index) => {
    if (!timerActive) return;
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
        setTimerActive(false);
        onPuzzleComplete(time + 1); // +1 for at tælle sidste sekund
      }
    }
  };

  // Billedet slices i 3x3
  const rows = 3;
  const cols = 3;
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
      {/* Timer vises evt. øverst til venstre */}
      <div style={styles.timer}>Time: {time}s</div>
    </div>
  );
}

// Hoved-App
function App() {
  // step: 'start' -> 'puzzle' -> 'done'
  const [step, setStep] = useState('start');
  const [imageSrc, setImageSrc] = useState(null);
  const [finalTime, setFinalTime] = useState(0);

  const fileInputRef = useRef(null);

  // Håndter filvalg
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

  // Når puzzle er løst
  const handlePuzzleComplete = (timeUsed) => {
    setFinalTime(timeUsed);
    setStep('done');
  };

  // Step: "start" -> vis stor "START"-knap
  if (step === 'start') {
    return (
      <div style={styles.center}>
        <h1 style={styles.title}>Puzzle Game</h1>
        <button
          style={styles.startBtn}
          onClick={() => {
            fileInputRef.current.click(); // Bruger-aktivation for at åbne kamera
          }}
        >
          Take Photo
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

  // Step: "puzzle" -> Puzzle
  if (step === 'puzzle') {
    return (
      <Puzzle
        imageUrl={imageSrc}
        onPuzzleComplete={handlePuzzleComplete}
      />
    );
  }

  // Step: "done" -> Vis originalbillede i fuld skærm + tid
  if (step === 'done') {
    return (
      <div style={styles.doneContainer}>
        <img src={imageSrc} alt="Puzzle" style={styles.doneImage} />
        <div style={styles.textOverlay}>
          Tillykke! You used {finalTime} seconds!
        </div>
        <div style={styles.btnRow}>
          <button style={styles.btn} onClick={() => window.location.reload()}>
            Take new photo
          </button>
        </div>
      </div>
    );
  }

  return null;
}

// Styles
const styles = {
  center: {
    width: '100vw',
    height: '100vh',
    background: '#123',
    color: '#fff',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: '2rem',
    marginBottom: '1rem',
  },
  startBtn: {
    padding: '1rem 2rem',
    fontSize: '1.2rem',
    background: '#0c0',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  puzzleContainer: {
    width: '100vw',
    height: '100vh',
    background: '#000',
    display: 'flex',
    flexWrap: 'wrap',
    margin: 0,
    position: 'relative',
  },
  piece: {
    aspectRatio: '1',
    border: '1px solid #555',
    backgroundRepeat: 'no-repeat',
    position: 'relative',
    cursor: 'pointer',
  },
  highlight: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    border: '3px solid red',
  },
  timer: {
    position: 'absolute',
    top: 10,
    left: 10,
    color: '#fff',
    fontSize: '1.2rem',
    textShadow: '1px 1px 2px #000',
  },
  doneContainer: {
    position: 'relative',
    width: '100vw',
    height: '100vh',
    overflow: 'hidden',
    background: '#000',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneImage: {
    objectFit: 'cover',
    width: '100%',
    height: '100%',
  },
  textOverlay: {
    position: 'absolute',
    top: 20,
    width: '100%',
    textAlign: 'center',
    color: '#fff',
    fontSize: '1.5rem',
    textShadow: '1px 1px 2px #000',
  },
  btnRow: {
    position: 'absolute',
    bottom: 40,
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
  },
  btn: {
    padding: '0.8rem 1.2rem',
    border: 'none',
    borderRadius: 8,
    backgroundColor: '#666',
    color: '#fff',
    fontSize: '1rem',
    cursor: 'pointer',
  },
};

export default App;
