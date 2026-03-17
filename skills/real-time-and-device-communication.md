# Skill: Real-Time and Device Communication

## Purpose

Ensure correct coordination between HTTP requests, MQTT device communication, and WebSocket notifications.

## Rules

- All device communication MUST go through services
- MQTT publishing must ONLY happen inside services
- WebSocket events must ONLY be triggered from services

## Communication Flows

### Device Command

Frontend → Controller → Service → MQTT → Device

- HTTP response must be returned BEFORE MQTT execution completes

### Device Event

Device → MQTT → Dispatcher → Service → DataAccess → Database

### Notifications

Service → WebSocketService → Clients

## Anti-Patterns (Forbidden)

- Publishing MQTT messages from controllers
- Emitting WebSocket events outside services
- Blocking HTTP responses waiting for device confirmation

## Implementation Guidance

- Treat MQTT as asynchronous side-effect
- Prioritize real-time communication over database persistence

- Database persistence and WebSocket notifications can occur in parallel
- Do NOT block real-time updates waiting for database writes

- WebSocket events should reflect the latest known system state, even if persistence has not completed yet

- Ensure eventual consistency between real-time state and database state
