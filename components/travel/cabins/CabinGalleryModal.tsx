"use client";

import { useCallback, useEffect, useState } from "react";
import type { CabinImage } from "@/lib/mock/cabins";
import styles from "./CabinGalleryModal.module.css";

interface CabinGalleryModalProps {
  images: CabinImage[];
  startIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onIndexChange?: (index: number) => void;
}

/**
 * GalerÃ­a ampliada en modal.
 * El padre pasa key={startIndex} para re-montar cuando cambia startIndex,
 * evitando setState dentro de useEffect.
 */
export function CabinGalleryModal({
  images,
  startIndex,
  isOpen,
  onClose,
  onIndexChange,
}: CabinGalleryModalProps) {
  const [idx, setIdx] = useState(startIndex);

  const go = useCallback((next: number) => {
    const newIdx = (next + images.length) % images.length;
    setIdx(newIdx);
    onIndexChange?.(newIdx);
  }, [images.length, onIndexChange]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key === "ArrowLeft")  go(idx - 1);
      if (e.key === "ArrowRight") go(idx + 1);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, idx, go, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-label="GalerÃ­a ampliada del camarote"
      onClick={onClose}
    >
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Cerrar galerÃ­a">âœ•</button>
        <span className={styles.counter} aria-live="polite">{idx + 1} / {images.length}</span>
        <div className={styles.imgWrapper}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={images[idx].src} alt={images[idx].alt} className={styles.img} />
        </div>
        <p className={styles.caption}>{images[idx].alt}</p>
        {images.length > 1 && (
          <>
            <button type="button" className={`${styles.navBtn} ${styles.navPrev}`} onClick={() => go(idx - 1)} aria-label="Imagen anterior">â€¹</button>
            <button type="button" className={`${styles.navBtn} ${styles.navNext}`} onClick={() => go(idx + 1)} aria-label="Imagen siguiente">â€º</button>
          </>
        )}
        {images.length > 1 && (
          <div className={styles.thumbs}>
            {images.map((img, i) => (
              <button key={img.src} type="button" className={`${styles.thumb} ${i === idx ? styles.thumbActive : ""}`} onClick={() => go(i)} aria-label={img.alt} aria-current={i === idx}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.src} alt="" aria-hidden="true" className={styles.thumbImg} />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
