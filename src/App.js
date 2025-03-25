import React, { useState } from 'react';
import Puzzle from './Puzzle';
import ImageUpload from './ImageUpload';

function App() {
  const [puzzleSettings, setPuzzleSettings] = useState(null);
  const [hasStarted, setHasStarted] = useState(false);

  const handleImageSelected = (imageUrl, width, height) => {
    const isPortrait = height >= width;

    setPuzzleSettings({
      imageUrl,
      rows: isPortrait ? 5 : 3,
      cols: isPortrait ? 3 : 5,
      aspectRatio: width / height,
    });
  };

  if (!puzzleSettings) {
    return <ImageUpload onImageSelected={handleImageSelected} />;
  }

  if (!hasStarted) {
    return (
      <div style={styles.previewContainer}>
        <img
          src={puzzleSettings.imageUrl}
          alt="preview"
          style={styles.previewImage}
        />
        <button style={styles.startButton} onClick={() => setHasStarted(true)}>
          Start Puzzle
        </button>
      </div>
    );
  }

  return (
    <Puzzle
      imageUrl={puzzleSettings.imageUrl}
      rows={puzzleSettings.rows}
      cols={puzzleSettings.cols}
      aspectRatio={puzzleSettings.aspectRatio}
    />
  );
}

const styles = {
  previewContainer: {
    height: '100svh',
    width: '100svw',
    backgroundColor: '#000',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  previewImage: {
    maxWidth: '100%',
    maxHeight: '100%',
    objectFit: 'contain',
  },
  startButton: {
    position: 'absolute',
    bottom: '2rem',
    padding: '1rem 2rem',
    fontSize: '1.2rem',
    backgroundColor: '#fff',
    color: '#000',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
  },
};

export default App;
