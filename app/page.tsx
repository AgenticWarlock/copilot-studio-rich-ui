"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { DateRange } from "react-day-picker";
import { BrandVariants, createLightTheme, FluentProvider, Text } from "@fluentui/react-components";
import { ChatPanel } from "@/components/chat";
import { TravelDateRangePicker } from "@/components/travel";
import { TravelPartySelector } from "@/components/travel/party";
import { CabinSelector } from "@/components/travel/cabins";
import {
  createAgentTransport,
  type AgentConnectionStatus,
  type AgentTransport,
  type ChatMessageModel,
  type FlightOption,
  type ShowTravelPartySelectorPayload,
} from "@/lib/agent";
import { cabinCatalog } from "@/lib/mocks";
import styles from "./page.module.css";

const trasmedBrand: BrandVariants = {
  10: "#020c1f", 20: "#061636", 30: "#0a2050", 40: "#0d2a6a", 50: "#103485",
  60: "#143fa0", 70: "#1a4fbe", 80: "#1a4a9e", 90: "#2a5abc", 100: "#3a6acc",
  110: "#5080d8", 120: "#6a96e2", 130: "#84aaec", 140: "#9ebff4",
  150: "#bad3f8", 160: "#d6e7fc",
};
const trasmedTheme = createLightTheme(trasmedBrand);

const createMessage = (
  role: ChatMessageModel["role"],
  text: string,
): ChatMessageModel => ({
  id: crypto.randomUUID(),
  role,
  text,
  timestamp: new Date().toISOString(),
});

export default function Home() {
  const transportRef = useRef<AgentTransport | null>(null);
  const busyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [messages, setMessages] = useState<ChatMessageModel[]>([]);
  const [isBusy, setIsBusy] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<AgentConnectionStatus>("disconnected");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [panelLoading, setPanelLoading] = useState(false);
  const [panelError, setPanelError] = useState<string | null>(null);
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [dateHint, setDateHint] = useState<string | undefined>(undefined);
  const [minDate, setMinDate] = useState<string | undefined>(undefined);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [selectedFlightId, setSelectedFlightId] = useState<string | undefined>();
  const [flights, setFlights] = useState<FlightOption[]>([]);
  // Travel party state
  const [showPartySelector, setShowPartySelector] = useState(false);
  const [partyConfig, setPartyConfig] = useState<ShowTravelPartySelectorPayload | null>(null);
  const [passengers, setPassengers] = useState<number>(1);
  const [hasPets, setHasPets] = useState<boolean>(false);
  // Cabin state
  const [showCabinSelector, setShowCabinSelector] = useState(false);
  const [cabinId, setCabinId] = useState<string | null>(null);
  const [isSendingCabinSelection, setIsSendingCabinSelection] = useState(false);
  const [sentCabinSelectionId, setSentCabinSelectionId] = useState<string | null>(null);

  const appendMessage = (message: ChatMessageModel) => {
    setMessages((prev) => [...prev, message]);
  };

  const releaseBusy = () => {
    if (busyTimeoutRef.current) {
      clearTimeout(busyTimeoutRef.current);
      busyTimeoutRef.current = null;
    }
    setIsBusy(false);
  };

  useEffect(() => {
    const transport = createAgentTransport();
    transportRef.current = transport;

    const unsubscribe = transport.subscribe((event) => {
      // Cualquier evento del agente desbloquea el chat
      releaseBusy();

      if (event.type === "ui.showMessage") {
        appendMessage(createMessage("agent", event.payload.text));
      }

      if (event.type === "ui.showDatePicker") {
        setOrigin(event.payload.origin ?? "");
        setDestination(event.payload.destination);
        setDateHint(event.payload.hint);
        setMinDate(event.payload.minDate);
        setShowDatePicker(true);
        setDateRange(undefined);
        setPanelLoading(false);
        setPanelError(null);
      }

      if (event.type === "ui.showFlights") {
        setFlights(event.payload.flights);
        setPanelLoading(false);
      }

      if (event.type === "ui.showTravelPartySelector") {
        setPartyConfig(event.payload);
        setShowPartySelector(true);
        setShowDatePicker(false);
        setShowCabinSelector(false);
        setPanelError(null);
      }

      if (event.type === "ui.showCabinSelector") {
        setCabinId(event.payload.cabinId);
        setShowCabinSelector(true);
        setSentCabinSelectionId(null);
        setShowPartySelector(false);
        setShowDatePicker(false);
        setPanelError(null);
      }
    });

    const unsubscribeStatus = transport.subscribeConnectionStatus((status) => {
      setConnectionStatus(status);
      // Si la conexión cae mientras esperamos respuesta, desbloqueamos
      if (status === "disconnected" || status === "failed") {
        releaseBusy();
      }
    });

    transport.connect().catch(() => {
      appendMessage(createMessage("system", "No se pudo conectar con el agente."));
    });

    return () => {
      unsubscribe();
      unsubscribeStatus();
      transport.disconnect().catch(() => undefined);
    };
  }, []);

  const onSendMessage = async (text: string) => {
    appendMessage(createMessage("user", text));
    setPanelError(null);
    setIsBusy(true);

    // Red de seguridad: si el agente no responde en 20s, desbloqueamos
    busyTimeoutRef.current = setTimeout(() => {
      setIsBusy(false);
      busyTimeoutRef.current = null;
    }, 20_000);

    try {
      await transportRef.current?.sendMessage(text);
    } catch {
      setPanelError("No fue posible procesar tu mensaje.");
      releaseBusy();
    }
  };

  const formattedRange = useMemo(() => {
    if (!dateRange?.from || !dateRange?.to) {
      return null;
    }

    return {
      fromDate: dateRange.from.toISOString().slice(0, 10),
      toDate: dateRange.to.toISOString().slice(0, 10),
    };
  }, [dateRange]);

  // Helper: formatea ISO YYYY-MM-DD a "18 jul 2026"
  const fmtDate = (iso: string) => {
    const months = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
    const [y, m, d] = iso.split("-").map(Number);
    return `${d} ${months[m - 1]} ${y}`;
  };

  const onConfirmDates = async () => {
    if (!formattedRange) {
      setPanelError("Debes elegir fecha de ida y vuelta.");
      return;
    }

    setPanelLoading(true);
    setPanelError(null);
    setFlights([]);
    setSelectedFlightId(undefined);

    try {
      await transportRef.current?.sendEvent({
        type: "ui.datesSelected",
        payload: {
          origin,
          destination,
          fromDate: formattedRange.fromDate,
          toDate: formattedRange.toDate,
        },
      });
      setShowDatePicker(false);
      appendMessage(createMessage("system",
        `📅 Fechas: ${origin ? `${origin} → ` : ""}${destination} · ${fmtDate(formattedRange.fromDate)} – ${fmtDate(formattedRange.toDate)}`
      ));
    } catch {
      setPanelLoading(false);
      setPanelError("No fue posible recuperar vuelos para el rango seleccionado.");
    }
  };

  const onConfirmParty = async (selectedPassengers: number, selectedHasPets: boolean) => {
    setPassengers(selectedPassengers);
    setHasPets(selectedHasPets);
    setShowPartySelector(false);
    setPanelError(null);

    try {
      await transportRef.current?.sendEvent({
        type: "ui.travelPartySelected",
        payload: { passengers: selectedPassengers, hasPets: selectedHasPets },
      });
      appendMessage(createMessage("system",
        `👥 ${selectedPassengers} ${selectedPassengers === 1 ? "pasajero" : "pasajeros"}${
          selectedHasPets ? " · con mascota 🐾" : ""
        }`
      ));
    } catch {
      setPanelError("No fue posible enviar la selección de pasajeros.");
    }
  };

  const onSelectCabin = async (selectedCabinId: string) => {
    if (isSendingCabinSelection || sentCabinSelectionId === selectedCabinId) {
      return;
    }

    const cabin = cabinCatalog[selectedCabinId];
    if (!cabin) return;

    setPanelError(null);
    setIsSendingCabinSelection(true);

    // 1) Update the UI first with a local selection card aligned to the right.
    appendMessage(
      createMessage(
        "system",
        `### Tu seleccion\n- Camarote: ${cabin.name}\n- Cubierta: ${cabin.deck}\n- Precio: +${cabin.priceDelta} EUR\n- Pet friendly: ${cabin.petFriendly ? "Si" : "No"}`,
      ),
    );

    const eventPayload = {
      cabinId: cabin.id,
      cabinName: cabin.name,
      deck: cabin.deck,
      price: cabin.priceDelta,
      currency: "EUR",
      petFriendly: cabin.petFriendly,
    };

    console.info("[POC] Direct Line event", {
      name: "ui.cabinSelected",
      value: eventPayload,
    });

    try {
      await transportRef.current?.sendEvent({
        type: "ui.cabinSelected",
        payload: eventPayload,
      });

      setSentCabinSelectionId(selectedCabinId);
      setShowCabinSelector(false);
    } catch {
      setPanelError("No se pudo enviar la seleccion del camarote. Intentalo de nuevo.");
      appendMessage(
        createMessage(
          "system",
          "No se pudo enviar la seleccion al agente. Vuelve a intentarlo.",
        ),
      );
    } finally {
      setIsSendingCabinSelection(false);
    }
  };

  const onSelectFlight = async (flightId: string) => {
    setSelectedFlightId(flightId);
    setPanelError(null);

    try {
      await transportRef.current?.sendEvent({
        type: "ui.flightSelected",
        payload: {
          flightId,
        },
      });
    } catch {
      setPanelError("No fue posible registrar la selección del vuelo.");
    }
  };

  return (
    <FluentProvider theme={trasmedTheme}>
      <div className={styles.page}>
        <header className={styles.header}>
          <div className={styles.headerWaves} aria-hidden="true" />
          <div className={styles.headerBoat} aria-hidden="true" />
          <div className={styles.headerBrand}>
            <span className={styles.headerLogo}>⚓</span>
            <div>
              <Text className={styles.headerTitle}>Asistente de Reservas + Copilot Studio Direct Line (directline)</Text>
            </div>
          </div>
        </header>
        <main className={styles.main}>
          <section className={styles.chatPanel}>
            <ChatPanel
              messages={messages}
              isBusy={isBusy}
              onSendMessage={onSendMessage}
              connectionStatus={connectionStatus}
              inlineContent={
                showDatePicker ? (
                  <>
                    <TravelDateRangePicker
                      origin={origin || undefined}
                      destination={destination}
                      hint={dateHint}
                      minDate={minDate}
                      range={dateRange}
                      onRangeChange={setDateRange}
                      onConfirm={onConfirmDates}
                      disabled={panelLoading}
                    />
                    {panelError && <p className={styles.panelError}>{panelError}</p>}
                  </>
                ) : showPartySelector && partyConfig ? (
                  <TravelPartySelector
                    config={partyConfig}
                    onConfirm={onConfirmParty}
                  />
                ) : showCabinSelector && cabinId ? (
                  <CabinSelector
                    cabinId={cabinId}
                    passengers={passengers}
                    hasPets={hasPets}
                    onSelect={onSelectCabin}
                    disabled={isSendingCabinSelection}
                  />
                ) : undefined
              }
            />
          </section>
        </main>
      </div>
    </FluentProvider>
  );
}
