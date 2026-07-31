---
name: mqtt-event-dispatcher-usage
description: Ensures all MQTT or device-originated events are routed through MosquittoEventDispatcher before reaching services. Use when working with MQTT message handlers, dispatcher methods, or device event flows.
---
# Skill: MQTT Event Dispatcher Usage

## Purpose

Ensure all MQTT or device-originated events are routed through a dedicated dispatcher layer before reaching services.

This enforces separation of concerns between transport (MQTT), orchestration (dispatcher), and business logic (services).

## Rules

- MQTT message handlers MUST NOT call services directly
- All device-originated events MUST go through MosquittoEventDispatcher
- Dispatcher methods MUST be small and only delegate to services
- Dispatcher MUST NOT contain business logic
- Services MUST remain the single source of business logic

## Dispatcher Responsibilities

- Receive parsed MQTT events
- Map raw data into domain interfaces (AlarmArming, Lights, etc.)
- Call the corresponding service method
- Never perform validation or business decisions

## MQTT Handler Responsibilities

- Subscribe to topics
- Parse incoming payloads
- Identify event type
- Call the correct dispatcher method

## Service Responsibilities

- Execute business logic
- Validate data
- Persist state
- Trigger WebSocket events if needed

## Example Flow

MQTT Message → MQTT Handler → Dispatcher → Service → (DB / WebSocket / MQTT)

## Anti-Patterns

- Calling services directly from MQTT handlers
- Adding business logic inside the dispatcher
- Skipping the dispatcher for "simple" cases
- Duplicating mapping logic in multiple places
