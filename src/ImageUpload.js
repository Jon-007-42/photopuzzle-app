import React, { useRef } from 'react';
import EXIF from 'exif-js';

/**
 * Denne version tvinger canvas til at have 'originalWidth' x 'originalHeight',
 * og tilpasser roteringen ved at overs�tte (translate) og/eller skalere
 * s� billedet er "oprejst" men stadig i et 'h�jt' canvas, hvis originalbilledet er vertikalt.
 */

function ImageUpload({ onImageSelected }) {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const img = new Image();
      img.onload = () => {
        EXIF.getData(img, function () {
          const orientation = EXIF.getTag(this, 'Orientation') || 1;

          // Vi gemmer original dimension
          const originalWidth = img.width;
          const originalHeight = img.height;

          // Nu s�tter vi canvas TIL ALLE TILF�LDE = (originalWidth x originalHeight)
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = originalWidth;
          canvas.height = originalHeight;

          // Herunder roterer/transformerer vi,
          // men UDEN at bytte om p� width/height.
          // => Billedet ender "oprejst", men kan have tomme (sorte) omr�der
          //    eller delvis besk�ring, alt efter orientation.
          switch (orientation) {
            case 2: // flip horizontal
              ctx.translate(originalWidth, 0);
              ctx.scale(-1, 1);
              break;
            case 3: // rotate 180
              ctx.translate(originalWidth, originalHeight);
              ctx.rotate(Math.PI);
              break;
            case 4: // flip vertical
              ctx.translate(0, originalHeight);
              ctx.scale(1, -1);
              break;
            case 5: // rotate 90 CW + flip
              // Kombiner rotation 90 + flip X
              // Vi roterer f�rst 90 grader om (0,0)
              ctx.translate(originalWidth, 0);
              ctx.rotate(Math.PI / 2);
              ctx.scale(1, -1); // flip
              break;
            case 6: // rotate 90 CW
              // Flyt lerredets "start" til (canvas.width, 0), roter 90 grader
              ctx.translate(originalWidth, 0);
              ctx.rotate(Math.PI / 2);
              break;
            case 7: // rotate 90 CW + flip vertical
              // Roter 90 + flip Y
              ctx.translate(originalWidth, 0);
              ctx.rotate(Math.PI / 2);
              ctx.translate(0, originalHeight);
              ctx.scale(1, -1);
              break;
            case 8: // rotate 270 CW (eller 90 CCW)
              ctx.translate(0, originalHeight);
              ctx.rotate(-Math.PI / 2);
              break;
            default:
              // orientation == 1 => ingen rotation
              break;
          }

          // Tegn billedet ind i (0,0) i den nye kontekst
          // Evt. skal du skalere, hvis du vil v�re sikker
          // p� at hele motivet kommer med, men i dette eksempel
          // tegner vi 1:1, s� man kan f� "tomt omr�de" hvis
          // billedet �stikker udenfor� efter rotation.
          ctx.drawImage(img, 0, 0, originalWidth, originalHeight);

          // Lav dataURL
          const rotatedUrl = canvas.toDataURL('image/jpeg');

          // Return�r "original" dimensioner videre,
          // da vi beholdt dem
          onImageSelected(rotatedUrl, originalWidth, originalHeight);
        });
      };
      img.src = evt.target.result;
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
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
      <button
        style={styles.button}
        onClick={() => fileInputRef.current.click()}
      >
        V�lg billede
      </button>
    </div>
  );
}

const styles = {
  container: {
    width: '100vw',
    height: '100vh',
    background: '#000',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    padding: '1rem 2rem',
    fontSize: '1.2rem',
    background: '#fff',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
  },
};

export default ImageUpload;
