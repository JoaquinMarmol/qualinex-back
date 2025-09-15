# Warranty Management Backend API

Un backend completo para un sistema de gestión de garantías construido con Node.js, Express y MongoDB. Incluye autenticación de usuarios, autorización basada en roles, operaciones CRUD completas para garantías y funcionalidades administrativas avanzadas.

## 🚀 Características

- **Autenticación Completa**: Email/password + Google OAuth 2.0
- **Autorización por Roles**: Sistema de roles `user` y `admin`
- **CRUD de Garantías**: Operaciones completas para gestión de garantías
- **Panel de Administración**: Búsqueda avanzada, filtros y estadísticas
- **Seguridad**: Helmet, CORS, rate limiting, validación de datos
- **Base de Datos**: MongoDB con Mongoose ODM
- **Documentación**: API RESTful bien documentada

## 📋 Requisitos Previos

- Node.js (v16 o superior)
- MongoDB (local o MongoDB Atlas)
- Cuenta de Google Cloud (para OAuth 2.0)

## 🛠️ Instalación

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd warranty-backend
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env
```

Editar el archivo `.env` con tus configuraciones:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/warranty_db

# JWT Secret (cambiar en producción)
JWT_SECRET=your_super_secret_jwt_key_here

# Google OAuth 2.0
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Session Secret (cambiar en producción)
SESSION_SECRET=your_session_secret_here
```

4. **Configurar Google OAuth 2.0**
   - Ir a [Google Cloud Console](https://console.cloud.google.com/)
   - Crear un nuevo proyecto o seleccionar uno existente
   - Habilitar la API de Google+
   - Crear credenciales OAuth 2.0
   - Agregar `http://localhost:5000/api/auth/google/callback` como URI de redirección

5. **Iniciar MongoDB**
```bash
# Si usas MongoDB local
mongod

# O usar MongoDB Atlas (actualizar MONGODB_URI en .env)
```

6. **Ejecutar el servidor**
```bash
# Desarrollo
npm run dev

# Producción
npm start
```

## 📚 Documentación de la API

### Base URL
```
http://localhost:5000/api
```

### Autenticación

#### Registro de Usuario
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

#### Inicio de Sesión
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123"
}
```

#### Google OAuth
```http
GET /auth/google
```

#### Obtener Perfil
```http
GET /auth/profile
Authorization: Bearer <token>
```

#### Actualizar Perfil
```http
PUT /auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Smith"
}
```

#### Cambiar Contraseña
```http
PUT /auth/change-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "oldPassword",
  "newPassword": "newPassword123"
}
```

### Garantías (Usuarios)

#### Crear Garantía
```http
POST /warranties
Authorization: Bearer <token>
Content-Type: application/json

{
  "productName": "iPhone 14",
  "productBrand": "Apple",
  "productModel": "A2649",
  "serialNumber": "ABC123456789",
  "purchaseDate": "2023-01-15",
  "purchasePrice": 999.99,
  "retailer": "Apple Store",
  "warrantyPeriod": 12,
  "warrantyType": "manufacturer",
  "issueDescription": "Screen not responding to touch",
  "issueDate": "2023-06-15",
  "category": "electronics",
  "contactEmail": "user@example.com",
  "contactPhone": "+1234567890",
  "tags": ["urgent", "display"]
}
```

#### Obtener Garantías del Usuario
```http
GET /warranties?page=1&limit=10&status=pending&category=electronics&search=iPhone
Authorization: Bearer <token>
```

#### Obtener Garantía por ID
```http
GET /warranties/:id
Authorization: Bearer <token>
```

#### Actualizar Garantía
```http
PUT /warranties/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "issueDescription": "Updated description",
  "contactPhone": "+0987654321"
}
```

#### Eliminar Garantía
```http
DELETE /warranties/:id
Authorization: Bearer <token>
```

#### Estadísticas del Usuario
```http
GET /warranties/stats
Authorization: Bearer <token>
```

### Administración (Solo Admins)

#### Obtener Todas las Garantías
```http
GET /admin/warranties?page=1&limit=20&status=pending&priority=high&search=iPhone&startDate=2023-01-01&endDate=2023-12-31
Authorization: Bearer <admin-token>
```

#### Actualizar Estado de Garantía
```http
PUT /admin/warranties/:id
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "status": "approved",
  "priority": "high",
  "adminNotes": "Approved for replacement",
  "resolution": "Device will be replaced under warranty",
  "assignedTo": "admin-user-id"
}
```

#### Asignar Garantía
```http
PUT /admin/warranties/:id/assign
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "assignedTo": "admin-user-id"
}
```

#### Obtener Garantías Asignadas
```http
GET /admin/warranties/assigned?page=1&limit=20&status=in_review
Authorization: Bearer <admin-token>
```

#### Actualización Masiva
```http
PUT /admin/warranties/bulk-update
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "warrantyIds": ["id1", "id2", "id3"],
  "updateData": {
    "status": "in_review",
    "priority": "medium"
  }
}
```

#### Estadísticas de Administración
```http
GET /admin/stats
Authorization: Bearer <admin-token>
```

#### Obtener Administradores
```http
GET /admin/users/admins
Authorization: Bearer <admin-token>
```

## 🔐 Autenticación y Autorización

### JWT Tokens
- Los tokens JWT tienen una duración de 7 días
- Los refresh tokens duran 30 días
- Incluir el token en el header: `Authorization: Bearer <token>`

### Roles
- **user**: Puede gestionar sus propias garantías
- **admin**: Acceso completo a todas las garantías y funciones administrativas

### Permisos
- Los usuarios solo pueden ver/editar sus propias garantías
- Los administradores pueden ver/editar todas las garantías
- Solo los administradores pueden cambiar estados y asignar garantías

## 📊 Modelos de Datos

### Usuario
```javascript
{
  email: String,
  password: String, // Hasheada con bcrypt
  firstName: String,
  lastName: String,
  role: 'user' | 'admin',
  googleId: String, // Para OAuth
  avatar: String,
  isActive: Boolean,
  lastLogin: Date,
  emailVerified: Boolean
}
```

### Garantía
```javascript
{
  user: ObjectId, // Referencia al usuario
  productName: String,
  productBrand: String,
  productModel: String,
  serialNumber: String,
  purchaseDate: Date,
  purchasePrice: Number,
  retailer: String,
  warrantyPeriod: Number, // en meses
  warrantyType: 'manufacturer' | 'extended' | 'retailer',
  issueDescription: String,
  issueDate: Date,
  status: 'pending' | 'in_review' | 'approved' | 'rejected' | 'completed' | 'cancelled',
  priority: 'low' | 'medium' | 'high' | 'urgent',
  assignedTo: ObjectId, // Referencia al admin
  adminNotes: String,
  resolution: String,
  category: 'electronics' | 'appliances' | 'automotive' | 'furniture' | 'clothing' | 'other',
  contactEmail: String,
  contactPhone: String,
  tags: [String]
}
```

## 🛡️ Seguridad

- **Helmet**: Configuración de headers de seguridad
- **CORS**: Configurado para permitir requests del frontend
- **Rate Limiting**: 100 requests por 15 minutos (10 para auth)
- **Validación**: express-validator para validación de datos
- **Hashing**: bcrypt para contraseñas
- **JWT**: Tokens seguros para autenticación

## 🚀 Despliegue

### Variables de Entorno de Producción
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/warranty_db
JWT_SECRET=your_production_jwt_secret
GOOGLE_CLIENT_ID=your_production_google_client_id
GOOGLE_CLIENT_SECRET=your_production_google_client_secret
FRONTEND_URL=https://your-frontend-domain.com
SESSION_SECRET=your_production_session_secret
```

### Docker (Opcional)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 📝 Scripts Disponibles

```bash
npm start          # Ejecutar en producción
npm run dev        # Ejecutar en desarrollo con nodemon
npm test           # Ejecutar tests (por implementar)
```

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia ISC.

## 🆘 Soporte

Para soporte, envía un email a support@example.com o crea un issue en GitHub.

## 🔄 Changelog

### v1.0.0
- Implementación inicial
- Autenticación completa (local + Google OAuth)
- CRUD de garantías
- Panel de administración
- Sistema de roles y permisos
- Documentación completa

