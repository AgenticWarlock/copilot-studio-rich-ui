"use client";

import { useCallback, useRef, useState } from "react";
import type { CabinImage } from "@/lib/mock/cabins";
import { CabinGalleryModal } from "./CabinGalleryModal";
import styles from "./CabinGallery.module.css";

interface CabinGalleryProps {
  images: CabinImage[];
}

export function CabinGallery({ images }: CabinGalleryProps) {
  const [current, setCurrent] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const prev = useCallback(() =>
    setCurrent((c) => (c - 1 + images.length) % images.length), [images.length]);
  const next = useCallback(() =>
    setCurrent((c) => (c + 1) % images.length), [images.length]);

  // Keyboard navigation when gallery is focused
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") { e.preventDefault(); prev(); }
    if (e.key === "ArrowRight") { e.preventDefault(); next(); }
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setModalOpen(true); }
  };

  if (!images.length) return null;

  return (
    <>
      <div
        ref={containerRef}
        className={styles.gallery}
        role="region"
        aria-label="Galería de imágenes del camarote"
      >
        {/* Main image */}
        <div className={styles.mainWrapper}>
          <button
            type="button"
            className={styles.mainBtn}
            onClick={() => setModalOpen(true)}
            onKeyDown={handleKeyDown}
            aria-label={`${images[current].alt} — pulsa para ampliar`}
            tabIndex={0}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={images[current].src}
              alt={images[current].alt}
              className={styles.mainImg}
            />
            <span className={styles.zoomHint} aria-hidden="true">🔍</span>
          </button>

          {/* Prev / Next */}
          {images.length > 1 && (
            <>
              <button
                type="button"
                className={`${styles.navBtn} ${styles.navPrev}`}
                onClick={(e) => { e.stopPropagation(); prev(); }}
                aria-label="Imagen anterior"
              >
                ‹
              </button>
              <button
                type="button"
                className={`${styles.navBtn} ${styles.navNext}`}
                onClick={(e) => { e.stopPropagation(); next(); }}
                aria-label="Imagen siguiente"
              >
                ›
              </button>
            </>
          )}

          {/* Counter */}
          <span className={styles.counter} aria-live="polite" aria-atomic="true">
            {current + 1} / {images.length}
          </span>
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className={styles.thumbs} role="list" aria-label="Miniaturas">
            {images.map((img, i) => (
              <button
                key={img.src}
                type="button"
                role="listitem"
                className={`${styles.thumb} ${i === current ? styles.thumbActive : ""}`}
                onClick={() => setCurrent(i)}
                aria-label={img.alt}
                aria-current={i === current}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.src} alt="" aria-hidden="true" className={styles.thumbImg} />
              </button>
            ))}
          </div>
        )}
      </div>

      <CabinGalleryModal
        key={`${modalOpen}-${current}`}
        images={images}
        startIndex={current}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onIndexChange={setCurrent}
      />
    </>
  );
}
