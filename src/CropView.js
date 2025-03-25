import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';

// Helper-funktion der laver selve canvas-beskæringen
async function getCroppedImg(imageSrc, pixelCrop) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return canvas.toDataURL('image/jpeg');
}

function createImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.src = url;
  });
}

function CropView({ imageUrl, onComplete }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropComplete = useCallback((_, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleDone = async () => {
    if (!croppedAreaPixels) return;
    try {
      const croppedDataUrl = await getCroppedImg(imageUrl, croppedAreaPixels);
      onComplete(croppedDataUrl, croppedAreaPixels.width, croppedAreaPixels.height);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={styles.container}>
      <Cropper
        image={imageUrl}
        crop={crop}
        zoom={zoom}
        aspect={1} // Du kan sætte 1:1 eller "skærmens ratio"
        onCropChange={setCrop}
        onZoomChange={setZoom}
        onCropComplete={onCropComplete}
        style={{
          containerStyle: {
            width: '100vw',
            height: '100vh',
            background: '#000',
          },
          cropAreaStyle: {
            border: '2px solid #fff',
          },
        }}
      />
      <button style={styles.doneButton} onClick={handleDone}>
        Udfør beskæring
      </button>
    </div>
  );
}

const styles = {
  container: {
    position: 'relative',
    width: '100vw',
    height: '100vh',
    background: '#000',
    overflow: 'hidden',
  },
  doneButton: {
    position: 'absolute',
    bottom: '2rem',
    left: '50%',
    transform: 'translateX(-50%)',
    padding: '1rem 2rem',
    background: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1.2rem',
    cursor: 'pointer',
  },
};

export default CropView;
