"use client";

import { useMemo } from "react";
import { Body1Strong, Button, Card, Caption1 } from "@fluentui/react-components";
import { VehicleShip20Regular } from "@fluentui/react-icons";
import { DayPicker, type DateRange } from "react-day-picker";
import { es } from "date-fns/locale";
import styles from "./TravelDateRangePicker.module.css";

interface TravelDateRangePickerProps {
  origin?: string;
  destination: string;
  hint?: string;
  minDate?: string;        // ISO YYYY-MM-DD — fecha mínima seleccionable
  range: DateRange | undefined;
  onRangeChange: (range: DateRange | undefined) => void;
  onConfirm: () => Promise<void>;
  disabled?: boolean;
}

export function TravelDateRangePicker({
  origin,
  destination,
  hint,
  minDate,
  range,
  onRangeChange,
  onConfirm,
  disabled = false,
}: TravelDateRangePickerProps) {
  const isValidRange = useMemo(() => Boolean(range?.from && range?.to), [range]);

  const earliest = useMemo(
    () => (minDate ? new Date(minDate) : new Date()),
    [minDate],
  );

  const routeLabel = origin ? `${origin} → ${destination}` : destination;
  const caption = hint ?? `Selecciona fecha de ida y vuelta para ${routeLabel}`;

  return (
    <Card className={styles.card}>
      <div className={styles.header}>
        <VehicleShip20Regular className={styles.shipIcon} />
        <div>
          <Body1Strong className={styles.route}>{routeLabel}</Body1Strong>
          <Caption1 className={styles.hint}>{caption}</Caption1>
        </div>
      </div>
      <DayPicker
        mode="range"
        selected={range}
        onSelect={(r) => {
          // Impedir que la fecha de regreso sea anterior a la salida
          if (r?.from && r?.to && r.to < r.from) {
            onRangeChange({ from: r.from, to: undefined });
            return;
          }
          onRangeChange(r);
        }}
        disabled={{ before: earliest }}
        locale={es}
        className={styles.picker}
        required
      />
      <Button
        appearance="primary"
        onClick={onConfirm}
        disabled={!isValidRange || disabled}
        className={styles.confirmBtn}
      >
        Confirmar fechas
      </Button>
    </Card>
  );
}
