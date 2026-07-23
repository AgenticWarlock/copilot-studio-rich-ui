# Agente de Copilot Studio

La integración con Copilot Studio se realiza mediante Direct Line y está implementada en `lib/agent/DirectLineTransport.ts`.

## Configuración

Configura estas variables en `.env.local`:

```dotenv
COPILOT_TOKEN_ENDPOINT=https://<tu-endpoint-de-token>
NEXT_PUBLIC_AGENT_TRANSPORT=directline
```

`POST /api/copilot/token` solicita el token al endpoint configurado desde el servidor. La respuesta debe incluir `token`, `expires_in` y `conversationId`; se valida con Zod antes de enviarse al cliente.

El cliente usa el dominio europeo de Direct Line por defecto. Para otro dominio regional, define `NEXT_PUBLIC_DIRECT_LINE_DOMAIN` con la URL que termina en `/v3/directline`.

## Contrato

Los mensajes de bot se muestran como `ui.showMessage`. Para activar UI rica, el agente debe enviar actividades de tipo `event` con los nombres y valores definidos en [el contrato de eventos](event-contract.md).
