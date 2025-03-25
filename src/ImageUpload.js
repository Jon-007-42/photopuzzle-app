import React, { useRef } from 'react';
import EXIF from 'exif-js';

function ImageUpload({ onImageSelected }) {
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (event) {
        const image = new Image();
        image.onload = function () {
          EXIF.getData(image, function () {
            const orientation = EXIF.getTag(this, 'Orientation');

            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            if (orientation > 4) {
              canvas.width = image.height;
              canvas.height = image.width;
            } else {
              canvas.width = image.width;
              canvas.height = image.height;
            }

            switch (orientation) {
              case 2: ctx.transform(-1, 0, 0, 1, canvas.width, 0); break;
              case 3: ctx.transform(-1, 0, 0, -1, canvas.width, canvas.height); break;
              case 4: ctx.transform(1, 0, 0, -1, 0, canvas.height); break;
              case 5: ctx.transform(0, 1, 1, 0, 0, 0); break;
              case 6: ctx.transform(0, 1, -1, 0, canvas.height, 0); break;
              case 7: ctx.transform(0, -1, -1, 0, canvas.height, canvas.width); break;
              case 8: ctx.transform(0, -1, 1, 0, 0, canvas.width); break;
              default: break;
            }

            ctx.drawImage(image, 0, 0);
            const fixedImageUrl = canvas.toDataURL('image/jpeg');
            onImageSelected(fixedImageUrl);
          });
        };
        image.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
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
      <button onClick={() => fileInputRef.current.click()} style={styles.button}>
        Vælg billede
      </button>
    </div>
  );
}

const styles = {
  container: {
    textAlign: 'center',
    padding: '2rem',
  },
  button: {
    fontSize: '1.2rem',
    padding: '1rem 2rem',
    border: 'none',
    borderRadius: '8px',
    backgroundColor: '#222',
    color: '#fff',
    cursor: 'pointer',
  },
};

export default ImageUpload;
