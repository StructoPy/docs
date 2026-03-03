# Herramientas Requeridas

Para desarrollar y ejecutar el proyecto **Structo**, es necesario instalar las siguientes herramientas en tu entorno de desarrollo. 

El proyecto está compuesto por un backend en .NET y un frontend en Nuxt.js, e interactúa con bases de datos SQL Server y MongoDB.

## Herramientas Base (Requeridas)

### 1. Node.js & npm

Requerido para el frontend (Nuxt) y para la documentación (VitePress).

- **Propósito**: Ejecutar el servidor de desarrollo de Nuxt, compilar el frontend, y gestionar las dependencias del ecosistema JavaScript.
- **Instalación**: Se recomienda instalar la versión LTS actual. Puedes descargarlo desde [nodejs.org](https://nodejs.org/) o usar un gestor de versiones como `nvm`.

### 2. .NET SDK

Requerido para el backend escrito en C#.

- **Propósito**: Compilar y ejecutar la solución `Structo.sln` y los diversos proyectos ubicados en la carpeta `backend/`.
- **Instalación**: Descarga e instala el .NET SDK desde la [página oficial de Microsoft](https://dotnet.microsoft.com/download). Verifica la versión específica requerida por los proyectos examinando `Directory.Build.props` o los archivos `.csproj`.

### 3. SQL Server

Requerido como base de datos relacional del sistema.

- **Propósito**: Almacenar la información principal de la plataforma.
- **Instalación**: Puedes instalar [SQL Server Developer Edition](https://www.microsoft.com/es-es/sql-server/sql-server-downloads) de forma local.

### 4. MongoDB

Requerido como base de datos NoSQL del sistema.

- **Propósito**: Almacenar documentos y datos no relacionales de la plataforma.
- **Instalación**: Descarga e instala [MongoDB Community Server](https://www.mongodb.com/try/download/community).

### 5. Git

Requerido para el control de versiones.

- **Propósito**: Clonar el repositorio y gestionar los cambios en el código.
- **Instalación**: Disponible en [git-scm.com](https://git-scm.com/).

---

## Herramientas Opcionales / Recomendadas

### Docker y Docker Compose (Opcional)

Si prefieres no instalar los servicios (como las bases de datos) directamente en tu equipo local, puedes levantarlos utilizando contenedores.

- **Propósito**: Levantar las dependencias de infraestructura localmente de manera aislada.
- **Instalación**: Instala [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Windows/Mac) o Docker Engine (Linux). Asegúrate de que `docker-compose` esté disponible.

### DBeaver (Recomendado)

- **Propósito**: Cliente visual universal para la gestión de bases de datos relacionales, muy útil para interactuar con SQL Server.
- **Instalación**: Disponible de forma gratuita en [dbeaver.io](https://dbeaver.io/). 

*(Alternativas: SQL Server Management Studio (SSMS) o Azure Data Studio).*

### MongoDB Compass (Recomendado)

- **Propósito**: Interfaz gráfica oficial para explorar e interactuar con tus colecciones y bases de datos en MongoDB.
- **Instalación**: Puedes descargarlo desde [mongodb.com/products/tools/compass](https://www.mongodb.com/products/tools/compass).
