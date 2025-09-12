# Qualinex API

API RESTful completo para la aplicación web de Qualinex. Este backend proporciona funcionalidades de autenticación de usuarios y gestión de garantías de vehículos.

## 🚀 Características

- **Autenticación JWT**: Sistema seguro de login y registro
- **Gestión de Garantías**: CRUD completo para garantías de vehículos
- **Roles de Usuario**: Sistema de permisos con roles de usuario y administrador
- **Validación de Datos**: Validación robusta en todos los endpoints
- **Seguridad**: Contraseñas hasheadas con bcrypt
- **Base de Datos**: MongoDB con Mongoose ODM
- **CORS**: Configurado para permitir peticiones del frontend

## 📋 Requisitos Previos

- Node.js (versión 14 o superior)
- MongoDB (local o remoto)
- npm o yarn

## 🛠️ Instalación

1. **Clonar o extraer el proyecto**
   ```bash
   # Si tienes el ZIP, extráelo y navega al directorio
   cd qualinex-api
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   # Copia el archivo de ejemplo
   cp .env.example .env
   
   # Edita el archivo .env con tus configuraciones
   nano .env
   ```

4. **Configurar MongoDB**
   - Asegúrate de que MongoDB esté ejecutándose
   - Actualiza la variable `MONGODB_URI` en el archivo `.env`

5. **Iniciar el servidor**
   ```bash
   # Modo desarrollo (con nodemon)
   npm run dev
   
   # Modo producción
   npm start
   ```

## ⚙️ Variables de Entorno

Configura las siguientes variables en tu archivo `.env`:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/qualinex

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here-change-this-in-production
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=5000
HOST=0.0.0.0
NODE_ENV=development

# Frontend Configuration (for CORS)
FRONTEND_URL=http://localhost:3000
```

## 📚 Endpoints de la API

### Autenticación (`/api/auth`)

#### POST `/api/auth/register`
Registra un nuevo usuario.

**Body:**
```json
{
  "fullName": "Juan Pérez",
  "email": "juan@example.com",
  "password": "password123"
}
```

**Respuesta exitosa (201):**
```json
{
  "token": "jwt-token-here",
  "user": {
    "id": "user-id",
    "fullName": "Juan Pérez",
    "email": "juan@example.com",
    "role": "user"
  }
}
```

#### POST `/api/auth/login`
Inicia sesión de un usuario existente.

**Body:**
```json
{
  "email": "admin@example.com",
  "password": "adminpassword"
}
```

**Respuesta exitosa (200):**
```json
{
  "token": "jwt-token-here",
  "user": {
    "id": "user-id",
    "fullName": "Admin User",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

### Garantías (`/api/warranties`)

#### POST `/api/warranties`
Crea una nueva garantía (requiere autenticación).

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Body:**
```json
{
  "vehicleMake": "Toyota",
  "vehicleModel": "Camry",
  "vehicleYear": "2023",
  "vehicleVIN": "1HGBH41JXMN109186",
  "installerName": "Auto Service Pro",
  "warrantyCode": "WRT-2024-001"
}
```

**Respuesta exitosa (201):**
```json
{
  "message": "Warranty activated successfully!",
  "warranty": {
    "_id": "warranty-id",
    "vehicleMake": "Toyota",
    "vehicleModel": "Camry",
    "vehicleYear": "2023",
    "vehicleVIN": "1HGBH41JXMN109186",
    "installerName": "Auto Service Pro",
    "warrantyCode": "WRT-2024-001",
    "user": {
      "_id": "user-id",
      "fullName": "Juan Pérez",
      "email": "juan@example.com"
    },
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### GET `/api/warranties`
Obtiene todas las garantías (solo administradores).

**Headers:**
```
Authorization: Bearer <admin-jwt-token>
```

**Respuesta exitosa (200):**
```json
[
  {
    "_id": "warranty-id",
    "vehicleMake": "Toyota",
    "vehicleModel": "Camry",
    "vehicleYear": "2023",
    "vehicleVIN": "1HGBH41JXMN109186",
    "installerName": "Auto Service Pro",
    "warrantyCode": "WRT-2024-001",
    "user": {
      "_id": "user-id",
      "fullName": "Juan Pérez",
      "email": "juan@example.com"
    },
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

#### GET `/api/warranties/my-warranties`
Obtiene las garantías del usuario autenticado.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

## 🏗️ Estructura del Proyecto

```
qualinex-api/
├── config/
│   └── db.js                 # Configuración de MongoDB
├── controllers/
│   ├── authController.js     # Controladores de autenticación
│   └── warrantyController.js # Controladores de garantías
├── middleware/
│   ├── authMiddleware.js     # Middleware de autenticación JWT
│   └── adminMiddleware.js    # Middleware de verificación de admin
├── models/
│   ├── User.js              # Modelo de usuario
│   └── Warranty.js          # Modelo de garantía
├── routes/
│   ├── authRoutes.js        # Rutas de autenticación
│   └── warrantyRoutes.js    # Rutas de garantías
├── .env                     # Variables de entorno
├── .env.example            # Ejemplo de variables de entorno
├── .gitignore              # Archivos ignorados por Git
├── package.json            # Dependencias y scripts
├── README.md               # Documentación
└── server.js               # Punto de entrada de la aplicación
```

## 👤 Gestión de Usuarios Administradores

Los usuarios administradores no pueden ser creados a través del API por seguridad. Para crear un administrador:

1. **Crear usuario normal** a través del endpoint `/api/auth/register`
2. **Conectar a MongoDB** directamente
3. **Actualizar el rol** del usuario:

```javascript
// En MongoDB shell o MongoDB Compass
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
```

## 🔒 Seguridad

- Las contraseñas se hashean con bcrypt antes de almacenarse
- Los tokens JWT tienen expiración configurable
- Validación robusta en todos los endpoints
- Middleware de autenticación y autorización
- CORS configurado para el frontend

## 🧪 Pruebas

Puedes probar los endpoints usando herramientas como:

- **Postman**: Importa la colección de endpoints
- **curl**: Ejemplos de comandos curl
- **Thunder Client**: Extensión de VS Code

### Ejemplo con curl:

```bash
# Registrar usuario
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Juan Pérez",
    "email": "juan@example.com",
    "password": "Password123"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "juan@example.com",
    "password": "Password123"
  }'
```

## 🚀 Despliegue

Para desplegar en producción:

1. **Configurar variables de entorno** para producción
2. **Usar una base de datos MongoDB** en la nube (MongoDB Atlas)
3. **Cambiar el JWT_SECRET** por uno más seguro
4. **Configurar HTTPS**
5. **Usar un proceso manager** como PM2

```bash
# Instalar PM2
npm install -g pm2

# Iniciar con PM2
pm2 start server.js --name "qualinex-api"

# Guardar configuración PM2
pm2 save
pm2 startup
```

## 📝 Notas Importantes

- **Cambiar JWT_SECRET**: En producción, usa un secreto más seguro
- **MongoDB**: Asegúrate de que MongoDB esté corriendo antes de iniciar el servidor
- **CORS**: Configura `FRONTEND_URL` con la URL de tu frontend
- **Validaciones**: Todos los endpoints incluyen validación de datos
- **Logs**: El servidor registra todas las peticiones HTTP

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia ISC.

## 📞 Soporte

Si tienes problemas o preguntas, por favor:

1. Revisa la documentación
2. Verifica que MongoDB esté corriendo
3. Comprueba las variables de entorno
4. Revisa los logs del servidor

---

¡Gracias por usar Qualinex API! 🚀

# qualinex-back
