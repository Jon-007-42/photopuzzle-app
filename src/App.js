import React, { useState } from 'react';
import Puzzle from './Puzzle';
import ImageUpload from './ImageUpload';

function App() {
  const [imageUrl, setImageUrl] = useState(null);

  const handleImageSelected = (url) => {
    setImageUrl(url);
  };

  return (
    <div style={{ height: '100vh', width: '100vw', overflow: 'hidden' }}>
      {!imageUrl ? (
        <ImageUpload onImageSelected={handleImageSelected} />
      ) : (
        <Puzzle imageUrl={imageUrl} />
      )}
    </div>
  );
}

export default App;
