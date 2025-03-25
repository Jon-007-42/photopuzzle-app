import React, { useState } from 'react';
import ImageUpload from './ImageUpload';
import CropView from './CropView';
import Puzzle from './Puzzle';

function App() {
  const [step, setStep] = useState('upload'); // 'upload' -> 'crop' -> 'preview' -> 'puzzle'
  const [imageData, setImageData] = useState(null);
  const [cropData, setCropData] = useState(null);

  // 1) Efter EXIF-rotation
  const handleImageSelected = (url, w, h) => {
    setImageData({ url, w, h });
    setStep('crop');
  };

  // 2) Efter rotation + beskæring
  const handleCropDone = (croppedUrl, cw, ch) => {
    setCropData({ url: croppedUrl, w: cw, h: ch });
    setStep('preview');
  };

  if (step === 'upload') {
    return <ImageUpload onImageSelected={handleImageSelected} />;
  }
  if (step === 'crop') {
    return <CropView imageUrl={imageData.url} onComplete={handleCropDone} />;
  }
  if (step === 'preview') {
    return (
      <div style={styles.preview(cropData.url)}>
        <button
          onClick={() => setStep('puzzle')}
          style={styles.startBtn}
        >
          Start Puzzle
        </button>
      </div>
    );
  }
  if (step === 'puzzle') {
    return (
      <Puzzle
        imageUrl={cropData.url}
        rows={3}
        cols={3}
      />
    );
  }
  return null;
}

const styles = {
  preview: (url) => ({
    width: '100vw',
    height: '100vh',
    backgroundImage: `url(${url})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
  }),
  startBtn: {
    marginBottom: '2rem',
    padding: '1rem 2rem',
    background: '#fff',
    color: '#000',
    fontSize: '1.2rem',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
  },
};

export default App;
