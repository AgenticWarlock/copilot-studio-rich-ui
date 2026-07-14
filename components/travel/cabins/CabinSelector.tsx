"use client";

import { Body1, Caption1 } from "@fluentui/react-components";
import { VehicleShip20Regular } from "@fluentui/react-icons";
import { cabinCatalog } from "@/lib/mock/cabins";
import { CabinCard } from "./CabinCard";
import styles from "./CabinSelector.module.css";

interface CabinSelectorProps {
  cabinId: string;
  passengers: number;
  hasPets: boolean;
  onSelect: (cabinId: string) => Promise<void>;
  disabled?: boolean;
}

export function CabinSelector({ cabinId, passengers, hasPets, onSelect, disabled = false }: CabinSelectorProps) {
  const cabin = cabinCatalog[cabinId];

  if (!cabin) {
    return (
      <div className={styles.notFound}>
        <Caption1>No se encontró el camarote solicitado ({cabinId}).</Caption1>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <VehicleShip20Regular className={styles.headerIcon} />
        <Body1 className={styles.headerText}>
          Camarote recomendado para tu viaje
        </Body1>
      </div>
      <CabinCard
        cabin={cabin}
        passengers={passengers}
        hasPets={hasPets}
        onSelect={() => onSelect(cabin.id)}
        disabled={disabled}
      />
    </div>
  );
}
