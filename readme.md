# 🚨 Alarma - Backend API

Un backend robusto y escalable para un **sistema de alarma domótico**, construido con **TypeScript**, **Express**, **MongoDB** y comunicación en **tiempo real** mediante **WebSockets** y **MQTT**.

## 📋 Descripción General

**Alarma-back-end** es la API central que permite a los usuarios gestionar sistemas de alarma instalados en sus casas. El sistema integra sensores de seguridad, unidades de control central y notificaciones en tiempo real para proporcionar una experiencia completa de monitoreo y control del hogar.

### Entidades Principales

El sistema está organizado alrededor de cuatro entidades fundamentales:

- **Usuario**: Cuenta que posee y gestiona los sistemas de alarma
- **Casa**: Ubicación física donde está instalado un sistema de alarma
- **Central**: Unidad de control de alarma asociada a una casa, gestiona el estado, código de seguridad e historial
- **Sensores**: Dispositivos de seguridad conectados a la central que detectan eventos y pueden disparar la alarma

Cada usuario puede tener múltiples casas, y cada casa contiene una unidad central y múltiples sensores.

## ✨ Características Principales

- ✅ **Gestión de usuarios** con verificación por email y recuperación de contraseña
- ✅ **Control de alarmas** (armado/desarmado con exclusión opcional de sensores)
- ✅ **Gestión de casas y sensores** con API REST completa
- ✅ **Notificaciones en tiempo real** de cambios de estado de alarma y eventos
- ✅ **Comunicación MQTT** con dispositivos físicos de alarma
- ✅ **WebSockets (Socket.IO)** para actualizaciones en tiempo real a clientes
- ✅ **Autenticación JWT** para endpoints protegidos
- ✅ **Validación robusta** con Zod en todas las peticiones
- ✅ **Manejo centralizado de errores** con respuestas estandarizadas

## 🛠️ Stack Tecnológico

### Runtime
- **Node.js** + **TypeScript**

### HTTP Framework
- **Express** - Framework web para endpoints REST

### Base de Datos
- **MongoDB** - Base de datos primaria
- **Mongoose** - ODM para esquemas y acceso a datos

### Validación
- **Zod** - Validación robusta de esquemas de peticiones

### Autenticación
- **JWT** (JSON Web Tokens) - Autenticación sin estado
- **bcryptjs** - Hashing seguro de contraseñas

### Comunicación en Tiempo Real
- **Socket.IO** - Comunicación bidireccional con clientes frontend
- **MQTT** - Integración con dispositivos físicos de alarma (Mosquitto)

### Email
- **Nodemailer** - Verificación de cuenta y recuperación de contraseña

## 🏗️ Arquitectura

El backend sigue una **arquitectura en capas** que separa el manejo HTTP, la lógica de negocio y el acceso a datos.

### Estructura del Proyecto

```
src/
├── app/                 # Configuración de la aplicación Express
├── controllers/         # Manejadores de peticiones HTTP
├── routes/              # Definición de endpoints
├── services/            # Lógica de negocio principal
├── database/
│   ├── models/          # Esquemas de MongoDB con Mongoose
│   └── access/          # Clases de acceso a datos
├── dtos/                # Data Transfer Objects (respuestas)
├── interfaces/          # Contratos TypeScript
├── middleware/          # Middleware (autenticación, validación)
├── mqtt/                # Integración MQTT y manejadores
├── websocket/           # Servicio de WebSockets (Socket.IO)
├── utils/               # Funciones utilitarias
└── server.ts            # Punto de entrada
```

### Flujos de Comunicación

#### 1. **HTTP API**
```
Cliente → Routes → Controllers → Services → DataAccess → Database
```

#### 2. **Dispositivos MQTT**
```
Dispositivo → MQTT Handler → MosquittoEventDispatcher → Services → DataAccess → Database
```

#### 3. **Notificaciones en Tiempo Real**
```
Services → WebSocketService → Clientes Conectados
```

## 🔐 Autenticación

Todos los endpoints protegidos requieren un **JWT Bearer Token** en la cabecera `Authorization`:

```bash
Authorization: Bearer <token>
```

Los tokens JWT se generan durante el login y se validan mediante middleware en endpoints protegidos.

## 📡 Endpoints Principales

### Sensores
- **GET** `/api/sensors/:sensorNumber` - Obtener sensor específico
- **POST** `/api/sensors/` - Crear nuevo sensor
- **PATCH** `/api/sensors/sensor-name` - Actualizar nombre del sensor
- **PATCH** `/api/sensors/:houseId/info/:sensorNumber` - Actualizar info del sensor
- **DELETE** `/api/sensors/:houseId/:sensorNumber` - Eliminar sensor

*Todos los endpoints de sensores están protegidos por JWT*

### WebSockets
- **Conexión**: `ws(s)://<host>:<port>/api-alarma/socket`
- **Eventos**: El servidor emite eventos a tópicos específicos (ej: `arming/user_1`)

### MQTT
El servicio procesa eventos MQTT de dispositivos físicos:
- Recibe mensajes MQTT de sensores
- Valida y extrae el número de sensor
- Registra fechas de activación en el historial del sensor
- Notifica a clientes conectados mediante WebSockets

## 📊 Respuestas de la API

### Estructura Estándar de Respuestas

**Respuesta Exitosa (2xx)**
```json
{
  "message": "Operación completada exitosamente",
  "data": {
    "id": "...",
    "name": "...",
    ...
  }
}
```

**Respuesta con Error (4xx/5xx)**
```json
{
  "name": "Nombre del error",
  "message": "Descripción del error",
  "statusCode": 400
}
```

### DTOs de Respuesta

El API utiliza Data Transfer Objects para la comunicación:
- `LoginResponse` - Respuesta de autenticación
- `ProfileResponse` - Perfil de usuario
- `HouseResponse` - Información de casa
- `SensorResponse` - Información de sensor
- `AddressResponse` - Dirección

## 🚀 Instalación y Setup

### Requisitos Previos
- Node.js 18+
- MongoDB local o remota
- Mosquitto MQTT (para funcionalidad de dispositivos)

### Instalación

```bash
# Clonar repositorio
git clone https://github.com/Diego-Salvana/Alarma-back-end.git
cd Alarma-back-end

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones
```

## 📝 Scripts Disponibles

```bash
# Desarrollo con nodemon
npm run dev

# Compilar TypeScript
npm run build

# Iniciar en producción
npm start
```

## 🎯 Convenciones de Código

### Async/Await
Todo código asincrónico debe usar `async/await`. No usar callbacks ni `.then()`.

### Manejo de Errores
Utilizar el error handler centralizado:
```typescript
ErrorHandler.generateResponse(response, error, message)
```

### Validación
Las peticiones se validan mediante middleware usando Zod. Controllers y services asumen que los datos ya han sido validados.

### Respuestas
Siempre retornar en formato `ApiResponse<T>`:
```typescript
{
  message: string,
  data: T
}
```

### Nomenclatura
- **Métodos de Service**: Usar nombres concisos (contexto proporcionado por la clase)
  - ✅ `UserService.create()`
  - ✅ `HouseService.update()`
  - ❌ `createUser()` - Redundante

## 🏛️ Patrones Arquitectónicos

### Separación de Responsabilidades

- **Controllers**: Manejan HTTP, delegan lógica a services
- **Services**: Encapsulan lógica de negocio, coordinan operaciones
- **DataAccess**: Interactúan exclusivamente con la base de datos
- **DTOs**: Transforman objetos de dominio a respuestas API
- **Middleware**: Validación y autenticación

### No hacer (Restricciones)

- ❌ No acceder a la base de datos fuera de clases DataAccess
- ❌ No agregar lógica de negocio en controllers
- ❌ No enviar eventos WebSocket directamente desde controllers
- ❌ No modificar contratos de DTOs sin justificación explícita

## 📚 Skills y Documentación

Consulta la carpeta `/skills` para información detallada sobre:
- `error-handling-and-validation.md` - Validación y manejo de errores
- `layered-architecture-enforcement.md` - Arquitectura en capas
- `mqtt-event-dispatcher-usage.md` - Integración MQTT
- `real-time-and-device-communication.md` - WebSockets y comunicación

## 🔧 Desarrollo

### Estructura de un Nuevo Feature

1. **Crear Route** en `src/routes/`
2. **Crear Controller** en `src/controllers/`
3. **Crear Service** en `src/services/`
4. **Crear DataAccess** en `src/database/`
5. **Crear DTO** en `src/dtos/` si es necesario
6. **Crear Validator** en `src/middleware/` si es necesario

### Flujo de Petición
```
GET /api/resource/:id
  ↓
Route Handler
  ↓
Controller.getResource(id)
  ↓
Service.get(id)
  ↓
DataAccess.findById(id)
  ↓
MongoDB
  ↓
ResourceDto.toResponse(data)
  ↓
ApiResponse { message, data }
```

## 📖 Recursos Adicionales

- [AGENT.md](./AGENT.md) - Guía completa de arquitectura y convenciones
- [Documentación de Express](https://expressjs.com/)
- [Documentación de MongoDB](https://docs.mongodb.com/)
- [Documentación de Socket.IO](https://socket.io/)
- [MQTT Specification](https://mqtt.org/)
- [Documentación de Mosquitto Broker](https://mosquitto.org/)

## 🤝 Contribución

Cuando contribuyas al proyecto:

1. Respeta la arquitectura en capas establecida
2. Sigue las convenciones de código del proyecto
3. Usa async/await en lugar de promesas
4. Valida todas las peticiones entrada con Zod
5. Retorna DTOs, nunca modelos de base de datos
6. Mantén los contratos de DTO estables

## 📄 Licencia

Este proyecto está bajo la licencia ISC.

## 👨‍💻 Autor

Diego Salvañá

---

**Versión**: 1.0.0
