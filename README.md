# copilotstudiorichui

## Nauta de reservas - POC Agencia de Viajes con Agente IA

POC construida con Next.js (App Router), React y TypeScript estricto.

## Stack
- Next.js + React + TypeScript
- Fluent UI React Components
- react-day-picker
- Zod
- Vitest

## Caracteristicas de la fase 1
- Panel de chat a la izquierda y panel de UI rica a la derecha.
- En movil, el panel rico cae debajo del chat.
- Flujo simulado con `MockAgentTransport` (sin Copilot Studio).
- Selector de fechas de ida y vuelta.
- Carrusel horizontal de vuelos simulados.
- Contratos de eventos validados con Zod.
- Endpoint placeholder `/api/copilot/token` con estado `501`.

## Estructura principal
- `app/` interfaz y endpoint de token placeholder.
- `components/chat/` componentes del chat.
- `components/travel/` componentes de UI rica.
- `lib/agent/` transporte, tipos y esquemas de eventos.
- `lib/mocks/` datos simulados.
- `docs/` arquitectura y contrato de eventos.
- `tests/` pruebas unitarias.

## Comandos
```bash
npm install
npm run dev
```

Abre `http://localhost:3000`.

### Calidad
```bash
npm run lint
npm run test
npm run build
```

## Notas
- No hay autenticacion en esta fase.
- No hay Direct Line real en esta fase.
- No se usan APIs reales de vuelos.

## Conexion con Nauta (Copilot Studio via Direct Line)

Crear `.env.local` con:

```bash
COPILOT_TOKEN_ENDPOINT=<TOKEN ENDPOINT DE COPILOT STUDIO>
NEXT_PUBLIC_AGENT_TRANSPORT=directline
```

Luego ejecutar:

```bash
npm run dev
```

Para volver al transporte simulado:

```bash
NEXT_PUBLIC_AGENT_TRANSPORT=mock
```
