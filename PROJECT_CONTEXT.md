# EMQ IoT Dashboard — Contexto Técnico del Proyecto

## Arquitectura General

```
┌─────────────┐    WebSocket     ┌─────────────────┐     MQTT      ┌──────────┐
│  Frontend    │ ◄──────────────►│  Backend (Node)  │◄────────────►│  EMQX v5 │
│  React/Vite  │  Socket.io      │  Express + TS    │  mqtt.js     │  Broker  │
│  :5173       │                 │  :3001           │  :1883       │  :18083  │
└─────────────┘                  └────────┬─────────┘              └──────────┘
                                          │ Mongoose                     ▲
                                          ▼                              │ MQTT
                                   ┌─────────────┐              ┌───────┴──────┐
                                   │  MongoDB 7   │              │  ESP32 / HW  │
                                   │  :27017      │              │  Dispositivos│
                                   └─────────────┘              └──────────────┘
```

## Stack Tecnológico

| Capa           | Tecnología                                      |
| -------------- | ----------------------------------------------- |
| Infra          | Docker Compose (EMQX 5.6.1, MongoDB 7)          |
| Backend        | Node.js, TypeScript, Express, Mongoose, MQTT.js, Socket.io |
| Frontend       | React 18, Vite 5, TypeScript, Tailwind CSS 3, Lucide-react, Socket.io-client |
| Comunicación   | MQTT (dispositivos ↔ broker), WebSockets (frontend ↔ backend) |

## Estructura de Archivos

```
emq-project/
├── docker-compose.yml
├── .env.example
├── PROJECT_CONTEXT.md
├── backend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env
│   └── src/
│       ├── index.ts              # Entry point: Express + Socket.io + MQTT bootstrap
│       ├── models/Device.ts      # Mongoose schema (Device + Widget subdoc)
│       ├── services/mqttBridge.ts # MQTT ↔ Socket.io bridge
│       └── routes/devices.ts     # REST CRUD /api/devices
└── frontend/
    ├── package.json
    ├── vite.config.ts
    ├── tailwind.config.js
    ├── index.html
    └── src/
        ├── main.tsx
        ├── App.tsx               # Router + Navbar
        ├── types.ts              # Shared TypeScript interfaces
        ├── api.ts                # fetch wrappers for /api/devices
        ├── context/SocketContext.tsx  # Socket.io provider + useSocket hook
        ├── pages/
        │   ├── Dashboard.tsx     # Grid de tarjetas de dispositivos
        │   └── DeviceForm.tsx    # Crear/editar dispositivos con widgets dinámicos
        └── components/
            ├── SwitchWidget.tsx   # Toggle ON/OFF
            ├── SliderWidget.tsx   # Range input para control de nivel
            └── LevelViewer.tsx    # Barra de progreso solo lectura
```

## Flujo de Datos

### Dispositivo → Dashboard (Telemetría)
```
ESP32 publica → {baseTopic}/out/{topicId}  (ej: home/esp32-01/out/temp)
    ↓
EMQX Broker recibe mensaje
    ↓
Backend (mqttBridge) suscrito a {baseTopic}/out/# recibe el mensaje
    ↓
Persiste lastValue en MongoDB (Device.widgets.$.lastValue)
    ↓
Emite evento Socket.io "device:data" { baseTopic, topicId, value }
    ↓
Frontend (SocketContext) actualiza lastMessages Map
    ↓
Widgets re-renderizan con el nuevo valor
```

### Dashboard → Dispositivo (Comando)
```
Usuario interactúa con SwitchWidget/SliderWidget
    ↓
Componente llama sendCommand(deviceId, topicId, value)
    ↓
Socket.io emite evento "command" { deviceId, topicId, value }
    ↓
Backend (index.ts) recibe y llama bridge.publishCommand()
    ↓
mqttBridge publica en {baseTopic}/in/{topicId}  (ej: home/esp32-01/in/led1)
    ↓
ESP32 suscrito a {baseTopic}/in/# recibe el comando
```

## Convención de Tópicos MQTT

| Dirección        | Patrón                           | Ejemplo                        |
| ---------------- | -------------------------------- | ------------------------------ |
| Dispositivo → BE | `{baseTopic}/out/{topicId}`      | `home/esp32-01/out/temp`       |
| BE → Dispositivo | `{baseTopic}/in/{topicId}`       | `home/esp32-01/in/led1`        |
| Suscripción BE   | `{baseTopic}/out/#`              | `home/esp32-01/out/#`          |

## Modelo de Datos (MongoDB)

```typescript
Device {
  name: string           // "Estación Sala"
  baseTopic: string      // "home/esp32-01" (unique)
  icon: string           // nombre de icono Lucide ("cpu", "lightbulb")
  widgets: [{
    type: "switch" | "slider" | "viewer"
    label: string        // "LED Principal"
    topicId: string      // "led1"
    lastValue: string    // "1", "75", etc.
    min?: number         // para slider/viewer
    max?: number         // para slider/viewer
  }]
  online: boolean
  createdAt, updatedAt   // timestamps automáticos
}
```

## Comandos para Levantar el Entorno

```bash
# 1. Levantar infraestructura
docker compose up -d

# 2. Instalar dependencias del backend
cd backend && npm install

# 3. Iniciar backend en modo desarrollo
npm run dev

# 4. En otra terminal — instalar dependencias del frontend
cd frontend && npm install

# 5. Iniciar frontend
npm run dev

# Accesos:
# - Frontend:       http://localhost:5173
# - API Backend:    http://localhost:3001/api/devices
# - EMQX Dashboard: http://localhost:18083  (admin / public)
```

## QUÉ FALTA IMPLEMENTAR (para el próximo agente)

### Prioridad Alta
- [ ] **Validaciones de entrada** en las rutas del backend (express-validator o zod)
- [ ] **Manejo de errores** centralizado (middleware de error en Express)
- [ ] **Detección de online/offline** de dispositivos (LWT / Last Will and Testament de MQTT)
- [ ] **Reconexión Socket.io** — el frontend reconecta pero no re-sincroniza lastValues desde la DB al reconectarse

### Prioridad Media
- [ ] **Persistencia de estados históricos** — colección `DeviceHistory` con timestamp para graficar tendencias
- [ ] **Gráficas de telemetría** — integrar Chart.js o Recharts para visualizar datos históricos
- [ ] **Autenticación** — JWT para la API y autenticación MQTT en EMQX
- [ ] **Paginación** en el GET de dispositivos
- [ ] **Confirmación de delete** con modal en el frontend

### Prioridad Baja
- [ ] **Temas claros/oscuros** — actualmente solo dark mode
- [ ] **Notificaciones toast** para feedback de acciones (crear, editar, eliminar)
- [ ] **Responsive refinement** — mejorar layout en móviles
- [ ] **Tests** — Jest + Supertest para el backend, Vitest + Testing Library para el frontend
- [ ] **CI/CD pipeline** — GitHub Actions para lint, test y build
- [ ] **Rate limiting** en la API
- [ ] **Firmware de ejemplo** para ESP8266 (Arduino/PlatformIO) que implemente la convención de tópicos
