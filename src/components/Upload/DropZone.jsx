import { useState, useRef, useCallback } from 'react';
import styles from './DropZone.module.css';

export default function DropZone({ onFileLoaded }) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);
  const dragCounter = useRef(0);

  const handleFile = useCallback(
    (file) => {
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const json = JSON.parse(e.target.result);
          onFileLoaded(json);
        } catch {
          onFileLoaded(null, 'Could not parse file as JSON.');
        }
      };
      reader.onerror = () => {
        onFileLoaded(null, 'Failed to read file.');
      };
      reader.readAsText(file);
    },
    [onFileLoaded],
  );

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current <= 0) {
      dragCounter.current = 0;
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      dragCounter.current = 0;

      const file = e.dataTransfer?.files?.[0];
      handleFile(file);
    },
    [handleFile],
  );

  const handleInputChange = useCallback(
    (e) => {
      const file = e.target.files?.[0];
      handleFile(file);
      e.target.value = '';
    },
    [handleFile],
  );

  return (
    <div
      className={styles.dropZone}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <button
        className={styles.uploadButton}
        onClick={() => inputRef.current?.click()}
        type="button"
      >
        Upload your data
      </button>
      <input
        ref={inputRef}
        type="file"
        accept=".json"
        className={styles.hidden}
        onChange={handleInputChange}
      />
      {isDragging && (
        <div className={styles.dragOverlay}>
          <div className={styles.dragOverlayInner}>
            Drop your Lime JSON here
          </div>
        </div>
      )}
    </div>
  );
}
