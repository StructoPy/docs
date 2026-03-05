# Observabilidad: Logging y Monitoreo

## 1. Stack de Observabilidad

Structo utiliza un stack de observabilidad moderno basado en:

- **Serilog**: Biblioteca de logging estructurado para .NET
- **Loki**: Sistema de agregación de logs horizontally scalable
- **Grafana**: Plataforma de visualización y monitoreo
- **Promtail**: Agente que recoleta logs de contenedores Docker

### Flujo de logs

```
Aplicación (.NET) → Serilog → Consola (JSON) → Promtail → Loki ← Grafana
```

## 2. Cómo levantar el entorno de observabilidad

Para iniciar los servicios de observabilidad, ejecuta:

```bash
docker compose -f backend/docker/docker-compose.observability.yml up -d
```

### Servicios disponibles

| Servicio | URL | Credenciales |
|----------|-----|---------------|
| **Loki** | `http://localhost:3100` | N/A |
| **Grafana** | `http://localhost:3001` | admin / structo123 |

### Verificar que los servicios están corriendo

```bash
docker ps
```

Deberías ver tres contenedores: `structo-loki`, `structo-promtail` y `structo-grafana`.

## 3. Configuración de Serilog

La configuración de Serilog se encuentra en `backend/src/Structo.WebApi/Extensions/SerilogExtension.cs`.

### Niveles de logging

Serilog define los siguientes niveles de severidad (de menor a mayor):

- **Verbose**: Información detallada de debugging
- **Debug**: Información de debugging
- **Information**: Mensajes informativos generales
- **Warning**: Advertencias sobre situaciones inesperadas
- **Error**: Errores que permiten continuar la ejecución
- **Fatal**: Errores críticos que causan el cierre de la aplicación

### Enrichers

Los enrichers agregan contexto adicional a cada log:

- **MachineName**: Nombre de la máquina donde corre la aplicación
- **EnvironmentName**: Nombre del ambiente (Development, Production)
- **Application**: Nombre de la aplicación (Structo.WebApi)

### Configuración por ambiente

En **Desarrollo** (`isDevelopment = true`):
- Logs formateados para lectura humana en consola
- Envío directo a Loki para visualización en Grafana
- Nivel mínimo: `Information`

```csharp
loggerConfig
    .WriteTo.Console()
    .WriteTo.GrafanaLoki(lokiUrl, ...);
```

En **Producción**:
- Logs en formato JSON estructurado
- Salida solo a consola (Promtail recoleta desde Docker)
- Nivel mínimo: `Information`

```csharp
loggerConfig.WriteTo.Console(new CompactJsonFormatter());
```

### Sobrescribir niveles de terceros

Por defecto, los logs de librerías externas se configuran en nivel `Warning` para reducir ruido:

```csharp
.MinimumLevel.Override("Microsoft", LogEventLevel.Warning)
.MinimumLevel.Override("Microsoft.AspNetCore", LogEventLevel.Warning)
.MinimumLevel.Override("System", LogEventLevel.Warning)
```

## 4. Envío de logs a Loki

### Sink de GrafanaLoki

En desarrollo, los logs se envían directamente a Loki usando el sink `Serilog.Sinks.Grafana.Loki`:

```csharp
.WriteTo.GrafanaLoki(
    lokiUrl,  // `http://localhost:3100`
    labels: new List<LokiLabel>
    {
        new() { Key = "service", Value = "structo-api" },
        new() { Key = "environment", Value = "development" }
    },
    propertiesAsLabels: new[] { "level" }
)
```

### Labels disponibles

| Label | Descripción | Ejemplo |
|-------|-------------|---------|
| `service` | Nombre del servicio | structo-api |
| `environment` | Ambiente de ejecución | development |
| `level` | Nivel de log | Information, Error |
| `container` | Nombre del contenedor Docker | structo-api |
| `environment` (Promtail) | Variable de entorno del contenedor | production |

### En producción (con Promtail)

En producción, los logs salen a la consola en formato JSON. Promtail recoleta estos logs desde el socket de Docker y los envía a Loki con labels adicionales extraídos del JSON.

## 5. Consultas en Loki

### Queries útiles

#### Todos los logs de structo-api
```
{service="structo-api"}
```

#### Buscar texto específico
```
{service="structo-api"} |= "error"
```

#### Filtrar por nivel de error
```
{level="Error"}
{service="structo-api"} | json | level = "Error"
```

#### Buscar por correlationId
```
{service="structo-api"} |= "correlationId"
{service="structo-api"} | json | correlationId = "abc-123"
```

#### Filtrar por método HTTP
```
{service="structo-api"} | json | requestMethod = "POST"
```

#### Filtrar por código de estado
```
{service="structo-api"} | json | statusCode >= 500
```

### LogQL avanzado

#### Contar errores por minuto
```
sum(count_over_time({service="structo-api"} | json | level = "Error" [1m]))
```

#### Logs de los últimos 15 minutos
```
{service="structo-api"} | json | __line__ | timestamp > now() - 15m
```

## 6. Dashboards de Grafana

### Dashboard pre-configurado

Structo incluye un dashboard pre-configurado en:
```
backend/docker/observability/grafana/provisioning/dashboards/json/structo-api.json
```

Este dashboard se provisiona automáticamente al iniciar Grafana.

### Métricas disponibles

El dashboard incluye:

| Panel | Descripción | Query LogQL |
|-------|-------------|-------------|
| **Errors** | Conteo de errores | `sum(count_over_time({service="structo-api"} \| json \| level = "Error" [$__interval]))` |
| **Warnings** | Conteo de advertencias | `sum(count_over_time({service="structo-api"} \| json \| level = "Warning" [$__interval]))` |
| **Logs por nivel** | Distribución de logs | `count_over_time({service="structo-api"} [$__interval])` |
| **Logs recientes** | Tabla de últimos logs | `{service="structo-api"}` |

### Datos estructurados disponibles

Desde el JSON de Serilog, Promtail extrae los siguientes campos:

| Campo | Descripción |
|-------|-------------|
| `level` | Nivel de log |
| `message` | Mensaje del log |
| `timestamp` | Timestamp RFC3339 |
| `exception` | Excepción (si existe) |
| `Properties.RequestPath` | Ruta de la petición |
| `Properties.RequestMethod` | Método HTTP |
| `Properties.StatusCode` | Código de respuesta HTTP |
| `Properties.UserEmail` | Email del usuario autenticado |
| `Properties.CorrelationId` | ID de correlación para tracing |

## 7. Troubleshooting

### Problema: Loki no recibe logs

1. **Verificar que Loki está corriendo**:
   ```bash
   curl `http://localhost:3100`/ready
   ```
   Debe responder con `ready`.

2. **Verificar configuración de red**:
   ```bash
   docker network ls
   docker network inspect structo_observability
   ```

3. **Revisar logs de Promtail**:
   ```bash
   docker logs structo-promtail
   ```

4. **Verificar que la aplicación está enviando logs**:
   Busca en la consola de la API los mensajes JSON.

### Problema: Grafana no conecta a Loki

1. **Verificar datasource en Grafana**:
   - Ir a Configuration > Data Sources
   - Verificar que Loki está configurado con URL `http://loki:3100`

2. **Verificar red entre contenedores**:
   ```bash
   docker exec structo-grafana curl http://loki:3100/ready
   ```

3. **Revisar logs de Grafana**:
   ```bash
   docker logs structo-grafana
   ```

### Problema: No aparecen logs en Loki desde producción

1. **Verificar que Promtail está scrapeando el contenedor**:
   ```bash
   docker inspect structo-api | grep -A5 Labels
   ```
   Debe tener el label `logging=promtail`.

2. **Verificar que el contenedor tiene el label correcto**:
   En `docker-compose.yml` del proyecto:
   ```yaml
   services:
     structo-api:
       labels:
         - "logging=promtail"
   ```

### Verificar configuración de Serilog

Si los logs no aparecen con los campos esperados:

1. **En desarrollo**: Revisar que el sink de GrafanaLoki está configurado correctamente.
2. **En producción**: Verificar que el formato JSON está habilitado (`CompactJsonFormatter`).

### Tips de debugging

- **Usa correlationId**: Agrega un `correlationId` a tus logs para seguir el flujo de una request:
  ```csharp
  Log.Information("Processing request {CorrelationId}", correlationId);
  ```
- **Filtra por tiempo**: Usa el selector de tiempo de Grafana para limitar resultados.
- **Usa JSON parser**: Siempre incluye `| json` en tus queries para acceder a campos estructurados.
