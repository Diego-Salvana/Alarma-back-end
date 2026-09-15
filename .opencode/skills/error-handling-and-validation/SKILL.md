---
name: error-handling-and-validation
description: Enforces the centralized error handling and Zod-based validation discipline documented in extras/doc/manejo-de-errores-centralizado.md. Use when adding routes, validation middleware, controllers, services, or data access classes, and when throwing, handling, or surfacing errors as HTTP responses.
---
# Skill: Error Handling and Validation Discipline

## Purpose

Ensure consistent, centralized error handling and proper validation across the entire API. All errors follow the architecture described in `extras/doc/manejo-de-errores-centralizado.md` and implemented in `src/errors/` and `src/middlewares/error-handler.ts`.

## When to Use This Skill

- Adding or modifying routes
- Writing or updating validation middleware
- Writing or updating controllers
- Writing or updating services
- Writing or updating data access classes
- Generating or handling error responses

## Error Architecture

### Base Class: `AppError`

All controlled application errors derive from the abstract class `AppError`:

```typescript
// src/errors/AppError.ts
export abstract class AppError extends Error {
  constructor (
    public statusCode: number,
    message: string,
    public name: string
  ) {
    super(message);
  }
}
```

Each error carries the information needed to produce an HTTP response:
- `statusCode` — HTTP status code (400, 401, 403, 404, 409, etc.)
- `message` — human-readable description (in English)
- `name` — stable identifier of the error type

### Error Hierarchy

```
AppError (base, abstract)
├── BadRequestError   (400) — "BadRequest"
├── UnauthorizedError (401) — "Unauthorized"
├── ForbiddenError    (403) — "Forbidden"
├── NotFoundError     (404) — "NotFound"
├── ConflictError     (409) — "Conflict"
└── ValidationError   (400) — "ValidationError"
```

| Error                | HTTP Code | `name`         | Typical Use                                  |
| -------------------- | --------- | -------------- | -------------------------------------------- |
| `BadRequestError`    | 400       | `BadRequest`   | Invalid input data                           |
| `UnauthorizedError`  | 401       | `Unauthorized` | Missing authentication / invalid credentials |
| `ForbiddenError`     | 403       | `Forbidden`    | Authenticated but lacking permissions        |
| `NotFoundError`      | 404       | `NotFound`     | Resource does not exist                      |
| `ConflictError`      | 409       | `Conflict`     | Resource conflict (duplicates)               |
| `ValidationError`    | 400       | `ValidationError` | Data validation failure                 |

All error classes live in `src/errors/` and are re-exported from `src/errors/index.ts`.

## Error Handler Middleware

The `errorHandler` middleware is registered as the **last** middleware in the Express chain (after all routes) in `src/app/app.ts`:

```typescript
// src/middlewares/error-handler.ts
export function errorHandler (error: unknown, req: RequestExt, res: Response, next: NextFunction) {
  if (error instanceof AppError) {
    res.status(error.statusCode).send({
      name: error.name,
      message: error.message,
      statusCode: error.statusCode
    });
    return;
  }

  console.error('Error:', error);

  res.status(500).send({
    name: 'InternalServerError',
    message: 'Internal server error',
    statusCode: 500
  });
}
```

### Handling Flow

```
Controller
    ↓  (throws / service throws)
Service
    ↓  (throws / data access throws)
DataAccess
    ↓  (throw error)
ErrorHandler Middleware
    ↓
HTTP Response
```

- **Known error**: An instance of `AppError` (or subclass). The middleware uses its `statusCode`, `name`, and `message` directly.
- **Unexpected error**: Any other type (e.g. `TypeError`, infrastructure error). The middleware logs it internally and returns a generic HTTP 500 with no technical details exposed to the client.

## Response Formats

### Success — `ApiResponse<T = null>`

All successful HTTP responses with body follow this structure (`src/interfaces/api-responses.interfaces.ts`):

```typescript
export interface ApiResponse<T = null> {
  message: string;
  data: T;
}
```

- `message` — required, in English
- `data` — always of type `T`; when an endpoint has no useful payload it uses `T = null` and sends `data: null` explicitly

All success responses with body are built via the centralized helper (`src/utils/response-helper.ts`):

```typescript
sendSuccess<T>(res, statusCode, message, data: T)
```

Example:

```typescript
sendSuccess(res, 200, 'House retrieved successfully', house);
```

Example without useful payload:

```typescript
sendSuccess(res, 200, 'Verification email sent', null);
```

Exception: `DELETE` endpoints respond `204 No Content` without body, so `ApiResponse<T>` does not apply in those cases.

### Error — `ErrorResponse`

All errors exposed by the API use this structure:

```json
{
  "name": "NotFound",
  "message": "House not found",
  "statusCode": 404
}
```

## Layer Responsibilities

### Controllers (`src/controllers/`)

- Extract parameters from the request
- Invoke services
- Construct success responses via `sendSuccess<T>(res, statusCode, message, data: T)` (`ApiResponse<T = null>`), with the 4th argument always required
- **Must NOT** catch errors with try/catch
- **Must NOT** construct error responses manually — throw the appropriate `AppError` subclass and let `errorHandler` handle it

### Services (`src/services/`)

- Contain business logic
- Perform domain validations
- Determine when an operation should fail
- **Throw** the appropriate `AppError` subclass (`BadRequestError`, `NotFoundError`, `ConflictError`, etc.)
- Do **NOT** construct HTTP responses

### Data Access (`src/database/access/`)

- Access the database via Mongoose
- Transform infrastructure errors into `AppError` subclasses
- **Do NOT** construct HTTP responses

### Middlewares (`src/middlewares/`)

- Authentication and authorization checks throw `UnauthorizedError` / `ForbiddenError`
- Validation is performed in middleware using Zod (see next section)

## Validation with Zod

Request validation is handled through middleware using Zod schemas defined in `src/utils/zod-validators.ts`.

The `validateBody` middleware (`src/middlewares/validators.ts`) parses `req.body` with a Zod schema and calls `next()` on success, or returns a 400 with details on failure.

```typescript
// Route example
usersRouter.post('/login',
  validateBody(loginSchema), userController.login.bind(userController)
);
```

- Controllers and services **assume** input has already been validated.
- Place `validateBody(schema)` **before** the controller binding in the route definition.
- Use `.strict()` on schemas to reject unknown fields.
- Use `.pick()` / `.omit()` / `.partial()` to derive focused schemas from the base schemas in `src/utils/zod-schemas.ts`.

### Validation Order

In routes, apply middleware in this order to ensure correct error precedence:

```
Validation → Authentication → Authorization → Controller
```

## Rules

1. All successful responses with body use the `ApiResponse<T = null>` structure with `data: T` mandatory (built via `sendSuccess<T>()`, 4th argument always required); `DELETE` endpoints use `204 No Content` without body as the controlled exception.
2. Each error type determines its own `statusCode` via its constructor.
3. Controllers do **not** manually build known error responses — they throw and let `errorHandler` format the response.
4. HTTP error handling is centralized in the `errorHandler` middleware.
5. Unexpected errors result in HTTP 500 with a generic `{ name, message, statusCode }` response — never expose internal details.
6. The `name` field is a stable identifier of the error type (use the default per subclass).
7. The `message` field is a human-readable description oriented to people, **in English**.
8. Domain-specific errors are thrown only when they add real clarity — use the existing subclasses rather than inventing new ones.
9. All controllers use `async/await` (never callbacks or `.then()` chains).
10. All code is TypeScript.

## Anti-Patterns (Forbidden)

- Manual `try/catch` in controllers that builds custom error responses
- Validation logic inside services or controllers (must be in middleware)
- Throwing raw `new Error(...)` instead of an `AppError` subclass — this becomes a hidden 500
- Returning Mongoose models directly to the client — always use DTO transformation
- Accessing the database outside `DataAccess` classes
- Adding business logic to controllers
- Sending WebSocket events directly from controllers
- Publishing MQTT events outside services
- Creating new error classes when an existing subclass suffices

## Code Examples

### Throw a domain error in a Service

```typescript
import { NotFoundError } from '../errors';

async getOne(userId: string, houseId: string): Promise<House> {
  const house = await this.houseDataAccess.getOne(userId, houseId);
  if (!house) {
    throw new NotFoundError('House not found');
  }
  return house;
}
```

### Throw an error in a Controller

```typescript
import { ValidationError } from '../errors';

async getOne({ user, params }: RequestExt, res: Response) {
  const { sub, hid } = requireUserIdAndHouseId(user as SessionJwtPayload);
  const sensorNumber = Number(params.sensorNumber);

  if (isNaN(sensorNumber)) throw new ValidationError('Invalid sensor number');

  const responseSensor = await this.sensorService.getOne(sub, hid, sensorNumber);

  sendSuccess(res, 200, 'Sensor retrieved successfully', responseSensor);
}
```

### Successful response in a Controller

```typescript
sendSuccess(res, 200, 'House retrieved successfully', house);
```

### Successful response without payload in a Controller

```typescript
sendSuccess(res, 200, 'Verification email sent', null);
```

### The error handler converts the thrown error automatically

A thrown `NotFoundError('House not found')` is converted by `errorHandler` into:

```json
{
  "name": "NotFound",
  "message": "House not found",
  "statusCode": 404
}
```

HTTP status code `404`.

## Reference Locations

| Concern             | File(s)                                  |
| ------------------- | ---------------------------------------- |
| Base + subclasses   | `src/errors/`                            |
| Error exports       | `src/errors/index.ts`                    |
| Error handler       | `src/middlewares/error-handler.ts`       |
| App wiring          | `src/app/app.ts`                         |
| Validation schemas  | `src/utils/zod-schemas.ts`, `src/utils/zod-validators.ts` |
| Validation middleware | `src/middlewares/validators.ts`        |
| Auth middlewares    | `src/middlewares/user-jwt-check.ts`, `src/middlewares/admin-jwt-check.ts`, `src/middlewares/verification-jwt-check.ts` |
| Response interfaces | `src/interfaces/api-responses.interfaces.ts` |
| Response helper | `src/utils/response-helper.ts` |
| Documentation       | `extras/doc/manejo-de-errores-centralizado.md` |
