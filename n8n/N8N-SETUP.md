# 🔧 Configuración de N8N para Exportación de Backlog

Esta guía te ayudará a configurar N8N para la funcionalidad de exportación automática de backlog del sistema Kanban.

## 📋 Prerrequisitos

- N8N corriendo en http://localhost:5678
- Cuenta de Gmail con verificación en 2 pasos activada
- Contraseña de aplicación de Gmail generada

## 🚀 Configuración Paso a Paso

### Paso 1: Acceder a N8N

```bash
# Abrir N8N en el navegador
open http://localhost:5678
```

### Paso 2: Crear Nuevo Workflow

1. **Hacer clic en "New workflow"**
2. **Nombrar el workflow**: "Kanban Export"
3. **Guardar el workflow**

### Paso 3: Configurar Webhook

1. **Arrastrar el nodo "Webhook"** desde el panel izquierdo
2. **Configurar el nodo**:
   - **HTTP Method**: `POST`
   - **Path**: `trello-backlog`
   - **Response Mode**: `On Received`
   - **Response Code**: `200`
3. **Hacer clic en "Execute workflow"** para activar el webhook
4. **Copiar la URL del webhook**: `http://localhost:5678/webhook-test/trello-backlog`

### Paso 4: Configurar Contraseña de Aplicación Gmail

#### 4.1 Activar Verificación en 2 Pasos
1. Ir a https://myaccount.google.com/
2. **Seguridad** → **Verificación en 2 pasos**
3. **Activar** si no está activada

#### 4.2 Generar Contraseña de Aplicación
1. En la misma página de **Seguridad**
2. **Contraseñas de aplicaciones**
3. **Seleccionar aplicación**: "Otra (nombre personalizado)"
4. **Nombre**: "n8n"
5. **Generar**
6. **Copiar la contraseña de 16 caracteres** (ej: `abcd efgh ijkl mnop`)

### Paso 5: Configurar Nodo Email

1. **Arrastrar el nodo "Email"** (NO usar Gmail)
2. **Configurar SMTP**:
   ```
   Host: smtp.gmail.com
   Port: 465
   SSL/TLS: ✅ ACTIVADO (true)
   Client Host Name: localhost
   User: tu-email@gmail.com
   Password: [contraseña de aplicación de 16 caracteres]
   ```
3. **Configurar Email**:
   - **To**: `{{ $json.email }}`
   - **Subject**: `Backlog Export - {{ $json.boardName }}`
   - **Text**: 
     ```
     Hola,
     
     Adjunto encontrará el backlog del tablero "{{ $json.boardName }}".
     
     Datos exportados:
     - Total de tarjetas: {{ $json.cards.length }}
     - Fecha de exportación: {{ new Date().toLocaleString() }}
     - ID de solicitud: {{ $json.requestId }}
     
     Saludos,
     Sistema Kanban
     ```

### Paso 6: Configurar Generación de CSV

1. **Arrastrar el nodo "Code"** antes del nodo Email
2. **Configurar el código**:
   ```javascript
   // Obtener datos del webhook
   const data = $input.first().json;
   
   // Crear encabezados CSV
   const headers = ['ID', 'Título', 'Descripción', 'Columna', 'Fecha de Creación'];
   
   // Crear filas CSV
   const rows = data.cards.map(card => [
     card.id,
     `"${card.title.replace(/"/g, '""')}"`, // Escapar comillas
     `"${card.description.replace(/"/g, '""')}"`,
     `"${card.column}"`,
     card.createdAt
   ]);
   
   // Combinar encabezados y filas
   const csvContent = [headers, ...rows]
     .map(row => row.join(','))
     .join('\n');
   
   // Crear nombre de archivo
   const fileName = `backlog_${data.boardName.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
   
   // Retornar datos para el siguiente nodo
   return {
     json: {
       ...data,
       csvContent: csvContent,
       fileName: fileName
     }
   };
   ```

### Paso 7: Configurar Adjunto en Email

1. **En el nodo Email**, ir a la pestaña "Attachments"
2. **Agregar adjunto**:
   - **File Name**: `{{ $json.fileName }}`
   - **File Content**: `{{ $json.csvContent }}`
   - **MIME Type**: `text/csv`

### Paso 8: Conectar Nodos

1. **Webhook** → **Code** → **Email**
2. **Verificar conexiones** (deben aparecer líneas azules)

### Paso 9: Activar Workflow

1. **Hacer clic en el toggle "Active"** en la esquina superior derecha
2. **El workflow debe cambiar a estado "Active"** (verde)
3. **Guardar el workflow**

## 🧪 Probar la Configuración

### Prueba Manual

```bash
# Probar webhook directamente
curl -X POST http://localhost:5678/webhook-test/trello-backlog \
  -H "Content-Type: application/json" \
  -d '{
    "boardId": "test-board",
    "boardName": "Tablero de Prueba",
    "email": "tu-email@gmail.com",
    "fields": ["id", "title", "description", "column", "createdAt"],
    "cards": [
      {
        "id": "card-1",
        "title": "Tarea de Prueba",
        "description": "Descripción de prueba",
        "column": "To Do",
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ],
    "requestId": "test-123"
  }'
```

### Prueba desde el Frontend

1. **Abrir el sistema Kanban**: http://localhost:5173
2. **Crear un tablero** con algunas tarjetas
3. **Hacer clic en el ícono de exportación** (📥)
4. **Ingresar tu email** y hacer clic en "Exportar"
5. **Verificar que llegue el email** con el CSV adjunto

## 🔍 Troubleshooting

### Problema: Webhook no responde
```bash
# Verificar que N8N esté corriendo
docker-compose ps n8n

# Verificar logs
docker-compose logs n8n

# Reiniciar N8N
docker-compose restart n8n
```

### Problema: Error de autenticación Gmail
- Verificar que la verificación en 2 pasos esté activada
- Generar nueva contraseña de aplicación
- Usar la contraseña de 16 caracteres (sin espacios)

### Problema: Email no llega
- Verificar carpeta de spam
- Comprobar que el email de destino sea correcto
- Verificar logs de N8N para errores

### Problema: CSV mal formateado
- Verificar el código del nodo Code
- Comprobar que los datos del webhook tengan el formato correcto
- Revisar caracteres especiales en títulos/descripciones

## 📊 Estructura de Datos del Webhook

El webhook recibe los siguientes datos:

```json
{
  "boardId": "string",
  "boardName": "string", 
  "email": "string",
  "fields": ["id", "title", "description", "column", "createdAt"],
  "cards": [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "column": "string",
      "createdAt": "ISO string"
    }
  ],
  "requestId": "string"
}
```

## 🎯 Configuración Avanzada

### Personalizar Email

Puedes modificar el template del email en el nodo Email:

```html
<h2>Backlog Export - {{ $json.boardName }}</h2>
<p>Hola,</p>
<p>Adjunto encontrará el backlog del tablero <strong>{{ $json.boardName }}</strong>.</p>

<h3>Resumen:</h3>
<ul>
  <li>Total de tarjetas: {{ $json.cards.length }}</li>
  <li>Fecha de exportación: {{ new Date().toLocaleString() }}</li>
  <li>ID de solicitud: {{ $json.requestId }}</li>
</ul>

<p>Saludos,<br>Sistema Kanban</p>
```

### Agregar Filtros

Puedes agregar un nodo "IF" para filtrar tarjetas:

```javascript
// En el nodo Code, agregar filtros
const filteredCards = data.cards.filter(card => 
  card.column !== 'Archivado' && 
  card.title.length > 0
);
```

### Múltiples Formatos

Puedes crear múltiples nodos Email para diferentes formatos:
- CSV para Excel
- JSON para desarrolladores
- PDF para presentaciones

---

**¡Tu sistema de exportación automática está listo! 🎉**
