import React, { useState } from 'react';
import ImageUpload from './ImageUpload';
import CropView from './CropView';
import Puzzle from './Puzzle';

function App() {
  const [rotatedData, setRotatedData] = useState(null);   // Billedet fixet for EXIF
  const [croppedData, setCroppedData] = useState(null);   // Billedet beskåret
  const [hasStarted, setHasStarted] = useState(false);

  // 1) Kaldes når ImageUpload er færdig
  const handleImageSelected = (imageUrl, width, height) => {
    // gem i rotatedData, mens vi venter på crop
    setRotatedData({ imageUrl, width, height });
  };

  // 2) Kaldes når CropView er færdig
  const handleCropDone = (croppedUrl, cw, ch) => {
    // gem i croppedData
    setCroppedData({ imageUrl: croppedUrl, width: cw, height: ch });
  };

  // => Flow
  // hvis ingen rotatedData => upload
  if (!rotatedData) {
    return <ImageUpload onImageSelected={handleImageSelected} />;
  }

  // hvis der er rotatedData, men ingen croppedData => CropView
  if (!croppedData) {
    return (
      <CropView
        imageUrl={rotatedData.imageUrl}
        onComplete={handleCropDone}
      />
    );
  }

  // hvis puzzle ikke er startet, vis en preview / “Start Puzzle” knap
  if (!hasStarted) {
    return (
      <div style={styles.previewContainer(croppedData.imageUrl)}>
        <button style={styles.startButton} onClick={() => setHasStarted(true)}>
          Start Puzzle
        </button>
      </div>
    );
  }

  // ellers -> Puzzle
  return (
    <Puzzle
      imageUrl={croppedData.imageUrl}
      rows={3}
      cols={3}
      // her sætter du fx 3x3, eller ud fra croppedData aspect
    />
  );
}

const styles = {
  previewContainer: (url) => ({
    height: '100vh',
    width: '100vw',
    background: '#000',
    backgroundImage: `url(${url})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-end',
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
