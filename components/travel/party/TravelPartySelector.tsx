"use client";

import { useState } from "react";
import { Body1Strong, Button, Caption1, Card } from "@fluentui/react-components";
import { People24Regular, AnimalDog24Regular } from "@fluentui/react-icons";
import type { ShowTravelPartySelectorPayload } from "@/lib/agent/eventTypes";
import styles from "./TravelPartySelector.module.css";

interface TravelPartySelectorProps {
  config: ShowTravelPartySelectorPayload;
  onConfirm: (passengers: number, hasPets: boolean) => Promise<void>;
  disabled?: boolean;
}

export function TravelPartySelector({ config, onConfirm, disabled = false }: TravelPartySelectorProps) {
  const { minPassengers, maxPassengers, defaultPassengers, allowPets } = config;
  const [passengers, setPassengers] = useState<number | null>(defaultPassengers ?? null);
  const [hasPets, setHasPets] = useState<boolean | null>(null);

  const passengerOptions = Array.from(
    { length: maxPassengers - minPassengers + 1 },
    (_, i) => minPassengers + i,
  );

  const canContinue =
    passengers !== null && (allowPets ? hasPets !== null : true);

  const handleConfirm = async () => {
    if (!canContinue || passengers === null) return;
    await onConfirm(passengers, hasPets ?? false);
  };

  return (
    <Card className={styles.card}>
      <div className={styles.header}>
        <People24Regular className={styles.icon} />
        <div>
          <Body1Strong className={styles.title}>Selecciona tu grupo de viaje</Body1Strong>
          <Caption1 className={styles.subtitle}>
            Indica el número de pasajeros{allowPets ? " y si viajas con mascota" : ""}.
          </Caption1>
        </div>
      </div>

      {/* Passenger count */}
      <div className={styles.section}>
        <Caption1 className={styles.label}>Número de pasajeros</Caption1>
        <div className={styles.buttonGroup} role="group" aria-label="Número de pasajeros">
          {passengerOptions.map((n) => (
            <button
              key={n}
              type="button"
              className={`${styles.optionBtn} ${passengers === n ? styles.selected : ""}`}
              onClick={() => setPassengers(n)}
              disabled={disabled}
              aria-pressed={passengers === n}
              aria-label={`${n} ${n === 1 ? "pasajero" : "pasajeros"}`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Pet selector */}
      {allowPets && (
        <div className={styles.section}>
          <Caption1 className={styles.label}>¿Viajas con mascota?</Caption1>
          <div className={styles.buttonGroup} role="group" aria-label="Mascota">
            <button
              type="button"
              className={`${styles.petBtn} ${hasPets === true ? styles.selected : ""}`}
              onClick={() => setHasPets(true)}
              disabled={disabled}
              aria-pressed={hasPets === true}
            >
              <AnimalDog24Regular />
              Sí, llevo mascota
            </button>
            <button
              type="button"
              className={`${styles.petBtn} ${hasPets === false ? styles.selected : ""}`}
              onClick={() => setHasPets(false)}
              disabled={disabled}
              aria-pressed={hasPets === false}
            >
              No
            </button>
          </div>
        </div>
      )}

      <Button
        appearance="primary"
        onClick={handleConfirm}
        disabled={!canContinue || disabled}
        className={styles.confirmBtn}
      >
        Continuar
      </Button>
    </Card>
  );
}
