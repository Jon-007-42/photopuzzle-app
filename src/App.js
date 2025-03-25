import React, { useState, useEffect, useRef } from 'react';

// Puzzle-komponent
function Puzzle({ imageUrl, rows = 3, cols = 3, onPuzzleComplete }) {
  const [pieces, setPieces] = useState([]);
  const [firstSelected, setFirstSelected] = useState(null);

  // Tidsmåling
  const [time, setTime] = useState(0);
  const [timerActive, setTimerActive] = useState(false);

  useEffect(() => {
    // Bland brikker ved load
    const total = rows * cols;
    const arr = Array.from({ length: total }, (_, i) => i);

    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    setPieces(arr);

    // Start timer
    setTime(0);
    setTimerActive(true);
  }, [rows, cols]);

  // Opdater timer
  useEffect(() => {
    if (!timerActive) return;
    const interval = setInterval(() => setTime((prev) => prev + 1), 1000);
    return () => clearInterval(interval);
  }, [timerActive]);

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
        onPuzzleComplete && onPuzzleComplete(time + 1); // +1 for at tælle det sidste sekund
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

// App-komponent: Kamera ? Puzzle ? Done
function App() {
  const [step, setStep] = useState('camera');
  const [imageSrc, setImageSrc] = useState(null);
  const [finalTime, setFinalTime] = useState(0);
  const fileInputRef = useRef(null);

  // Forsøg at åbne kamera ved load
  useEffect(() => {
    if (step === 'camera' && fileInputRef.current) {
      fileInputRef.current.click(); // Kan blive blokeret af nogle browsere
    }
  }, [step]);

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

  // Share-løsning med Web Share API (hvis browseren understøtter det)
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Puzzle completed!',
        text: `I completed the puzzle in ${finalTime} seconds!`,
        // Du kan evt. tilføje url: 'https://myPuzzle.com' hvis du har en side
      });
    } else {
      alert('Sharing is not supported in this browser.');
    }
  };

  // Step: "camera" ? ingen skærm, vi viser blot en skjult input
  if (step === 'camera') {
    return (
      <div style={styles.hidden}>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
        />
      </div>
    );
  }

  // Step: puzzle
  if (step === 'puzzle') {
    return (
      <Puzzle
        imageUrl={imageSrc}
        onPuzzleComplete={handlePuzzleComplete}
      />
    );
  }

  // Step: done ? vis billede i fuldskærm, tekst, 2 knapper
  if (step === 'done') {
    return (
      <div style={styles.doneContainer}>
        {/* Baggrundsbillede i fuld skærm */}
        <img src={imageSrc} alt="Puzzle" style={styles.doneImage} />
        {/* Overlay-tekst */}
        <div style={styles.textOverlay}>
          Congratulations! You used {finalTime} seconds!
        </div>
        {/* Knapper */}
        <div style={styles.btnRow}>
          <button style={styles.btn} onClick={() => window.location.reload()}>
            Take new photo
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

// Simple styles
const styles = {
  hidden: {
    display: 'none',
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
  },
  highlight: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    border: '3px solid red',
  },
  doneContainer: {
    position: 'relative',
    width: '100vw',
    height: '100vh',
    overflow: 'hidden',
    background: '#000',
  },
  doneImage: {
    objectFit: 'cover',
    width: '100%',
    height: '100%',
  },
  textOverlay: {
    position: 'absolute',
    top: 20,
    left: 0,
    right: 0,
    textAlign: 'center',
    color: '#fff',
    fontSize: '1.5rem',
    fontWeight: 'bold',
    textShadow: '1px 1px 2px #000',
  },
  btnRow: {
    position: 'absolute',
    bottom: 40,
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    gap: '1rem',
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
