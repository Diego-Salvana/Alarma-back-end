# API Alarma – Descripción

## Objetivo
API para gestionar sensores de un sistema de alarma doméstico, incluyendo:
- **Gestión de sensores** vía HTTP REST.
- **Eventos en tiempo real** vía WebSockets (Socket.IO).
- **Procesamiento de activaciones** recibidas por **MQTT (Mosquitto)**.
- **Persistencia** en MongoDB.

## Arquitectura y patrón de diseño
- **App/Servidor**: `server.ts` levanta un servidor HTTP y crea la instancia de Socket.IO con CORS habilitado.
- **Rutas (Express)**: Definidas por recurso (ej. `sensors.routes.ts`).
- **Controladores**: Clases que gestionan peticiones/respuestas HTTP (ej. `SensorController`).
- **Servicios**: Encapsulan la lógica de negocio (ej. `SensorService`).
- **Acceso a datos**: Interfaces/clases `SensorDataAccess` (MongoDB) para persistencia.
- **Middleware**: Validaciones y **JWT** (`checkJWT`) para proteger endpoints.
- **Mensajería**: Servicio `MosquittoSensorService` para integrar eventos MQTT.

## Protocolos y tecnologías
- **HTTP/REST**: Express.
- **WebSockets**: Socket.IO.
- **MQTT**: Integración con Mosquitto para mensajes de activación de sensores.
- **Base de datos**: MongoDB.
- **Autenticación**: JWT (formato Bearer en cabecera `Authorization`).

## Autenticación
- En endpoints protegidos, enviar: `Authorization: Bearer <token>`.
- Si falta o es inválido, la API responde con error correspondiente (4xx) mediante el manejador de errores centralizado.

## Endpoints principales (Sensores)
Base (referencial): `/sensors`

- **GET** `/:sensorNumber`
  - Protegido por JWT.
  - Devuelve datos de un sensor por número.

- **PATCH** `/sensor-name`
  - Valida payload, protegido por JWT.
  - Actualiza el nombre del sensor.

- **POST** `/`
  - Valida payload de creación, protegido por JWT.
  - Crea un nuevo sensor para el usuario/casa.

- **PATCH** `/:houseId/info/:sensorNumber`
  - Valida payload, protegido por JWT.
  - Actualiza información específica del sensor en una casa.

- **DELETE** `/:houseId/:sensorNumber`
  - Protegido por JWT.
  - Elimina el sensor indicado.

## WebSockets (Socket.IO)
- **Conexión**: `ws(s)://<host>:<port>/api-alarma/socket` con Socket.IO.
- **Eventos**:
  - El servidor puede emitir eventos a un `topic` usando `emitDataSockets(topic, data)`.
  - Ejemplo de escucha de prueba: `topico/usuario_1`.

## MQTT (Mosquitto)
- Servicio: `MosquittoSensorService.updateHistory(userName, houseName, message)`.
- Flujo:
  - Se recibe un `message` MQTT.
  - Se valida y extrae el `sensorNumber` (`verifySensorNumber`).
  - Se registra una `activationDate` en la colección del sensor vía `SensorDataAccess.addActivationDate(...)`.
- Uso: Para mantener histórico de activaciones de sensores (p. ej. disparos de alarma).

## Formato de respuestas y manejo de errores
- Formato estándar:
  - Éxito: `statusCode 2xx` con `{ message, data? }`.
  - Error: `statusCode 4xx/5xx` con mensaje claro desde `ErrorHandler.generateResponse(...)`.
- Validaciones previas: `createSensorValidator`, `updateNameSensorValidator`, `updateInfoSensorValidator`.

## Notas de desarrollo
- El proyecto trabaja con **clases** (Controller/Service/DataAccess) para separar responsabilidades.
- Endpoints protegidos por **JWT**. Es necesario enviar el token correcto.
- Para tiempo real, se debe suscribir a los tópicos relevantes mediante Socket.IO.
