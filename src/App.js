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
      aspectRatio: width / height
    });
  };

  if (!puzzleSettings) {
    return <ImageUpload onImageSelected={handleImageSelected} />;
  }

  if (!hasStarted) {
    return (
      <div style={styles.previewContainer(puzzleSettings.imageUrl)}>
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
    />
  );
}

const styles = {
  previewContainer: (url) => ({
    height: '100vh',
    width: '100vw',
    backgroundImage: `url(${url})`,
    backgroundSize: 'cover',            // <-- "cover"
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-end',
    backgroundColor: '#000',
  }),
  startButton: {
    marginBottom: '2rem',
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
