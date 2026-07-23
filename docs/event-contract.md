# Contrato de eventos

## Objetivo
Definir los eventos tipados entre la UI y el agente. Todos se validan con Zod, pero el código actual no integra todos los eventos declarados en la pantalla ni en el transporte de Direct Line.

## Reglas
- Todos los eventos usan discriminated unions (`type`) y payload tipado.
- Todos los payloads se validan con Zod antes de consumirse.
- `ui.showMessage` no permite HTML en `payload.text`.

## Agente -> UI

### Implementados por `DirectLineTransport`

- `ui.showMessage` se recibe como una actividad Direct Line de tipo `message`.
- `ui.showDatePicker`, `ui.showTravelPartySelector` y `ui.showCabinSelector` se reciben como actividades de tipo `event`.

### ui.showDatePicker
```json
{
  "type": "ui.showDatePicker",
  "payload": {
    "destination": "Roma",
    "hint": "Selecciona fecha de ida y vuelta"
  }
}
```

### ui.showFlights
> **Pendiente de integración:** el esquema y el mock declaran este evento, pero `DirectLineTransport` no lo procesa y `app/page.tsx` no monta el componente de vuelos.

```json
{
  "type": "ui.showFlights",
  "payload": {
    "destination": "Roma",
    "fromDate": "2026-10-12",
    "toDate": "2026-10-18",
    "flights": [
      {
        "id": "AZ-1452",
        "airline": "Aerolínea de ejemplo",
        "origin": "Madrid",
        "destination": "Roma",
        "departureTime": "09:30",
        "arrivalTime": "12:00",
        "duration": "2h 30m",
        "stops": 0,
        "priceEur": 120
      }
    ]
  }
}
```

### ui.showMessage
```json
{
  "type": "ui.showMessage",
  "payload": {
    "text": "Texto plano sin HTML"
  }
}
```

### ui.showTravelPartySelector
```json
{
  "type": "ui.showTravelPartySelector",
  "payload": {
    "minPassengers": 1,
    "maxPassengers": 4,
    "defaultPassengers": 2,
    "allowPets": true
  }
}
```

### ui.showCabinSelector
```json
{
  "type": "ui.showCabinSelector",
  "payload": {
    "cabinId": "exterior-pet-friendly"
  }
}
```

## UI -> Agente

### Implementados por `DirectLineTransport`

- `ui.datesSelected`
- `ui.travelPartySelected`
- `ui.cabinSelected`

### ui.datesSelected
```json
{
  "type": "ui.datesSelected",
  "payload": {
    "origin": "Madrid",
    "destination": "Roma",
    "fromDate": "2026-10-12",
    "toDate": "2026-10-18"
  }
}
```

### ui.flightSelected
> **Pendiente de integración:** el tipo está declarado, pero `DirectLineTransport.sendEvent` no lo envía y la pantalla actual no expone un selector de vuelos.

```json
{
  "type": "ui.flightSelected",
  "payload": {
    "flightId": "AZ-1452"
  }
}
```

### ui.travelPartySelected
```json
{
  "type": "ui.travelPartySelected",
  "payload": {
    "passengers": 2,
    "hasPets": true
  }
}
```

### ui.cabinSelected
```json
{
  "type": "ui.cabinSelected",
  "payload": "Origen: Valencia. Destino: Ibiza. Fechas: 20 jul 2026 - 23 jul 2026. Pasajeros: 2. Mascota: Si. Camarote: Camarote exterior pet friendly. Cubierta: 8. Suplemento: +95 EUR"
}
```

Al enviarse mediante Direct Line, el agente recibe el texto directamente en `System.Activity.Value`.
El resumen puede leerse con `Text(System.Activity.Value)`.
