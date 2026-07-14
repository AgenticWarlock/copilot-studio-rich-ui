import { describe, expect, it } from "vitest";
import type { Activity } from "botframework-directlinejs";
import {
  isOwnUserMessage,
  mapDirectLineActivityToAgentEvent,
  mapDirectLineEventActivityToAgentEvent,
} from "@/lib/agent/directLineAdapters";

describe("directLineAdapters", () => {
  it("converts a message activity into ui.showMessage", () => {
    const activity: Activity = {
      type: "message",
      text: "Hola desde Nauta",
      from: { id: "nauta-bot" },
    };

    const result = mapDirectLineActivityToAgentEvent(activity);

    expect(result).toEqual({
      type: "ui.showMessage",
      payload: {
        text: "Hola desde Nauta",
      },
    });
  });

  it("filters out own user messages", () => {
    const activity: Activity = {
      type: "message",
      text: "mensaje local",
      from: { id: "web-user-1" },
    };

    expect(isOwnUserMessage(activity, "web-user-1")).toBe(true);
  });

  it("filters out user-role messages even with different id", () => {
    const activity: Activity = {
      type: "message",
      text: "eco usuario",
      from: { id: "dl_user_abc", role: "user" },
    };

    expect(isOwnUserMessage(activity, "web-user-1")).toBe(true);
    expect(mapDirectLineActivityToAgentEvent(activity)).toBeNull();
  });

  it("does not map non-message activities", () => {
    const activity: Activity = {
      type: "typing",
      from: { id: "nauta-bot" },
    };

    expect(mapDirectLineActivityToAgentEvent(activity)).toBeNull();
  });

  it("truncates long bot messages to 4000 chars", () => {
    const activity: Activity = {
      type: "message",
      text: `mensaje ${"x".repeat(4500)}`,
      from: { id: "nauta-bot", role: "bot" },
    };

    const result = mapDirectLineActivityToAgentEvent(activity);

    expect(result?.type).toBe("ui.showMessage");
    expect(result?.payload.text.length).toBe(4000);
    expect(result?.payload.text.endsWith("...")).toBe(true);
  });

  // --- mapDirectLineEventActivityToAgentEvent ---

  describe("mapDirectLineEventActivityToAgentEvent", () => {
    it("maps a valid ui.showDatePicker event activity", () => {
      const activity: Activity = {
        type: "event",
        name: "ui.showDatePicker",
        from: { id: "nauta-bot", role: "bot" },
        value: {
          origin: "Valencia",
          destination: "Ibiza",
          minDate: "2026-07-15",
          mode: "range",
        },
      };

      const result = mapDirectLineEventActivityToAgentEvent(activity);

      expect(result).toEqual({
        type: "ui.showDatePicker",
        payload: {
          origin: "Valencia",
          destination: "Ibiza",
          minDate: "2026-07-15",
          mode: "range",
        },
      });
    });

    it("returns null for event with invalid value (missing origin)", () => {
      const activity: Activity = {
        type: "event",
        name: "ui.showDatePicker",
        from: { id: "nauta-bot", role: "bot" },
        value: {
          destination: "Ibiza",
          minDate: "2026-07-15",
          mode: "range",
        },
      };

      expect(mapDirectLineEventActivityToAgentEvent(activity)).toBeNull();
    });

    it("returns null for event with invalid minDate format", () => {
      const activity: Activity = {
        type: "event",
        name: "ui.showDatePicker",
        from: { id: "nauta-bot", role: "bot" },
        value: {
          origin: "Valencia",
          destination: "Ibiza",
          minDate: "15/07/2026",
          mode: "range",
        },
      };

      expect(mapDirectLineEventActivityToAgentEvent(activity)).toBeNull();
    });

    it("returns null for unknown event names", () => {
      const activity: Activity = {
        type: "event",
        name: "ui.unknownEvent",
        from: { id: "nauta-bot", role: "bot" },
        value: {},
      };

      expect(mapDirectLineEventActivityToAgentEvent(activity)).toBeNull();
    });

    it("returns null for non-event activities", () => {
      const activity: Activity = {
        type: "message",
        text: "hola",
        from: { id: "nauta-bot", role: "bot" },
      };

      expect(mapDirectLineEventActivityToAgentEvent(activity)).toBeNull();
    });

    it("maps a valid ui.showTravelPartySelector event activity", () => {
      const activity: Activity = {
        type: "event",
        name: "ui.showTravelPartySelector",
        from: { id: "nauta-bot", role: "bot" },
        value: {
          minPassengers: 1,
          maxPassengers: 4,
          defaultPassengers: 2,
          allowPets: true,
        },
      };

      const result = mapDirectLineEventActivityToAgentEvent(activity);
      expect(result?.type).toBe("ui.showTravelPartySelector");
    });

    it("returns null for showTravelPartySelector with invalid payload", () => {
      const activity: Activity = {
        type: "event",
        name: "ui.showTravelPartySelector",
        from: { id: "nauta-bot", role: "bot" },
        value: { minPassengers: 0 }, // invalid — min must be >= 1
      };
      expect(mapDirectLineEventActivityToAgentEvent(activity)).toBeNull();
    });

    it("maps a valid ui.showCabinSelector event activity", () => {
      const activity: Activity = {
        type: "event",
        name: "ui.showCabinSelector",
        from: { id: "nauta-bot", role: "bot" },
        value: { cabinId: "exterior-pet-friendly" },
      };

      const result = mapDirectLineEventActivityToAgentEvent(activity);
      expect(result).toEqual({
        type: "ui.showCabinSelector",
        payload: { cabinId: "exterior-pet-friendly" },
      });
    });

    it("returns null for showCabinSelector with empty cabinId", () => {
      const activity: Activity = {
        type: "event",
        name: "ui.showCabinSelector",
        from: { id: "nauta-bot", role: "bot" },
        value: { cabinId: "" },
      };
      expect(mapDirectLineEventActivityToAgentEvent(activity)).toBeNull();
    });

    it("parses Power FX string value for showCabinSelector", () => {
      const activity: Activity = {
        type: "event",
        name: "ui.showCabinSelector",
        from: { id: "nauta-bot", role: "bot" },
        value: '{ cabinId: "exterior-pet-friendly" }',
      };
      const result = mapDirectLineEventActivityToAgentEvent(activity);
      expect(result?.type).toBe("ui.showCabinSelector");
    });
  });
});