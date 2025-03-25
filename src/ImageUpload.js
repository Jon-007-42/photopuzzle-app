import React, { useRef } from 'react';
import EXIF from 'exif-js';

function ImageUpload({ onImageSelected }) {
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const image = new Image();
      image.onload = () => {
        EXIF.getData(image, function () {
          const orientation = EXIF.getTag(this, 'Orientation') || 1;

          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          let width = image.width;
          let height = image.height;

          // Rotation => bytter width/height om i canvas
          if ([5, 6, 7, 8].includes(orientation)) {
            canvas.width = height;
            canvas.height = width;
          } else {
            canvas.width = width;
            canvas.height = height;
          }

          switch (orientation) {
            case 2: // flip horizontal
              ctx.transform(-1, 0, 0, 1, canvas.width, 0);
              break;
            case 3: // rotate 180
              ctx.transform(-1, 0, 0, -1, canvas.width, canvas.height);
              break;
            case 4: // flip vertical
              ctx.transform(1, 0, 0, -1, 0, canvas.height);
              break;
            case 5: // rotate 90 CW + flip
              ctx.transform(0, 1, 1, 0, 0, 0);
              break;
            case 6: // rotate 90 CW
              ctx.transform(0, 1, -1, 0, canvas.height, 0);
              break;
            case 7: // rotate 270 CW + flip
              ctx.transform(0, -1, -1, 0, canvas.height, canvas.width);
              break;
            case 8: // rotate 270 CW
              ctx.transform(0, -1, 1, 0, 0, canvas.width);
              break;
            default:
              break;
          }

          ctx.drawImage(image, 0, 0);

          const fixedImageUrl = canvas.toDataURL('image/jpeg');
          const finalWidth = canvas.width;
          const finalHeight = canvas.height;

          // Send roteret billede + dims videre
          onImageSelected(fixedImageUrl, finalWidth, finalHeight);
        });
      };
      image.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div style={styles.container}>
      <input
        type="file"
        accept="image/*"
        capture="environment"
        ref={fileInputRef}
        onChange={handleChange}
        style={{ display: 'none' }}
      />
      <button
        onClick={() => fileInputRef.current.click()}
        style={styles.button}
      >
        Vælg billede
      </button>
    </div>
  );
}

const styles = {
  container: {
    textAlign: 'center',
    background: '#000',
    width: '100vw',
    height: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    fontSize: '1.2rem',
    padding: '1rem 2rem',
    border: 'none',
    borderRadius: '8px',
    backgroundColor: '#fff',
    color: '#000',
    cursor: 'pointer',
  },
};

export default ImageUpload;
