# SolPed - Sistema de Solicitud de Pedidos

Sistema web full-stack para gestión de solicitudes de pedido interno en taller/empresa, diseñado para agilizar el proceso de compras y evitar errores administrativos.

## Características Principales

### Flujo del Proceso

1. **Taller/Operarios (Pedidor)** crean y envían solicitudes de pedido
2. **Administración/Compras** recibe directamente (sin autorización previa) y:
   - Revisa lo pedido
   - Busca proveedores
   - Carga precios y cotizaciones
   - Genera Orden de Compra (OC)
3. **Validador de Compras** aprueba o rechaza precios
4. **Administración** procede con la compra si es aprobada

### Roles de Usuario (RBAC)

#### Pedidor (Taller/Operario)
- Crea y edita SolPeds en borrador
- Envía solicitudes a administración
- Ve sus propias solicitudes y estados
- Puede comentar en sus solicitudes

#### Administración/Compras
- Recibe y gestiona solicitudes
- Cotiza: busca proveedor, precios, condiciones
- Envía a validación cuando cotización está lista
- Genera OC y marca compra/recepción
- Exporta e imprime

#### Validador de Compras
- Ve solicitudes pendientes de validación
- Aprueba o rechaza según precio/condiciones
- Debe dejar motivo si rechaza
- No edita ítems, solo valida

#### Admin del Sistema
- Gestiona usuarios, roles
- Administra áreas, unidades, parámetros

### Estados del Workflow

1. **Borrador** - Pedidor editando
2. **Enviada a Administración** - Esperando revisión
3. **En Revisión/Cotizando** - Admin buscando precios
4. **Pendiente de Validación de Precio** - Esperando validador
5. **Rechazada por Validación** - Vuelve a admin para recotizar
6. **Aprobada para Comprar** - Validación aprobada
7. **Orden de Compra Generada** - OC creada
8. **Comprada** - Compra realizada
9. **Recibida/Entregada** - Proceso completo
10. **Cancelada** - Cancelada en cualquier momento

## Stack Tecnológico

### Backend
- **Node.js + Express** - Servidor y API REST
- **Prisma ORM** - Gestión de base de datos
- **SQLite** - Base de datos
- **JWT** - Autenticación
- **bcrypt** - Hash de contraseñas
- **Multer** - Manejo de archivos adjuntos

### Frontend
- **React** - Framework UI
- **Vite** - Build tool
- **Tailwind CSS** - Estilos
- **React Router** - Navegación
- **Axios** - Cliente HTTP

## Estructura del Proyecto

```
Claude-Prueba/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # Esquema de base de datos
│   │   └── seed.js                # Datos iniciales
│   ├── src/
│   │   ├── controllers/           # Lógica de negocio
│   │   ├── middleware/            # Auth y validaciones
│   │   ├── routes/                # Rutas de API
│   │   ├── utils/                 # Utilidades
│   │   └── server.js              # Servidor principal
│   ├── uploads/                   # Archivos adjuntos
│   ├── .env                       # Variables de entorno
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/            # Componentes reutilizables
│   │   ├── context/               # Context API (Auth)
│   │   ├── pages/                 # Páginas/vistas
│   │   ├── services/              # API client
│   │   └── App.jsx                # Componente raíz
│   ├── .env                       # Variables de entorno
│   └── package.json
│
└── README.md
```

## Instalación y Configuración

### Requisitos Previos

- **Node.js** >= 18.x
- **npm** >= 9.x

### 1. Clonar el Repositorio

```bash
git clone <url-del-repositorio>
cd Claude-Prueba
```

### 2. Configurar Backend

```bash
# Ir a la carpeta backend
cd backend

# Instalar dependencias
npm install

# Configurar variables de entorno
# El archivo .env ya está creado con valores por defecto
# DATABASE_URL="file:./dev.db"
# JWT_SECRET="tu-secreto-super-seguro-cambialo-en-produccion"
# PORT=3000
# NODE_ENV=development

# Generar cliente Prisma y ejecutar migraciones
npx prisma generate
npx prisma migrate dev --name init

# Poblar base de datos con datos iniciales
node prisma/seed.js

# Iniciar servidor de desarrollo
npm run dev
```

El backend estará corriendo en `http://localhost:3000`

### 3. Configurar Frontend

```bash
# Desde la raíz del proyecto, ir a frontend
cd ../frontend

# Instalar dependencias
npm install

# Configurar variables de entorno
# El archivo .env ya está creado:
# VITE_API_URL=http://localhost:3000/api

# Iniciar servidor de desarrollo
npm run dev
```

El frontend estará corriendo en `http://localhost:5173`

## Usuarios de Prueba

El seed crea los siguientes usuarios de prueba (todos con contraseña `pass123`):

| Usuario | Contraseña | Rol | Descripción |
|---------|------------|-----|-------------|
| `pedidor1` | `pass123` | Pedidor | Usuario de taller/operario |
| `admincompras1` | `pass123` | Administración | Usuario de compras |
| `validador1` | `pass123` | Validador | Validador de precios |
| `admin1` | `pass123` | Admin | Administrador del sistema |

## Datos Iniciales

El seed también crea:

### Áreas
- Taller Mecánico
- Taller Eléctrico
- Almacén
- Producción

### Unidades
- Unidad (un)
- Metro (m)
- Kilogramo (kg)
- Litro (L)
- Caja, Paquete, Juego, Par, Lata, Rollo

### SolPed de Ejemplo
- **ID**: SP-2025-000001
- **Estado**: BORRADOR
- **Prioridad**: ALTA
- **Items**: 3 ítems de ejemplo (rodamientos, tornillos, aceite)

## API Endpoints

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/me` - Obtener usuario actual

### SolPeds
- `GET /api/solpeds` - Listar solicitudes
- `GET /api/solpeds/:id` - Obtener detalle
- `POST /api/solpeds` - Crear solicitud
- `PUT /api/solpeds/:id` - Actualizar solicitud
- `PUT /api/solpeds/:id/status` - Cambiar estado
- `PUT /api/solpeds/:id/items` - Actualizar items
- `DELETE /api/solpeds/:id` - Eliminar solicitud
- `GET /api/solpeds/statistics` - Estadísticas

### Comentarios
- `POST /api/comments` - Crear comentario
- `GET /api/comments/solped/:solPedId` - Listar por SolPed

### Todos/Tareas
- `POST /api/todos` - Crear tarea
- `PUT /api/todos/:id` - Actualizar tarea
- `DELETE /api/todos/:id` - Eliminar tarea

### Notificaciones
- `GET /api/notifications` - Listar notificaciones
- `GET /api/notifications/count` - Contador no leídas
- `PUT /api/notifications/:id/read` - Marcar como leída
- `PUT /api/notifications/read-all` - Marcar todas

### Configuración
- `GET /api/config/areas` - Listar áreas
- `GET /api/config/units` - Listar unidades

### Usuarios (Admin)
- `GET /api/users` - Listar usuarios
- `POST /api/users` - Crear usuario
- `PUT /api/users/:id` - Actualizar usuario
- `DELETE /api/users/:id` - Eliminar usuario

### Archivos Adjuntos
- `POST /api/attachments` - Subir archivo
- `DELETE /api/attachments/:id` - Eliminar archivo

## Flujo de Uso End-to-End

### 1. Login
- Acceder a `http://localhost:5173`
- Iniciar sesión con cualquier usuario de prueba

### 2. Crear SolPed (Como Pedidor)
- Login con `pedidor1 / pass123`
- Click en "Nueva SolPed"
- Completar formulario:
  - Seleccionar área
  - Prioridad
  - Fecha necesaria
  - OT/Referencia
  - Justificación
  - Agregar ítems (cantidad, unidad, nombre, especificación)
- Guardar como borrador o enviar directamente

### 3. Cotizar (Como Administración)
- Login con `admincompras1 / pass123`
- Ver solicitudes nuevas
- Abrir detalle de SolPed
- Agregar:
  - Proveedor
  - Condiciones
  - Precios (total o por ítem)
  - Fecha de cotización
- Enviar a validación de precio

### 4. Validar (Como Validador)
- Login con `validador1 / pass123`
- Ver solicitudes pendientes de validación
- Revisar precio y condiciones
- Aprobar o rechazar (con motivo si rechaza)

### 5. Generar OC y Completar (Como Administración)
- Si aprobada:
  - Generar número de OC
  - Marcar como comprada
  - Actualizar fecha de recepción estimada
  - Finalmente marcar como recibida/entregada

## Características Implementadas

### ✅ Backend Completo
- Sistema de autenticación JWT
- CRUD completo de SolPeds
- Gestión de estados con validaciones
- Sistema de comentarios
- Sistema de tareas/pendientes
- Notificaciones in-app
- Historial de cambios y auditoría
- Gestión de usuarios (Admin)
- Manejo de archivos adjuntos
- Áreas y unidades configurables
- Generación automática de IDs (SP-YYYY-NNNNNN)

### ✅ Frontend Base
- Autenticación con Context API
- Dashboard con estadísticas
- Login responsive
- Layout con navegación
- Servicios de API configurados
- Protección de rutas

### 📝 Pendiente de Implementación en Frontend
Por el alcance del proyecto, las siguientes funcionalidades están implementadas en el backend pero pendientes en frontend:

- Formulario completo de crear/editar SolPed
- Bandeja de "Mis Solicitudes" con filtros
- Bandeja de Administración categorizada
- Bandeja de Validador
- Detalle completo de SolPed con:
  - Items editables
  - Comentarios tipo chat
  - Pendientes/tareas
  - Historial de cambios
  - Archivos adjuntos
- Panel de notificaciones
- Panel de administración de usuarios

## Scripts Disponibles

### Backend
```bash
npm run dev          # Servidor con auto-reload
npm start            # Servidor en producción
npm run prisma:generate    # Generar cliente Prisma
npm run prisma:migrate     # Ejecutar migraciones
npm run prisma:seed        # Poblar base de datos
npm run prisma:studio      # Abrir Prisma Studio
```

### Frontend
```bash
npm run dev      # Servidor de desarrollo
npm run build    # Build para producción
npm run preview  # Preview del build
```

## Base de Datos

### Modelos Principales

- **User** - Usuarios del sistema
- **Area** - Áreas de trabajo configurables
- **Unit** - Unidades de medida
- **SolPed** - Solicitud de pedido principal
- **SolPedItem** - Items de la solicitud
- **Comment** - Comentarios en solicitudes
- **Todo** - Tareas/pendientes
- **History** - Historial de cambios
- **Notification** - Notificaciones
- **Attachment** - Archivos adjuntos

### Explorar Base de Datos

```bash
cd backend
npx prisma studio
```

Esto abre una interfaz web en `http://localhost:5555` para explorar y editar datos.

## Producción

### Backend

1. Configurar variables de entorno de producción
2. Usar PostgreSQL o MySQL en lugar de SQLite
3. Configurar JWT_SECRET fuerte
4. Habilitar HTTPS
5. Configurar CORS apropiadamente

### Frontend

1. Configurar VITE_API_URL con la URL del backend de producción
2. Build: `npm run build`
3. Servir carpeta `dist/` con servidor web (nginx, Apache, etc.)

## Soporte y Contacto

Para preguntas o problemas:
- Revisar la documentación del código
- Verificar logs del servidor
- Consultar Prisma Studio para debug de BD

## Licencia

MIT

---

**Desarrollado para gestión eficiente de solicitudes de pedido interno**
