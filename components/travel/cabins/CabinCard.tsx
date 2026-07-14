"use client";

import { Badge, Body1Strong, Button, Caption1 } from "@fluentui/react-components";
import {
  AnimalDog20Regular,
  CheckmarkCircle20Regular,
  Layer20Regular,
  People20Regular,
  Warning20Regular,
} from "@fluentui/react-icons";
import type { Cabin } from "@/lib/mock/cabins";
import { CabinGallery } from "./CabinGallery";
import styles from "./CabinCard.module.css";

interface CabinCardProps {
  cabin: Cabin;
  passengers: number;
  hasPets: boolean;
  onSelect: () => Promise<void>;
  disabled?: boolean;
}

export function CabinCard({ cabin, passengers, hasPets, onSelect, disabled = false }: CabinCardProps) {
  return (
    <article className={styles.card} aria-label={`Camarote: ${cabin.name}`}>
      {/* Gallery */}
      <CabinGallery images={cabin.images} />

      {/* Tags */}
      <div className={styles.tags}>
        {cabin.tags.map((tag) => (
          <Badge
            key={tag}
            appearance="filled"
            color={tag === "Último disponible" ? "warning" : "informative"}
            size="medium"
          >
            {tag}
          </Badge>
        ))}
      </div>

      {/* Info */}
      <div className={styles.info}>
        <Body1Strong className={styles.name}>{cabin.name}</Body1Strong>

        <div className={styles.meta}>
          <span className={styles.metaItem}>
            <Layer20Regular />
            Cubierta {cabin.deck}
          </span>
          <span className={styles.metaItem}>
            <People20Regular />
            Capacidad: {cabin.capacity} pax · {cabin.beds}
          </span>
        </div>

        {/* Passenger context from previous selection */}
        <div className={styles.contextBadges}>
          <span className={styles.contextItem}>
            <CheckmarkCircle20Regular className={styles.contextIcon} />
            Disponible para {passengers} {passengers === 1 ? "pasajero" : "pasajeros"}
          </span>
          {hasPets && (
            <span className={styles.contextItem}>
              <AnimalDog20Regular className={styles.contextIcon} />
              Viaje con mascota
            </span>
          )}
          {cabin.availability === 1 && (
            <span className={`${styles.contextItem} ${styles.contextWarn}`}>
              <Warning20Regular className={styles.contextIconWarn} />
              Solo queda {cabin.availability} disponible
            </span>
          )}
        </div>

        {/* Features */}
        <ul className={styles.features} aria-label="Características">
          {cabin.features.map((f) => (
            <li key={f} className={styles.feature}>
              <span className={styles.featureDot} aria-hidden="true" />
              {f}
            </li>
          ))}
        </ul>
      </div>

      {/* Price + CTA */}
      <div className={styles.footer}>
        <div>
          <Caption1 className={styles.priceLabel}>Suplemento por camarote</Caption1>
          <span className={styles.price}>+{cabin.priceDelta} €</span>
        </div>
        <Button
          appearance="primary"
          onClick={onSelect}
          disabled={disabled}
          className={styles.selectBtn}
        >
          Seleccionar camarote
        </Button>
      </div>
    </article>
  );
}
