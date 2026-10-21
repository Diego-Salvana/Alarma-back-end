# Alarma IoT - Backend API

Un backend robusto y escalable para un **sistema de alarma domótico**, construido con **TypeScript**, **Express**, **MongoDB**, **PostgreSQL** y comunicación en **tiempo real** mediante **WebSockets** y **MQTT**.

## Descripción General

**Alarma-back-end** es la API central que permite a los usuarios gestionar sistemas de alarma instalados en sus casas. Integra sensores de seguridad, unidades de control central y notificaciones en tiempo real para una experiencia completa de monitoreo y control del hogar.

El sistema guarda los datos en **dos bases de datos** según el dominio:

- **MongoDB** (Mongoose): dominio de la alarma — usuarios, casas, centrales, sensores e historial de eventos.
- **PostgreSQL** (Drizzle ORM, sobre Supabase): dominio administrativo — cuentas de admin y logs de auditoría.

### Entidades Principales

- **Usuario**: Cuenta que posee y gestiona los sistemas de alarma
- **Casa**: Ubicación física donde está instalado un sistema de alarma. Cada casa contiene una unidad central y múltiples sensores
- **Central**: Unidad de control de alarma asociada a una casa; gestiona el estado, el código de seguridad, la sirena y el historial de eventos
- **Sensores**: Dispositivos de seguridad conectados a la central que detectan eventos y pueden disparar la alarma
- **Admin**: Cuentas de administración con roles `admin` / `superadmin`, encargadas de la gestión operativa del sistema y su auditoría

## Características Funcionales

### Cuentas de usuario
- Registro con **verificación por email** (token JWT de verificación)
- **Recuperación de contraseña** mediante email
- Actualización de perfil y contraseña

### Control de la alarma
- **Armado / desarmado** del sistema con exclusión opcional de sensores
- **Sirena**: disparo y apagado (limitado por el estado de armado de la alarma)
- **Luces**: encendido y apagado por sector
- Persistencia de estados y registro del **historial de eventos** (armado, desarmado, sirena y activaciones por sensor, con fecha)

### Dispositivos físicos
- Los dispositivos **reportan por MQTT** cambios de armado, disparos de sirena y estados de luces
- La API valida los mensajes, actualiza la base de datos y **notifica a los clientes conectados** por WebSockets
- Los comandos hacia los dispositivos siempre atraviesan el backend (HTTP → MQTT), nunca van directo desde el frontend

### Panel administrativo
- Login de administradores con roles `admin` / `superadmin`
- Gestión de usuarios: consulta, modificación de configuración del sistema y baja
- Gestión de casas y sensores de cada usuario (alta, modificación, baja)
- Gestión de otros admins (alta, modificación, desactivación, solo `superadmin`)
- **Auditoría**: registro de todas las mutaciones (acción, entidad, admin responsable y detalle antes/después, sin passwords) sobre PostgreSQL

### Modo demo
- Un usuario de demostración preparado para testing del frontend
- El usuario demo y las envías de email de ciertos endpoints están **bloqueados para mutaciones** (`blockDemoUser`, `blockEmailInDemo`)
- Los emails pueden **deshabilitarse completamente** por configuración (servicio no-op)
- Un **job programado con node-cron** restablece el usuario demo a su estado inicial todos los días a las 03:00 (America/Argentina/Buenos_Aires)

## Stack Tecnológico

### Runtime
- **Node.js** + **TypeScript**

### HTTP Framework
- **Express** - Framework web para endpoints REST

### Base de Datos
- **MongoDB** + **Mongoose** - Dominio de la alarma (ODM)
- **PostgreSQL** + **Drizzle ORM** - Dominio administrativo (admins y auditoría), sobre Supabase

### Validación
- **Zod** - Validación robusta de esquemas de peticiones

### Autenticación
- **JWT** (JSON Web Tokens) - Autenticación sin estado (usuarios y admins)
- **bcryptjs** - Hashing seguro de contraseñas

### Comunicación en Tiempo Real
- **Socket.IO** - Notificaciones en tiempo real a clientes frontend (server → client)
- **MQTT** - Comunicación con dispositivos físicos de alarma (broker Mosquitto / EMQX con TLS)

### Email
- **Nodemailer** - Verificación de cuenta y recuperación de contraseña

### Tareas Programadas
- **node-cron** - Job de reset diario del usuario demo

## Arquitectura

El backend sigue una **arquitectura en capas** que separa el manejo HTTP, la lógica de negocio y el acceso a datos.

### Estructura del Proyecto

```
src/
├── app/                    # Configuración de la aplicación Express e inyección de dependencias
├── controllers/            # Manejadores de peticiones HTTP
├── routes/                 # Definición de endpoints
├── services/               # Lógica de negocio principal
├── database/
│   ├── models/
│   │   ├── mongodb/        # Esquemas de MongoDB con Mongoose
│   │   └── postgres/       # Esquemas PostgreSQL con Drizzle
│   └── access/
│       ├── mongodb/        # Clases de acceso a datos de MongoDB
│       └── postgres/       # Clases de acceso a datos de PostgreSQL
├── dtos/                   # Data Transfer Objects de respuesta
├── interfaces/             # Contratos TypeScript (DTOs, dominio, MQTT, WS, JWT)
├── middlewares/            # Autenticación, validación Zod, guards de demo, errorHandler
├── mqtt/                   # Cliente Mosquitto y despachador de eventos
├── websocket/              # Servicio de WebSockets (Socket.IO)
├── jobs/                   # Tareas programadas (node-cron)
├── errors/                 # Jerarquía de errores (AppError y subclases)
├── utils/                  # Utilidades (JWT, validadores Zod, helpers de respuesta, etc.)
└── server.ts               # Punto de entrada
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

#### 4. **Dominio Administrativo**
```
Cliente → Admin Routes → AdminController → AdminService → Postgres/Services → AuditService → PostgreSQL
```

## API

La API se organiza en cinco módulos bajo el prefijo `/api-alarma/`:

| Módulo | Responsabilidad |
|---|---|
| `/api-alarma/users` | Registro, login, verificación de email, recuperación de contraseña y perfil |
| `/api-alarma/houses` | Consulta de casas, armado/desarmado, sirena y luces |
| `/api-alarma/sensors` | Consulta y renombrado de sensores |
| `/api-alarma/central` | Historial de eventos y código de seguridad de la central |
| `/api-alarma/admin` | Panel administrativo: usuarios, casas, sensores, admins y auditoría |

Los endpoints se protegen mediante **middleware de autenticación JWT** (tokens de usuario, tokens de admin con roles, y tokens de verificación de email) junto con **validación de peticiones con Zod** y guards del modo demo cuando corresponde.

Los endpoints de control de alarma son el puente entre el frontend y los dispositivos físicos: el backend responde al cliente y luego envía el comando por MQTT al dispositivo.

**Ejemplos:**

```http
POST /api-alarma/houses/arm
Authorization: Bearer <token>

{ "houseId": "...", "excludedSensors": [1, 3] }
```

```http
POST /api-alarma/admin/login

{ "email": "...", "password": "..." }
```

## Comunicación en Tiempo Real

### WebSockets (Socket.IO)
- **Conexión**: `ws(s)://<host>:<port>/api-alarma/socket` con autenticación por JWT en el handshake (`auth.token`)
- **Server → Client únicamente**: los clientes no envían comandos, solo reciben notificaciones
- Eventos de armado/desarmado, disparo de sirena, estados de luces y advertencias del dispositivo, dirigidos por usuario/a casa según el evento

### MQTT
- La API se suscribe a la base del tópico configurado y procesa los eventos de los dispositivos:
  - `armado`: estados de armado y sensores excluidos
  - `disparo`: disparo/apagado de sirena y sensor que originó el evento
  - `luces`: encendido/apagado por sector
- Los mensajes inválidos generan **advertencias** (`warning`) al usuario por WebSockets
- La API también **publica** comandos hacia los dispositivos en los mismos tópicos

### Email
- **Nodemailer** envía los emails de verificación y recuperación, con verificación inicial de conexión
- En modo demo, un **servicio no-op** reemplaza al cliente real sin afectar el flujo de la API

## Respuestas de la API

### Estructura Estándar

Todas las respuestas exitosas con cuerpo siguen la estructura `ApiResponse<T>`, construida mediante el helper `sendSuccess` (con `data: null` explícito cuando no hay payload; `DELETE` responde `204` sin cuerpo):

```json
{
  "message": "House retrieved successfully",
  "data": { "...": "..." }
}
```

Las entidades se entregan siempre como **DTOs de respuesta** (`UserDto`, `HouseDto`, `AdminDto`), nunca modelos de base de datos. El contrato público incluye, entre otros: `LoginResponse`, `ProfileResponse`, `HouseResponse`, `SensorResponse`, `AddressResponse`, `AdminResponse` y `AuditLogResponse`.

### Manejo de Errores

El `errorHandler` centralizado (último middleware de `src/app/app.ts`) genera las respuestas de error a partir de subclases de `AppError` (`NotFoundError`, `UnauthorizedError`, `ForbiddenError`, `ConflictError`, `ValidationError`, etc.):

```json
{
  "name": "NotFoundError",
  "message": "House not found",
  "statusCode": 404
}
```

## Instalación y Setup

### Requisitos Previos
- Node.js 18+
- MongoDB local o remota
- PostgreSQL (Supabase): migraciones vía Drizzle
- Broker MQTT (Mosquitto / EMQX) + certificado CA para la conexión TLS

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

### Migraciones PostgreSQL (Drizzle)

```bash
# Generar migraciones desde el esquema
npm run db:generate

# Aplicar migraciones
npm run db:migrate
```

## Scripts Disponibles

```bash
# Desarrollo con nodemon
npm run dev

# Compilar TypeScript
npm run build

# Iniciar en producción
npm start

# Compilar y correr tests
npm test

# Drizzle: generar / aplicar migraciones
npm run db:generate
npm run db:migrate
```

## Patrones Arquitectónicos

### Separación de Responsabilidades

- **Controllers**: Manejan HTTP, delegan lógica a services
- **Services**: Encapsulan lógica de negocio, coordinan acceso a datos, MQTT y WebSockets
- **DataAccess**: Interactúan exclusivamente con la base de datos
- **DTOs**: Transforman objetos de dominio a respuestas API
- **Middlewares**: Validación, autenticación y manejo centralizado de errores

### Restricciones

- ❌ No acceder a la base de datos fuera de clases DataAccess
- ❌ No agregar lógica de negocios a los controllers
- ❌ No enviar eventos WebSocket directamente desde los controllers
- ❌ No publicar eventos MQTT fuera de los services
- ❌ No modificar contratos de DTOs sin justificación explícita

## Skills y Documentación

Consulta la carpeta `.opencode/skills` para información detallada sobre:
- `error-handling-and-validation` - Validación y manejo de errores
- `layered-architecture-enforcement` - Arquitectura en capas
- `mqtt-event-dispatcher-usage` - Integración MQTT
- `real-time-and-device-communication` - WebSockets y comunicación en tiempo real

## Recursos Adicionales

- [AGENTS.md](./AGENTS.md) - Guía completa de arquitectura y convenciones
- [Documentación de Express](https://expressjs.com/)
- [Documentación de MongoDB](https://docs.mongodb.com/)
- [Documentación de Drizzle ORM](https://orm.drizzle.team/)
- [Documentación de Socket.IO](https://socket.io/)
- [MQTT Specification](https://mqtt.org/)
- [Documentación de Mosquitto Broker](https://mosquitto.org/)

## Licencia

El código fuente puede consultarse y revisarse, pero no puede reutilizarse, modificarse, redistribuirse ni utilizarse con fines comerciales sin autorización expresa del autor.

Para más información, consultá el archivo `LICENSE`.

## Autor

**Diego Salvañá**

*Desarrollador Full Stack*

---

**Versión**: 1.0.0
