// src/App.js
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './supabaseClient';

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

    // Undgå at puzzle starter 100% løst
    let tries = 0;
    while (arr.every((val, idx) => val === idx) && tries < 10) {
      shuffleArray(arr);
      tries++;
    }

    setPieces(arr);
  }, []);

  const handleClickPiece = (index) => {
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
        const timeUsed = Math.round((endTime - startTime) / 1000);
        onPuzzleComplete(timeUsed);
      }
    }
  };

  return (
    <div style={styles.puzzleContainer}>
      {pieces.map((val, idx) => {
        const rows = 3;
        const cols = 3;
        const row = Math.floor(val / cols);
        const col = val % cols;

        return (
          <div
            key={idx}
            onClick={() => handleClickPiece(idx)}
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

function App() {
  const [step, setStep] = useState('start');  // start -> puzzle -> done
  const [puzzleId, setPuzzleId] = useState(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [finalTime, setFinalTime] = useState(0);
  const [userName, setUserName] = useState('');
  const [scoreboard, setScoreboard] = useState([]);
  const fileInputRef = useRef(null);

  // Tjek URL param '?pid=xxx'
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pid = params.get('pid');
    if (pid) {
      loadPuzzle(pid);
    }
  }, []);

  // Henter puzzle fra Supabase, sætter puzzleId + imageSrc => puzzle-step
  async function loadPuzzle(pid) {
    const { data: puzzle, error } = await supabase
      .from('puzzles')
      .select('*')
      .eq('puzzle_id', pid)
      .single();
    
    if (error) {
      console.error("Could not load puzzle:", error);
      return;
    }
    setPuzzleId(pid);
    setImageSrc(puzzle.image_url);
    setStep('puzzle');
  }

  // Bruger vælger billede => gem puzzle i Supabase => puzzleId
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const newPuzzleId = crypto.randomUUID(); // ID
    const reader = new FileReader();
    reader.onload = async (evt) => {
      const dataUrl = evt.target.result;
      setImageSrc(dataUrl);

      // Gem puzzle
      const { data, error } = await supabase
        .from('puzzles')
        .insert({
          puzzle_id: newPuzzleId,
          image_url: dataUrl,
        })
        .select();

      if (error) {
        console.error("Fejl ved indsættelse af puzzle:", error);
        return;
      }
      setPuzzleId(newPuzzleId);
      setStep('puzzle');
    };
    reader.readAsDataURL(file);
  };

  // Start-skærm
  if (step === 'start') {
    return (
      <div style={styles.startContainer}>
        <button
          style={styles.takePhotoBtn}
          onClick={() => fileInputRef.current?.click()}
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
        onPuzzleComplete={(timeUsed) => {
          setFinalTime(timeUsed);
          setStep('done');
        }}
      />
    );
  }

  // Slut-skærm => Indtast navn, gem score, vis scoreboard, del puzzle
  if (step === 'done') {
    const puzzleLink = `${window.location.origin}/?pid=${puzzleId}`;

    return (
      <div style={styles.doneContainer}>
        <img src={imageSrc} alt="Puzzle" style={styles.doneImage} />
        <div style={styles.overlay}>
          <p>You used {finalTime} seconds!</p>
          
          {/* Navn + Submit Score */}
          {!scoreboard.length && (
            <>
              <input
                placeholder="Your name"
                style={styles.input}
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
              />
              <button
                style={styles.btn}
                onClick={async () => {
                  // Indsæt i "scores"
                  const { data, error } = await supabase
                    .from('scores')
                    .insert({
                      puzzle_id: puzzleId,
                      user_name: userName || 'Anonymous',
                      time_seconds: finalTime,
                    })
                    .select();

                  if (error) {
                    console.error("Fejl ved indsættelse af score:", error);
                  } else {
                    // Hent scoreboard
                    const { data: scoreData, error: scoreErr } = await supabase
                      .from('scores')
                      .select('*')
                      .eq('puzzle_id', puzzleId)
                      .order('time_seconds', { ascending: true });
                    
                    if (scoreErr) {
                      console.error("Fejl scoreboard:", scoreErr);
                    } else {
                      setScoreboard(scoreData);
                    }
                  }
                }}
              >
                Submit score
              </button>
            </>
          )}
          
          {/* Vis scoreboard hvis scoreboard.length > 0 */}
          {scoreboard.length > 0 && (
            <div style={{ textAlign: 'left', marginTop: '1rem' }}>
              <h3>Scoreboard (lowest time first)</h3>
              <ol>
                {scoreboard.map((s) => (
                  <li key={s.id}>
                    {s.user_name} - {s.time_seconds}s
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Del puzzle-link */}
          <p style={{ marginTop: '1rem' }}>Share link:</p>
          <p>{puzzleLink}</p>
          <button
            style={styles.btn}
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: 'Try my puzzle!',
                  text: `I got ${finalTime} seconds! Beat me?`,
                  url: puzzleLink,
                })
                .catch(err => console.error("Share failed:", err));
              } else {
                alert(`Copy link: ${puzzleLink}`);
              }
            }}
          >
            Share puzzle
          </button>

          <button
            style={styles.btn}
            onClick={() => window.location.reload()}
          >
            Take new photo
          </button>
        </div>
      </div>
    );
  }

  return null;
}

// Fisher-Yates shuffle
function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

// CSS
const styles = {
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
    cursor: 'pointer',
  },
  puzzleContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3,1fr)',
    gridTemplateRows: 'repeat(3,1fr)',
    gap: '3px',
    width: '100vw',
    height: '100vh',
    background: '#000',
  },
  piece: {
    backgroundRepeat: 'no-repeat',
    backgroundColor: '#222',
    border: '2px solid #ccc',
    cursor: 'pointer',
    position: 'relative',
  },
  highlight: {
    position: 'absolute',
    inset: 0,
    border: '3px solid red',
  },
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
  overlay: {
    position: 'absolute',
    top: '10%',
    left: '50%',
    transform: 'translateX(-50%)',
    background: 'rgba(0,0,0,0.6)',
    color: '#fff',
    padding: '1rem 2rem',
    textAlign: 'center',
    borderRadius: 8,
    maxWidth: '90%',
  },
  input: {
    marginTop: '1rem',
    padding: '0.5rem',
    borderRadius: 4,
    border: '1px solid #ccc',
  },
  btn: {
    display: 'block',
    margin: '1rem auto 0',
    backgroundColor: 'transparent',
    border: '2px solid lightblue',
    color: 'lightblue',
    fontSize: '1rem',
    padding: '0.5rem 1rem',
    borderRadius: 8,
    cursor: 'pointer',
  },
};

export default App;
