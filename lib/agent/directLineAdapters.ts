import type { Activity } from "botframework-directlinejs";
import type { AgentToUiEvent } from "@/lib/agent/eventTypes";

const MAX_AGENT_MESSAGE_LENGTH = 500;

const truncateText = (value: string): string => {
  if (value.length <= MAX_AGENT_MESSAGE_LENGTH) {
    return value;
  }

  return `${value.slice(0, MAX_AGENT_MESSAGE_LENGTH - 3)}...`;
};

export const isOwnUserMessage = (activity: Activity, userId: string): boolean => {
  if (activity.type !== "message") {
    return false;
  }

  if (activity.from?.id === userId) {
    return true;
  }

  return activity.from?.role === "user";
};

export const mapDirectLineActivityToAgentEvent = (
  activity: Activity,
): AgentToUiEvent | null => {
  if (activity.type !== "message") {
    return null;
  }

  // In Direct Line streams we can receive echoes of user messages.
  // Only map bot-originated messages to the chat as agent replies.
  if (activity.from?.role && activity.from.role !== "bot") {
    return null;
  }

  const text = activity.text?.trim();
  if (!text) {
    return null;
  }

  return {
    type: "ui.showMessage",
    payload: {
      text: truncateText(text),
    },
  };
};