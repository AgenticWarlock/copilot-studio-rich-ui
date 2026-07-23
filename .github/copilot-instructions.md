# Copilot Instructions - Copilot Studio Rich UI

## Arquitectura
- Frontend en Next.js App Router (`app/page.tsx`) con dos paneles: chat y UI rica.
- Capa de agente abstraida por `AgentTransport`.
- Implementaciones:
  - `MockAgentTransport`: flujo simulado para desarrollo, demostraciones y pruebas.
  - `DirectLineTransport`: integración activa con Copilot Studio mediante Direct Line.

## Contratos de eventos
Eventos Agente -> UI:
- `ui.showDatePicker`
- `ui.showFlights`
- `ui.showMessage`
- `ui.showTravelPartySelector`
- `ui.showCabinSelector`

Eventos UI -> Agente:
- `ui.datesSelected`
- `ui.flightSelected`
- `ui.travelPartySelected`
- `ui.cabinSelected`

Todos los eventos deben:
- Tener tipo cerrado (discriminated union).
- Validarse con Zod.
- Evitar HTML en mensajes del agente.

## Regla de alcance del workspace
- No crear ni modificar archivos fuera de la raiz activa del workspace.
- Verificar siempre la raiz antes de operaciones de scaffolding o scripts.
