---
name: layered-architecture-enforcement
description: Ensures new features and modifications follow the project's layered architecture (Controller -> Service -> DataAccess -> Database). Use when adding endpoints, controllers, services, or data access classes, or when touching Mongoose models and database access.
---
# Skill: Layered Architecture Enforcement

## Purpose

Ensure that all new features and modifications strictly follow the project's layered architecture.

## Rules

- Always respect the flow:
  Controller → Service → DataAccess → Database

- Controllers:
  - Must only handle HTTP concerns (request/response)
  - Must NOT contain business logic

- Services:
  - Contain all business logic
  - Coordinate DataAccess, MQTT and WebSocket interactions

- DataAccess:
  - Is the ONLY layer allowed to interact with the database
  - Must use Mongoose models

## Anti-Patterns (Forbidden)

- Accessing Mongoose models from controllers or services
- Placing business logic inside controllers
- Calling MQTT or WebSocket directly from controllers

## Implementation Guidance

When adding a new feature:

1. Define route
2. Implement controller (minimal logic)
3. Add logic in service
4. Use DataAccess for persistence

If similar logic already exists, extend existing services instead of creating new ones.
