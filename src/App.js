import React, { useState } from 'react';
import Puzzle from './Puzzle';

function App() {
  const [imageSrc, setImageSrc] = useState(null);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    setError('');
    const file = e.target.files[0];
    if (!file) return;

    // L�s billedet som DataURL
    const reader = new FileReader();
    reader.onload = (evt) => {
      const img = new Image();
      img.onload = () => {
        // Tjek om billedet er vertical/portrait
        if (img.width >= img.height) {
          setError('Billedet er ikke lodret. Pr�v venligst igen med et vertikalt billede.');
        } else {
          setImageSrc(evt.target.result);
        }
      };
      img.src = evt.target.result;
    };
    reader.readAsDataURL(file);
  };

  // Hvis vi har et "fejl"-flag
  if (error) {
    return (
      <div style={styles.center}>
        <p style={{ color: 'red' }}>{error}</p>
        <button onClick={() => window.location.reload()}>
          V�lg nyt billede
        </button>
      </div>
    );
  }

  // Ingen billede valgt endnu => vis upload-knap
  if (!imageSrc) {
    return (
      <div style={styles.center}>
        <input
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          style={styles.fileInput}
        />
        <p>V�lg/tjek et lodret billede</p>
      </div>
    );
  }

  // Har billede => vis puzzle
  return <Puzzle imageUrl={imageSrc} rows={3} cols={3} />;
}

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
    marginBottom: '1rem',
  },
};

export default App;
