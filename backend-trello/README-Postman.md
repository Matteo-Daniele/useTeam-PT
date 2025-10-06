# Trello API - Colección de Postman

Esta colección de Postman contiene todos los endpoints necesarios para probar la API del backend de Trello.

## 📁 Archivos Incluidos

- `Trello-API.postman_collection.json` - Colección principal con todos los endpoints
- `Trello-API.postman_environment.json` - Variables de entorno para Postman
- `README-Postman.md` - Este archivo con instrucciones

## 🚀 Cómo Usar

### 1. Importar en Postman

1. Abre Postman
2. Haz clic en "Import" (botón azul en la esquina superior izquierda)
3. Selecciona los archivos:
   - `Trello-API.postman_collection.json`
   - `Trello-API.postman_environment.json`
4. Haz clic en "Import"

### 2. Configurar el Entorno

1. En Postman, selecciona el entorno "Trello API Environment" en el dropdown superior derecho
2. Verifica que `base_url` esté configurado como `http://localhost:3000` (o tu puerto local)

### 3. Iniciar el Servidor

```bash
cd backend-trello
npm run start:dev
```

## 📋 Endpoints Disponibles

### Health Check
- `GET /` - Verificar que la API está funcionando

### Boards (Tableros)
- `POST /boards` - Crear nuevo tablero
- `GET /boards` - Obtener todos los tableros del usuario
- `GET /boards/:id` - Obtener tablero específico
- `PATCH /boards/:id` - Actualizar tablero
- `DELETE /boards/:id` - Eliminar tablero

### Columns (Columnas)
- `POST /columns` - Crear nueva columna
- `GET /columns?boardId=xxx` - Obtener columnas de un tablero
- `GET /columns/:id` - Obtener columna específica
- `PATCH /columns/:id` - Actualizar columna
- `DELETE /columns/:id` - Eliminar columna

### Cards (Tarjetas)
- `POST /cards` - Crear nueva tarjeta
- `GET /cards?boardId=xxx` - Obtener tarjetas de un tablero
- `GET /cards?columnId=xxx` - Obtener tarjetas de una columna
- `GET /cards/:id` - Obtener tarjeta específica
- `PATCH /cards/:id` - Actualizar tarjeta
- `PATCH /cards/move` - Mover tarjeta entre columnas
- `DELETE /cards/:id` - Eliminar tarjeta

## 🧪 Escenarios de Prueba

### Flujo Completo de Trabajo
La colección incluye un escenario completo que simula el flujo de trabajo típico:

1. **Crear Tablero** - Crear un nuevo proyecto
2. **Crear Columnas** - Establecer "To Do", "In Progress", etc.
3. **Crear Tarjetas** - Añadir tareas
4. **Mover Tarjetas** - Cambiar estado de las tareas
5. **Verificar Estado** - Comprobar el resultado final

### Variables Automáticas
Las variables se actualizan automáticamente durante las pruebas:
- `{{board_id}}` - ID del tablero creado
- `{{column_id}}` - ID de la columna actual
- `{{card_id}}` - ID de la tarjeta actual
- `{{target_column_id}}` - ID de la columna destino

## 📝 Ejemplos de Datos

### Crear Tablero
```json
{
  "name": "Mi Proyecto",
  "description": "Descripción del proyecto"
}
```

### Crear Columna
```json
{
  "name": "To Do",
  "boardId": "{{board_id}}"
}
```

### Crear Tarjeta
```json
{
  "title": "Implementar funcionalidad",
  "description": "Descripción detallada de la tarea",
  "boardId": "{{board_id}}",
  "columnId": "{{column_id}}"
}
```

### Mover Tarjeta
```json
{
  "cardId": "{{card_id}}",
  "toColumnId": "{{target_column_id}}",
  "boardId": "{{board_id}}",
  "newOrder": 0
}
```

## 🔧 Configuración Avanzada

### Cambiar Puerto
Si tu servidor corre en un puerto diferente:
1. Edita la variable `base_url` en el entorno
2. Cambia `http://localhost:3000` por `http://localhost:TU_PUERTO`

### Autenticación
Actualmente la API usa un usuario demo (`demo-user`). Para implementar autenticación real:
1. Añade headers de autorización a las requests
2. Configura variables para tokens de acceso

## 🐛 Solución de Problemas

### Error de Conexión
- Verifica que el servidor esté corriendo (`npm run start:dev`)
- Confirma que el puerto en `base_url` sea correcto
- Revisa que no haya firewall bloqueando la conexión

### Error 404
- Asegúrate de que las rutas estén correctas
- Verifica que los IDs en las variables sean válidos

### Error de Validación
- Revisa que los datos JSON estén bien formateados
- Confirma que los campos requeridos estén presentes

## 📊 Monitoreo

Para monitorear el rendimiento:
1. Usa la pestaña "Tests" en Postman para añadir assertions
2. Revisa los tiempos de respuesta en la consola
3. Monitorea el uso de memoria del servidor

---

¡Disfruta probando tu API de Trello! 🎉
