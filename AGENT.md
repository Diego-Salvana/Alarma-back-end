## Project Overview

This project is the backend API for a smart home alarm system.

The API allows users to manage and control alarm systems installed in their houses, including multiple security sensors connected to a central alarm controller.

The system is organized around four main entities:

- **User**: the account that owns and manages alarm systems.
- **House**: represents a physical location where an alarm system is installed.
- **Central**: the alarm control unit associated with a house. It manages the alarm state, security code and alarm history.
- **Sensors**: security devices connected to the central that detect events and can trigger the alarm.

Each user can have multiple houses.  
Each house contains a single central unit and multiple sensors.

The API provides functionality for:

- user registration with email verification
- password recovery
- alarm control (arm / disarm with optional sensor exclusion)
- management of houses and sensors
- real-time alarm notifications
- administrative management of user system settings

The system is designed to support real-time communication with alarm devices through MQTT and WebSockets.

## Tech Stack

The backend is implemented using the following technologies:

### Runtime
- **Node.js** with **TypeScript**

### HTTP Framework
- **Express** for REST API endpoints

### Database
- **MongoDB** as the primary database
- **Mongoose** for schema definition and database access

### Validation
- **Zod** for request validation and schema validation

### Authentication
- **JWT (JSON Web Tokens)** for authentication
- **bcrypt** for password hashing

### Real-Time Communication
- **Socket.IO** for real-time communication with frontend clients

### Device Communication
- **MQTT** for communication with physical alarm devices

### Email Services
- **Nodemailer** for account verification and password recovery emails

## Architecture

The backend follows a layered architecture that separates HTTP handling, business logic and data access.

### Project Structure

The main source code is located inside the `src` directory.

src/
app/
controllers/
routes/
services/
database/
models/
interfaces/
middleware/
mqtt/
websocket/
utils/
server.ts

### Layer Responsibilities

The system is organized in the following layers:

**Routes**
Define the HTTP endpoints and map them to controllers.

**Controllers**
Handle HTTP requests and responses.  
Controllers should contain minimal logic and delegate business operations to services.

**Services**
Contain the core business logic of the application.  
Services coordinate operations between data access, MQTT events and WebSocket notifications.

**Data Access**
Responsible for interacting with the database.  
Data access classes use Mongoose models to perform database operations.

**Models**
Define the MongoDB schemas using Mongoose.

**MQTT**
Handles communication with physical alarm devices through Mosquitto.

**WebSocket**
Manages real-time communication with frontend clients using Socket.IO.

### Communication Flows

The system supports three main communication flows.

**HTTP API**

Client → Routes → Controllers → Services → DataAccess → Database

**MQTT Device Communication**

Device → MQTT Handler → MQTT Event Dispatcher → Services → DataAccess → Database

**Real-Time Notifications**

Services → WebSocket Service → Connected Clients

## Code Conventions

The project follows a set of conventions to maintain consistency and separation of responsibilities.

### Async Code

All asynchronous code must use **async/await**.

Do not use:
- callbacks
- `.then()` chains

### Error Handling

Errors must be handled using the centralized error handler.

Controllers should use:

ErrorHandler.generateResponse()

to generate standardized HTTP error responses.

### API Responses

Controllers should return responses using the following structure:

{
  message: string,
  data: ResponseDTO
}

Where `ResponseDTO` represents a response interface (for example `HouseResponse`, `UserResponse`, etc.).

Mongoose models must never be returned directly to the client.

### Validation

Request validation is handled through **middleware** using **Zod**.

Controllers and services should assume that incoming data has already been validated.

### Naming Conventions

Service methods should use concise action names because the entity context is already provided by the class.

Example:

UserService.create()
HouseService.update()
SensorService.rename()

Avoid redundant names such as:

createUser()
updateHouse()

Functions defined outside classes should use descriptive names that clearly indicate the operation they perform.

## Real-Time Communication

The backend acts as the central orchestrator for all communication between frontend clients and physical alarm devices.

The system uses two real-time communication mechanisms:

- **MQTT** for communication with alarm hardware devices
- **WebSockets (Socket.IO)** for real-time updates to frontend clients

### MQTT Communication

MQTT is used to communicate with physical alarm devices such as the central alarm controller and connected sensors.

The backend manages all MQTT communication.

Typical flow when a device sends an event:

Device → MQTT Message → MosquittoAccess → MosquittoEventDispatcher → Services → DataAccess → Database

When necessary, services may also notify connected clients through WebSockets.

### Device Commands

Commands sent from the frontend to alarm devices always go through the backend.

Flow:

Frontend → HTTP API → Controller → Service → MQTT → Device

The backend sends the HTTP response to the client before executing the MQTT command flow.

### WebSocket Notifications

WebSockets are used to push real-time updates from the backend to frontend clients.

Typical events include:

- alarm state changes
- alarm triggered events
- sensor state updates

WebSockets are **only used for server-to-client notifications**.

Clients do not send commands through WebSockets.

## API Contracts

The API uses standardized response objects to ensure consistency across all endpoints.

### Response Wrapper

All successful HTTP responses should follow the `ApiResponse<T>` structure.

Example:
```ts
{
  message: string,
  data?: T
}
```

Where `T` represents a response DTO.

Example:
```ts
{
  message: "House retrieved successfully",
  data: HouseResponse
}
```

### Response DTOs

Controllers must return response DTOs instead of database models.

Examples of response DTOs used in the system include:

- `LoginResponse`
- `ProfileResponse`
- `HouseResponse`
- `DeviceResponse`
- `AddressResponse`

These DTOs define the public API contract and must remain independent from database schemas.

### DTO Mapping

DTOs are constructed through dedicated transformation classes (DTO classes).

These classes are responsible for converting domain or database objects into response DTOs.

Example:

User → UserDto → LoginResponse

Services should return domain objects, while DTO classes transform them into API response structures.

### Important Rules

- Mongoose models must never be returned directly to clients.
- Controllers should return DTO responses wrapped in `ApiResponse<T>`.
- DTOs define the public contract of the API and should remain stable.

## Agent Guidelines

This section defines how AI agents should interact with and modify the codebase.

### Respect the Existing Architecture

Agents must always follow the project architecture and never bypass the defined layers.

Required flow:  
Controller → Service → DataAccess → Database

For device communication:  
MQTT → MosquittoAccess → MosquittoEventDispatcher → Service

For frontend updates:  
Service → WebSocketService → Frontend


Agents **must not**:

- Access the database outside `DataAccess` classes.
- Add business logic to controllers.
- Send WebSocket events directly from controllers.
- Publish MQTT events outside services.

### Prefer Extending Existing Code

Before creating new classes or files, agents should:

1. Search for an existing service handling the same entity.
2. Extend the existing logic when appropriate.
3. Avoid duplicating functionality.

Example:
```ts
HouseService → extend it
NOT → create HouseManagementService
```

### Follow Existing Coding Patterns

Agents must respect the project's coding patterns.

- Required patterns: Use async/await
- Handle errors with ErrorHandler.generateResponse
- Use DTO classes to map domain entities to API responses

### Do Not Introduce Unnecessary Abstractions

Agents should avoid:

- unnecessary design patterns
- excessive layering
- generic utility abstractions

The project favors simple and explicit code.

### Maintain API Response Structure

All HTTP responses must follow the `ApiResponse<T>` structure.

Example:

```ts
{
  message: string,
  data: T
}
```

### Do Not Modify DTO Contracts Without Reason

DTOs define the public API contract used by frontend applications.

Agents must not:

- remove fields from existing DTOs
- rename DTO properties
- change response formats

Any change to DTO contracts must be explicitly justified.
