---
name: error-handling-and-validation
description: Enforces consistent error handling and Zod-based validation across the API. Use when adding routes, validation middleware, controllers, or services, and when generating or handling error responses with ErrorHandler.generateResponse().
---
# Skill: Error Handling and Validation Discipline

## Purpose

Ensure consistent error handling and proper validation across the entire API.

## Rules

- Validation MUST happen in middleware using Zod
- Controllers and services assume validated input

- All errors must be handled using:
  
  ErrorHandler.generateResponse()

## Controller Responsibilities

- Catch errors and delegate to ErrorHandler
- Never send raw error messages

## Anti-Patterns (Forbidden)

- Manual try/catch with custom responses
- Validation inside services
- Throwing unhandled errors to the client

## Implementation Guidance

- Use Zod schemas per route
- Keep validation logic outside business logic
- Standardize all error responses

## Best Practice

Structure:

Route → Validation Middleware → Controller → Service
