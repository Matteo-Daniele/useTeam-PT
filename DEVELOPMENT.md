# 🚀 Guía de Desarrollo - Trello Clone

## 📋 Requisitos Previos

- Node.js (v18 o superior)
- MongoDB (local o en la nube)

## 🛠️ Configuración del Proyecto

### 1. **Backend (NestJS)**
```bash
cd backend-trello
npm install
npm run start:dev
```
El backend se ejecutará en: `http://localhost:3000`

### 2. **Frontend (React + Vite)**
```bash
cd frontend-trello
npm install
npm run dev
```
El frontend se ejecutará en: `http://localhost:5173`

## 🔧 Configuración de CORS

El backend está configurado para permitir peticiones desde:
- `http://localhost:5173` (Vite dev server)
- `http://localhost:3000` (Alternative frontend port)
- `http://127.0.0.1:5173` (Alternative localhost)
- `http://127.0.0.1:3000` (Alternative localhost)

## 🌐 Variables de Entorno

### Backend
Crear archivo `.env` en `backend-trello/`:
```env
DATABASE_URI=mongodb://localhost:27017/trello-clone
PORT=3000
```

### Frontend
Crear archivo `.env` en `frontend-trello/` (opcional):
```env
VITE_API_BASE_URL=http://localhost:3000
```

## 🐛 Solución de Problemas

### Error: "Unexpected token '<', "<!doctype "... is not valid JSON"
- **Causa**: El backend no está ejecutándose o hay un problema de CORS
- **Solución**: 
  1. Verificar que el backend esté ejecutándose en `http://localhost:3000`
  2. Verificar la configuración de CORS en `backend-trello/src/main.ts`

### Error: "Access to fetch at 'http://localhost:3000/boards' has been blocked by CORS policy"
- **Causa**: El backend no tiene CORS habilitado
- **Solución**: Reiniciar el backend después de la configuración de CORS

### Error: "Cannot connect to MongoDB"
- **Causa**: MongoDB no está ejecutándose
- **Solución**: 
  1. Iniciar MongoDB localmente
  2. Verificar la URI de conexión en el archivo `.env`

## 📚 Endpoints de la API

### Boards
- `GET /boards` - Obtener todos los boards
- `GET /boards/:id` - Obtener board específico
- `POST /boards` - Crear board
- `PATCH /boards/:id` - Actualizar board
- `DELETE /boards/:id` - Eliminar board

### Columns
- `GET /columns?boardId=:id` - Obtener columns de un board
- `POST /columns` - Crear column
- `PATCH /columns/:id` - Actualizar column
- `DELETE /columns/:id` - Eliminar column
- `PATCH /columns/reorder` - Reordenar columns

### Cards
- `GET /cards?boardId=:id` - Obtener cards de un board
- `GET /cards?columnId=:id` - Obtener cards de una column
- `POST /cards` - Crear card
- `PATCH /cards/:id` - Actualizar card
- `DELETE /cards/:id` - Eliminar card
- `PATCH /cards/move` - Mover card entre columns

## 🎯 Funcionalidades Implementadas

- ✅ CRUD completo para boards, columns y cards
- ✅ Drag & drop funcional
- ✅ Interfaz responsive
- ✅ Manejo de errores
- ✅ Estados de carga
- ✅ Validación de datos

## 🔄 Flujo de Desarrollo

1. **Iniciar MongoDB** (si es local)
2. **Iniciar Backend**: `cd backend-trello && npm run start:dev`
3. **Iniciar Frontend**: `cd frontend-trello && npm run dev`
4. **Abrir navegador**: `http://localhost:5173`
5. **Verificar DevTools**: Console para logs de debug

## 📝 Notas Importantes

- El backend debe ejecutarse **antes** que el frontend
- CORS está configurado para desarrollo local
- Los logs de debug están habilitados en el cliente API
- La aplicación usa drag & drop con `@dnd-kit`
