import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';

// Helper: Opret et billede fra URL
async function createImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = url;
  });
}

// Helper: Laver det endelige crop + rotation i et canvas
async function getCroppedImg(imageSrc, croppedAreaPixels, rotation = 0) {
  const image = await createImage(imageSrc);

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  // For at håndtere rotation i selve canvas, laver vi en lidt større canvas
  const safeArea = Math.max(image.width, image.height) * 2;
  canvas.width = safeArea;
  canvas.height = safeArea;

  // Flyt midtpunkt, roter
  ctx.translate(safeArea / 2, safeArea / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.translate(-safeArea / 2, -safeArea / 2);

  // Tegn billedet centralt
  ctx.drawImage(image, safeArea / 2 - image.width / 2, safeArea / 2 - image.height / 2);

  // Nu laver vi det rigtige “cropped area”
  const data = ctx.getImageData(0, 0, safeArea, safeArea);

  // For at beskære
  const realCanvas = document.createElement('canvas');
  realCanvas.width = croppedAreaPixels.width;
  realCanvas.height = croppedAreaPixels.height;
  const realCtx = realCanvas.getContext('2d');

  realCtx.putImageData(
    data,
    -croppedAreaPixels.x,
    -croppedAreaPixels.y
  );

  return realCanvas.toDataURL('image/jpeg');
}

function CropView({ imageUrl, onComplete }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0); // NY STATE til rotation
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  // Hver gang der zoomes/beskæres, gemmer vi 'croppedAreaPixels'
  const onCropComplete = useCallback((_, croppedArea) => {
    setCroppedAreaPixels(croppedArea);
  }, []);

  // Drej billedet 90 grader
  const rotateLeft = () => {
    setRotation((r) => (r - 90) % 360);
  };
  const rotateRight = () => {
    setRotation((r) => (r + 90) % 360);
  };

  const handleDone = async () => {
    if (!croppedAreaPixels) return;
    try {
      const croppedDataUrl = await getCroppedImg(imageUrl, croppedAreaPixels, rotation);
      // Her har du endeligt beskåret + roteret dataURL
      // Du kan også måle dimensionerne
      const tempImg = new Image();
      tempImg.src = croppedDataUrl;
      tempImg.onload = () => {
        onComplete(croppedDataUrl, tempImg.width, tempImg.height);
      };
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
        rotation={rotation}       // <--- brug rotation-prop
        aspect={1}               // <--- du kan sætte aspect til skærmratio eller 1:1
        onCropChange={setCrop}
        onZoomChange={setZoom}
        onRotationChange={setRotation} // valgfrit hvis du vil have en slider
        onCropComplete={onCropComplete}
        style={{
          containerStyle: {
            width: '100vw',
            height: '100vh',
            background: '#000',
          },
        }}
      />

      <div style={styles.btnRow}>
        <button onClick={rotateLeft} style={styles.btn}>
          Drej Venstre
        </button>
        <button onClick={rotateRight} style={styles.btn}>
          Drej Højre
        </button>
        <button onClick={handleDone} style={styles.btnOK}>
          Udfør beskæring
        </button>
      </div>
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
  btnRow: {
    position: 'absolute',
    bottom: '2rem',
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    gap: '1rem',
  },
  btn: {
    padding: '0.8rem 1.2rem',
    fontSize: '1rem',
    background: '#ccc',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  btnOK: {
    padding: '0.8rem 1.2rem',
    fontSize: '1rem',
    background: '#0c0',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
};

export default CropView;
