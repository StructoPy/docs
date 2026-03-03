# Required Tools

To develop and run the **Structo** project, you need to install the following tools in your development environment.

The project consists of a .NET backend and a Nuxt.js frontend, and interacts with SQL Server and MongoDB databases.

## Core Tools (Required)

### 1. Node.js & npm

Required for the frontend (Nuxt) and for the documentation (VitePress).

- **Purpose**: Run the Nuxt development server, build the frontend, and manage the JavaScript ecosystem dependencies.
- **Installation**: It is recommended to install the current LTS version. You can download it from [nodejs.org](https://nodejs.org/) or use a version manager like `nvm`.

### 2. .NET SDK

Required for the C# backend.

- **Purpose**: Build and run the `Structo.sln` solution and the various projects located in the `backend/` folder.
- **Installation**: Download and install the .NET SDK from the [official Microsoft page](https://dotnet.microsoft.com/download). Verify the specific version required by the projects by examining `Directory.Build.props` or the `.csproj` files.

### 3. SQL Server

Required as the relational database of the system.

- **Purpose**: Store the main information of the platform.
- **Installation**: You can install [SQL Server Developer Edition](https://www.microsoft.com/en-us/sql-server/sql-server-downloads) locally.

### 4. MongoDB

Required as the NoSQL database of the system.

- **Purpose**: Store documents and non-relational data of the platform.
- **Installation**: Download and install [MongoDB Community Server](https://www.mongodb.com/try/download/community).

### 5. Git

Required for version control.

- **Purpose**: Clone the repository and manage code changes.
- **Installation**: Available at [git-scm.com](https://git-scm.com/).

---

## Optional / Recommended Tools

### Docker and Docker Compose (Optional)

If you prefer not to install services (like databases) directly on your local machine, you can run them using containers.

- **Purpose**: Run infrastructure dependencies locally in an isolated manner.
- **Installation**: Install [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Windows/Mac) or Docker Engine (Linux). Make sure `docker-compose` is available.

### DBeaver (Recommended)

- **Purpose**: Universal visual client for managing relational databases, very useful for interacting with SQL Server.
- **Installation**: Available for free at [dbeaver.io](https://dbeaver.io/).

*(Alternatives: SQL Server Management Studio (SSMS) or Azure Data Studio).*

### MongoDB Compass (Recommended)

- **Purpose**: Official graphical interface to explore and interact with your MongoDB collections and databases.
- **Installation**: You can download it from [mongodb.com/products/tools/compass](https://www.mongodb.com/products/tools/compass).
