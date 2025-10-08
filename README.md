# 🚀 Kanban Board - Sistema Colaborativo en Tiempo Real

Un sistema completo de tablero Kanban con funcionalidades de colaboración en tiempo real, exportación automática de backlog y notificaciones instantáneas.

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Arquitectura](#-arquitectura)
- [Prerrequisitos](#-prerrequisitos)
- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [Uso](#-uso)
- [API](#-api)
- [Desarrollo](#-desarrollo)
- [Troubleshooting](#-troubleshooting)

## ✨ Características

### 🎯 Funcionalidades Principales
- **Tableros Kanban** - Crear, editar y gestionar múltiples tableros
- **Columnas Dinámicas** - Agregar, reordenar y eliminar columnas
- **Tarjetas Interactivas** - Crear, editar, mover y eliminar tarjetas
- **Drag & Drop** - Arrastrar y soltar columnas y tarjetas
- **Tiempo Real** - Sincronización instantánea entre usuarios
- **Notificaciones** - Alertas en tiempo real de cambios
- **Exportación** - Exportar backlog a CSV vía email

### 🔧 Tecnologías
- **Frontend**: React + TypeScript + Vite
- **Backend**: NestJS + TypeScript
- **Base de Datos**: MongoDB + Mongoose
- **Tiempo Real**: Socket.IO
- **Automatización**: N8N
- **Contenedores**: Docker + Docker Compose
- **UI**: Tailwind CSS + Radix UI

## 🏗️ Arquitectura

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   N8N           │
│   React/Vite    │◄──►│   NestJS        │◄──►│   Automatización│
│   Port: 5173    │    │   Port: 3000    │    │   Port: 5678    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │
         │              ┌─────────────────┐
         └──────────────►│   MongoDB       │
                        │   Port: 27017   │
                        └─────────────────┘
```

## 📋 Prerrequisitos

### Software Requerido
- **Docker** (v20.10+) y **Docker Compose** (v2.0+)
- **Node.js** (v18+) y **npm** (v8+)
- **Git**

### Cuentas Necesarias
- **Gmail** con verificación en 2 pasos activada (para emails automáticos)

## 🚀 Instalación

### 1. Clonar el Repositorio
```bash
git clone <repository-url>
cd trello
```

### 2. Configurar Variables de Entorno
```bash
# Copiar el archivo de ejemplo
cp env.example .env

# Editar las variables necesarias
nano .env
```

### 3. Instalar Dependencias del Frontend
```bash
cd frontend-trello
npm install
cd ..
```

### 4. Levantar Servicios con Docker
```bash
# Levantar todos los servicios
docker-compose up -d

# Verificar que todos los servicios estén corriendo
docker-compose ps
```

### 5. Verificar Instalación
- **Backend**: http://localhost:3000
- **Frontend**: http://localhost:5173
- **N8N**: http://localhost:5678
- **MongoDB**: localhost:27017

## ⚙️ Configuración

### Variables de Entorno Principales

```bash
# Base de datos
MONGODB_URI=mongodb://localhost:27017/kanban-board

# Backend
PORT=3000
FRONTEND_URL=http://localhost:5173
N8N_WEBHOOK_URL=http://n8n:5678/webhook-test/trello-backlog

# Frontend
VITE_API_URL=http://localhost:3000
VITE_WS_URL=ws://localhost:3000
```

### Configuración de N8N

#### 1. Acceder a N8N
```bash
# Abrir N8N en el navegador
open http://localhost:5678
```

#### 2. Crear Workflow de Exportación

**Paso 1: Crear Nuevo Workflow**
- Hacer clic en "New workflow"
- Nombrar: "Kanban Export"

**Paso 2: Configurar Webhook**
- Arrastrar nodo "Webhook"
- Configurar:
  - **HTTP Method**: POST
  - **Path**: `trello-backlog`
  - **Response Mode**: "On Received"
- Hacer clic en "Execute workflow" para activar

**Paso 3: Configurar Nodo Email**
- Arrastrar nodo "Email" (no Gmail)
- Configurar SMTP:
  ```
  Host: smtp.gmail.com
  Port: 465
  SSL/TLS: ✅ ACTIVADO (true)
  Client Host Name: localhost
  User: tu-email@gmail.com
  Password: [contraseña de aplicación]
  ```

**Paso 4: Configurar Contraseña de Aplicación Gmail**
1. Ir a https://myaccount.google.com/
2. **Seguridad** → **Verificación en 2 pasos** (debe estar activada)
3. **Contraseñas de aplicaciones**
4. **Generar contraseña** para "n8n"
5. Copiar la contraseña de 16 caracteres
6. Usar esta contraseña en el nodo Email

**Paso 5: Conectar Nodos**
- Webhook → Email
- Configurar el Email con los datos del webhook:
  - **To**: `{{ $json.email }}`
  - **Subject**: `Backlog Export - {{ $json.boardName }}`
  - **Text**: `Adjunto encontrará el backlog del tablero {{ $json.boardName }}`
  - **Attachments**: Configurar para generar CSV

**Paso 6: Activar Workflow**
- Hacer clic en el toggle "Active" en la esquina superior derecha
- El workflow debe estar en estado "Active"

### Configuración de MongoDB

MongoDB se configura automáticamente con Docker. Los datos se persisten en el volumen `mongo_data`.

## 🎮 Uso

### Iniciar el Sistema

```bash
# Opción 1: Todos los servicios
docker-compose up -d

# Opción 2: Solo backend y base de datos
docker-compose up mongo backend -d

# Opción 3: Solo frontend (desarrollo)
cd frontend-trello
npm run dev
```

### Funcionalidades Principales

#### 1. Gestión de Tableros
- **Crear**: Hacer clic en "New Board"
- **Editar**: Hacer clic en el ícono de lápiz
- **Eliminar**: Hacer clic en el ícono de basura
- **Seleccionar**: Usar el dropdown de tableros

#### 2. Gestión de Columnas
- **Crear**: Hacer clic en "Add Column"
- **Reordenar**: Arrastrar columnas horizontalmente
- **Editar**: Hacer clic en el ícono de lápiz
- **Eliminar**: Hacer clic en el ícono de basura

#### 3. Gestión de Tarjetas
- **Crear**: Hacer clic en "Add Card" en cualquier columna
- **Editar**: Hacer clic en el ícono de lápiz
- **Mover**: Arrastrar entre columnas o posiciones
- **Eliminar**: Hacer clic en el ícono de basura

#### 4. Exportación de Backlog
- **Exportar**: Hacer clic en el ícono de descarga (📥)
- **Configurar**: Ingresar email y seleccionar campos
- **Enviar**: El sistema enviará automáticamente el CSV por email

### Tiempo Real

El sistema incluye sincronización en tiempo real:
- **Indicador de conexión**: Círculo verde/rojo en la parte superior
- **Notificaciones**: Alertas de cambios realizados por otros usuarios
- **Sincronización automática**: Cambios se reflejan instantáneamente

## 🔌 API

### Endpoints Principales

#### Boards
```bash
GET    /boards              # Obtener todos los tableros
POST   /boards              # Crear nuevo tablero
GET    /boards/:id          # Obtener tablero específico
PATCH  /boards/:id          # Actualizar tablero
DELETE /boards/:id          # Eliminar tablero
```

#### Columns
```bash
GET    /columns?boardId=:id # Obtener columnas de un tablero
POST   /columns             # Crear nueva columna
PATCH  /columns/:id         # Actualizar columna
DELETE /columns/:id         # Eliminar columna
PATCH  /columns/reorder     # Reordenar columnas
```

#### Cards
```bash
GET    /cards?boardId=:id   # Obtener tarjetas de un tablero
POST   /cards               # Crear nueva tarjeta
PATCH  /cards/:id           # Actualizar tarjeta
DELETE /cards/:id           # Eliminar tarjeta
PATCH  /cards/move          # Mover tarjeta entre columnas
PATCH  /cards/reorder       # Reordenar tarjetas en columna
```

#### Export
```bash
POST   /export/backlog/:boardId  # Exportar backlog del tablero
```

### WebSocket Events

#### Eventos del Servidor al Cliente
```typescript
'board:created'     // Nuevo tablero creado
'board:updated'     // Tablero actualizado
'board:deleted'     // Tablero eliminado
'column:created'    // Nueva columna creada
'column:updated'    // Columna actualizada
'column:deleted'    // Columna eliminada
'columns:reordered' // Columnas reordenadas
'card:created'      // Nueva tarjeta creada
'card:updated'      // Tarjeta actualizada
'card:moved'        // Tarjeta movida
'card:deleted'      // Tarjeta eliminada
'cards:reordered'   // Tarjetas reordenadas
'export:success'    // Exportación exitosa
'export:error'      // Error en exportación
```

## 🛠️ Desarrollo

### Estructura del Proyecto

```
trello/
├── backend-trello/          # Backend NestJS
│   ├── src/
│   │   ├── boards/         # Módulo de tableros
│   │   ├── columns/        # Módulo de columnas
│   │   ├── cards/          # Módulo de tarjetas
│   │   ├── export/         # Módulo de exportación
│   │   ├── realtime/       # WebSocket Gateway
│   │   └── config/         # Configuración
│   ├── Dockerfile.dev      # Docker para desarrollo
│   └── package.json
├── frontend-trello/         # Frontend React
│   ├── src/
│   │   ├── components/     # Componentes React
│   │   ├── services/       # Servicios API
│   │   ├── hooks/          # Hooks personalizados
│   │   └── types/          # Tipos TypeScript
│   └── package.json
├── docker-compose.yml       # Orquestación de servicios
├── env.example             # Variables de entorno
└── README.md
```

### Comandos de Desarrollo

```bash
# Backend
cd backend-trello
npm run start:dev          # Desarrollo con hot reload
npm run build              # Compilar para producción
npm run test               # Ejecutar tests

# Frontend
cd frontend-trello
npm run dev                # Desarrollo con hot reload
npm run build              # Compilar para producción
npm run preview            # Preview de producción
npm run test               # Ejecutar tests

# Docker
docker-compose up -d       # Levantar todos los servicios
docker-compose down        # Detener todos los servicios
docker-compose logs -f     # Ver logs en tiempo real
docker-compose restart backend  # Reiniciar solo backend
```

### Debugging

#### Logs del Backend
```bash
docker-compose logs -f backend
```

#### Logs de N8N
```bash
docker-compose logs -f n8n
```

#### Logs de MongoDB
```bash
docker-compose logs -f mongo
```

## 🔧 Troubleshooting

### Problemas Comunes

#### 1. Puerto ya en uso
```bash
# Verificar puertos en uso
lsof -i :3000  # Backend
lsof -i :5173  # Frontend
lsof -i :5678  # N8N
lsof -i :27017 # MongoDB

# Detener servicios que usan el puerto
sudo kill -9 <PID>
```

#### 2. N8N no responde
```bash
# Verificar que N8N esté corriendo
docker-compose ps n8n

# Reiniciar N8N
docker-compose restart n8n

# Verificar logs
docker-compose logs n8n
```

#### 3. WebSocket no conecta
```bash
# Verificar configuración CORS
# En backend-trello/src/main.ts
app.enableCors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175']
});
```

#### 4. Exportación falla
```bash
# Verificar webhook en N8N
curl -X POST http://localhost:5678/webhook-test/trello-backlog \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'

# Verificar logs del backend
docker-compose logs backend | grep -i export
```

#### 5. MongoDB no conecta
```bash
# Verificar que MongoDB esté corriendo
docker-compose ps mongo

# Verificar logs
docker-compose logs mongo

# Reiniciar MongoDB
docker-compose restart mongo
```

### Limpiar Todo

```bash
# Detener y eliminar contenedores
docker-compose down

# Eliminar volúmenes (CUIDADO: elimina datos)
docker-compose down -v

# Limpiar sistema Docker
docker system prune -f
```

## 📞 Soporte

Para problemas o preguntas:
1. Revisar la sección [Troubleshooting](#-troubleshooting)
2. Verificar logs con `docker-compose logs -f`
3. Comprobar configuración de variables de entorno
4. Asegurar que todos los puertos estén disponibles

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver el archivo `LICENSE` para más detalles.

---

**¡Disfruta usando tu sistema Kanban colaborativo! 🎉**
