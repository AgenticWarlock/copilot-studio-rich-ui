"use client";

import { useEffect, useRef } from "react";
import React from "react";
import { Badge, Body1Strong, Card } from "@fluentui/react-components";
import { Bot24Regular } from "@fluentui/react-icons";
import type { AgentConnectionStatus } from "@/lib/agent/AgentTransport";
import type { ChatMessageModel } from "@/lib/agent/eventTypes";
import { ChatMessage } from "./ChatMessage";
import { ChatComposer } from "./ChatComposer";
import styles from "./ChatPanel.module.css";

interface ChatPanelProps {
  messages: ChatMessageModel[];
  isBusy: boolean;
  connectionStatus: AgentConnectionStatus;
  onSendMessage: (text: string) => Promise<void>;
  /** Contenido rico opcional que se renderiza inline al final de los mensajes */
  inlineContent?: React.ReactNode;
}

const statusColors: Record<AgentConnectionStatus, "success" | "warning" | "danger" | "informative"> = {
  online: "success",
  connecting: "warning",
  reconnecting: "warning",
  disconnected: "danger",
  expired: "warning",
  failed: "danger",
};

const statusLabels: Record<AgentConnectionStatus, string> = {
  online: "Conectado",
  connecting: "Conectando…",
  reconnecting: "Reconectando…",
  disconnected: "Desconectado",
  expired: "Sesión expirada",
  failed: "Error",
};

export function ChatPanel({ messages, isBusy, connectionStatus, onSendMessage, inlineContent }: ChatPanelProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isBusy]);

  return (
    <Card className={styles.wrapper} style={{ padding: 0, gap: 0 }}>
      <header className={styles.header}>
        {isBusy && <div className={styles.progressBar} aria-hidden="true" />}
        <div className={styles.headerLeft}>
          <div className={styles.avatarBot}>
            <Bot24Regular className={styles.botIcon} />
          </div>
          <div>
            <Body1Strong className={styles.headerTitle}>Asistente Trasmed</Body1Strong>
            <span className={styles.headerSub}>Reserva tu ferry</span>
          </div>
        </div>
        <Badge
          appearance="filled"
          color={statusColors[connectionStatus]}
          size="small"
        >
          {statusLabels[connectionStatus]}
        </Badge>
      </header>
      <section className={styles.messages} aria-label="Historial de conversación">
        {messages.length === 0 && (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon}>⚓</span>
            <Body1Strong className={styles.emptyText}>
              ¡Hola! Soy tu asistente de reservas Trasmed.
            </Body1Strong>
            <span className={styles.emptySub}>
              Cuéntame a dónde quieres viajar.
            </span>
          </div>
        )}
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        {isBusy && (
          <div className={styles.typingIndicator} aria-label="El agente está escribiendo">
            <div className={styles.typingBubble}>
              <span className={styles.dot} />
              <span className={styles.dot} />
              <span className={styles.dot} />
            </div>
            <span className={styles.typingLabel}>Asistente Trasmed está escribiendo…</span>
          </div>
        )}
        {inlineContent && (
          <div className={styles.inlineContent}>
            {inlineContent}
          </div>
        )}
        <div ref={messagesEndRef} />
      </section>
      <ChatComposer onSend={onSendMessage} disabled={isBusy} />
    </Card>
  );
}
