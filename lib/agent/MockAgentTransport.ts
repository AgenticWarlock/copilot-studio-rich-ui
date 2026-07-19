import type {
  AgentConnectionStatus,
  AgentConnectionStatusListener,
  AgentTransport,
  AgentEventListener,
} from "./AgentTransport";
import {
  agentToUiEventSchema,
  uiToAgentEventSchema,
} from "@/lib/agent/eventSchemas";
import type {
  AgentToUiEvent,
  FlightOption,
  UiToAgentEvent,
} from "@/lib/agent/eventTypes";
import { romeFlights } from "@/lib/mocks";

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

const formatDate = (isoDate: string) => isoDate;

export class MockAgentTransport implements AgentTransport {
  private listeners = new Set<AgentEventListener>();
  private statusListeners = new Set<AgentConnectionStatusListener>();
  private connected = false;
  private connectionStatus: AgentConnectionStatus = "disconnected";
  private pendingFlights: FlightOption[] = [];

  async connect(): Promise<void> {
    this.emitConnectionStatus("connecting");
    this.connected = true;
    this.emitConnectionStatus("online");
    this.emit({
      type: "ui.showMessage",
      payload: {
        text: "Hola. Soy tu Nauta de viajes. Cuéntame tu próximo destino.",
      },
    });
  }

  async sendMessage(text: string): Promise<void> {
    if (!this.connected) {
      throw new Error("Transport is not connected.");
    }

    const normalized = text.toLowerCase();
    if (normalized.includes("roma")) {
      await delay(250);
      this.emit({
        type: "ui.showMessage",
        payload: {
          text: "Perfecto, Roma suena muy bien. Ahora elige tus fechas.",
        },
      });
      await delay(250);
      this.emit({
        type: "ui.showDatePicker",
        payload: {
          destination: "Roma",
          hint: "Selecciona fecha de ida y vuelta",
        },
      });
      return;
    }

    this.emit({
      type: "ui.showMessage",
      payload: {
        text: "Puedo ayudarte con destinos como Roma. Prueba: Quiero viajar a Roma.",
      },
    });
  }

  async sendEvent(event: UiToAgentEvent): Promise<void> {
    if (!this.connected) {
      throw new Error("Transport is not connected.");
    }

    const validEvent = uiToAgentEventSchema.parse(event);

    if (validEvent.type === "ui.datesSelected") {
      this.pendingFlights = [...romeFlights];
      await delay(600);
      this.emit({
        type: "ui.showFlights",
        payload: {
          destination: validEvent.payload.destination,
          fromDate: formatDate(validEvent.payload.fromDate),
          toDate: formatDate(validEvent.payload.toDate),
          flights: this.pendingFlights,
        },
      });
      return;
    }

    if (validEvent.type === "ui.flightSelected") {
      const selectedFlight = this.pendingFlights.find(
        (flight) => flight.id === validEvent.payload.flightId,
      );
      if (selectedFlight) {
        this.emit({
          type: "ui.showMessage",
          payload: {
            text: `Vuelo ${selectedFlight.id} (${selectedFlight.airline}) seleccionado por ${selectedFlight.priceEur} EUR.`,
          },
        });
      }
      return;
    }
  }

  subscribe(listener: AgentEventListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  subscribeConnectionStatus(listener: AgentConnectionStatusListener): () => void {
    this.statusListeners.add(listener);
    listener(this.connectionStatus);
    return () => {
      this.statusListeners.delete(listener);
    };
  }

  async disconnect(): Promise<void> {
    this.connected = false;
    this.listeners.clear();
    this.emitConnectionStatus("disconnected");
    this.statusListeners.clear();
  }

  private emit(event: AgentToUiEvent): void {
    const safeEvent = agentToUiEventSchema.parse(event);
    this.listeners.forEach((listener) => listener(safeEvent));
  }

  private emitConnectionStatus(status: AgentConnectionStatus): void {
    this.connectionStatus = status;
    this.statusListeners.forEach((listener) => listener(status));
  }
}
