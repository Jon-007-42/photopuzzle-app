import React, { useState } from 'react';
import Puzzle from './Puzzle';
import ImageUpload from './ImageUpload';

function App() {
  const [puzzleSettings, setPuzzleSettings] = useState(null);

  const handleImageSelected = (imageUrl, width, height) => {
    const isPortrait = height >= width;

    setPuzzleSettings({
      imageUrl,
      rows: isPortrait ? 5 : 3,
      cols: isPortrait ? 3 : 5,
      aspectRatio: width / height,
    });
  };

  return (
    <div style={{ height: '100vh', width: '100vw', overflow: 'hidden' }}>
      {!puzzleSettings ? (
        <ImageUpload onImageSelected={handleImageSelected} />
      ) : (
        <Puzzle
          imageUrl={puzzleSettings.imageUrl}
          rows={puzzleSettings.rows}
          cols={puzzleSettings.cols}
          aspectRatio={puzzleSettings.aspectRatio}
        />
      )}
    </div>
  );
}

export default App;
