import { describe, expect, it } from "vitest";
import type { Activity } from "botframework-directlinejs";
import {
  isOwnUserMessage,
  mapDirectLineActivityToAgentEvent,
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

  it("truncates long bot messages to 500 chars", () => {
    const activity: Activity = {
      type: "message",
      text: `mensaje ${"x".repeat(800)}`,
      from: { id: "nauta-bot", role: "bot" },
    };

    const result = mapDirectLineActivityToAgentEvent(activity);

    expect(result?.type).toBe("ui.showMessage");
    expect(result?.payload.text.length).toBe(500);
    expect(result?.payload.text.endsWith("...")).toBe(true);
  });
});