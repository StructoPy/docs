# Observability: Logging and Monitoring

## 1. Observability Stack

Structo uses a modern observability stack based on:

- **Serilog**: Structured logging library for .NET
- **Loki**: Horizontally scalable log aggregation system
- **Grafana**: Visualization and monitoring platform
- **Promtail**: Agent that scrapes Docker container logs

### Log flow

```
Application (.NET) → Serilog → Console (JSON) → Promtail → Loki ← Grafana
```

## 2. How to start the observability environment

To start the observability services, run:

```bash
docker compose -f backend/docker/docker-compose.observability.yml up -d
```

### Available services

| Service | URL | Credentials |
|---------|-----|-------------|
| **Loki** | `http://localhost:3100` | N/A |
| **Grafana** | `http://localhost:3001` | admin / structo123 |

### Verify services are running

```bash
docker ps
```

You should see three containers: `structo-loki`, `structo-promtail`, and `structo-grafana`.

## 3. Serilog Configuration

Serilog configuration is located in `backend/src/Structo.WebApi/Extensions/SerilogExtension.cs`.

### Log levels

Serilog defines the following severity levels (from lowest to highest):

- **Verbose**: Detailed debugging information
- **Debug**: Debugging information
- **Information**: General informational messages
- **Warning**: Warnings about unexpected situations
- **Error**: Errors that allow execution to continue
- **Fatal**: Critical errors that cause application shutdown

### Enrichers

Enrichers add additional context to each log:

- **MachineName**: Name of the machine running the application
- **EnvironmentName**: Environment name (Development, Production)
- **Application**: Application name (Structo.WebApi)

### Environment-specific configuration

In **Development** (`isDevelopment = true`):
- Human-readable logs to console
- Direct submission to Loki for Grafana visualization
- Minimum level: `Information`

```csharp
loggerConfig
    .WriteTo.Console()
    .WriteTo.GrafanaLoki(lokiUrl, ...);
```

In **Production**:
- Structured JSON logs to console
- Output only to console (Promtail scrapes from Docker)
- Minimum level: `Information`

```csharp
loggerConfig.WriteTo.Console(new CompactJsonFormatter());
```

### Overriding third-party library levels

By default, third-party library logs are set to `Warning` level to reduce noise:

```csharp
.MinimumLevel.Override("Microsoft", LogEventLevel.Warning)
.MinimumLevel.Override("Microsoft.AspNetCore", LogEventLevel.Warning)
.MinimumLevel.Override("System", LogEventLevel.Warning)
```

## 4. Sending Logs to Loki

### GrafanaLoki sink

In development, logs are sent directly to Loki using the `Serilog.Sinks.Grafana.Loki` sink:

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

### Available labels

| Label | Description | Example |
|-------|-------------|---------|
| `service` | Service name | structo-api |
| `environment` | Execution environment | development |
| `level` | Log level | Information, Error |
| `container` | Docker container name | structo-api |
| `environment` (Promtail) | Container environment variable | production |

### In production (with Promtail)

In production, logs are output to console in JSON format. Promtail scrapes these logs from the Docker socket and sends them to Loki with additional labels extracted from JSON.

## 5. Loki Queries

### Useful queries

#### All structo-api logs
```
{service="structo-api"}
```

#### Search for specific text
```
{service="structo-api"} |= "error"
```

#### Filter by error level
```
{level="Error"}
{service="structo-api"} | json | level = "Error"
```

#### Search by correlationId
```
{service="structo-api"} |= "correlationId"
{service="structo-api"} | json | correlationId = "abc-123"
```

#### Filter by HTTP method
```
{service="structo-api"} | json | requestMethod = "POST"
```

#### Filter by status code
```
{service="structo-api"} | json | statusCode >= 500
```

### Advanced LogQL

#### Count errors per minute
```
sum(count_over_time({service="structo-api"} | json | level = "Error" [1m]))
```

#### Recent logs from last 15 minutes
```
{service="structo-api"} | json | __line__ | timestamp > now() - 15m
```

## 6. Grafana Dashboards

### Pre-configured dashboard

Structo includes a pre-configured dashboard at:
```
backend/docker/observability/grafana/provisioning/dashboards/json/structo-api.json
```

This dashboard is automatically provisioned when Grafana starts.

### Available metrics

The dashboard includes:

| Panel | Description | LogQL Query |
|-------|-------------|-------------|
| **Errors** | Error count | `sum(count_over_time({service="structo-api"} \| json \| level = "Error" [$__interval]))` |
| **Warnings** | Warning count | `sum(count_over_time({service="structo-api"} \| json \| level = "Warning" [$__interval]))` |
| **Logs by level** | Log distribution | `count_over_time({service="structo-api"} [$__interval])` |
| **Recent logs** | Recent log table | `{service="structo-api"}` |

### Structured data available

From Serilog JSON, Promtail extracts the following fields:

| Field | Description |
|-------|-------------|
| `level` | Log level |
| `message` | Log message |
| `timestamp` | RFC3339 timestamp |
| `exception` | Exception (if any) |
| `Properties.RequestPath` | Request path |
| `Properties.RequestMethod` | HTTP method |
| `Properties.StatusCode` | HTTP response status code |
| `Properties.UserEmail` | Authenticated user email |
| `Properties.CorrelationId` | Correlation ID for tracing |

## 7. Troubleshooting

### Problem: Loki not receiving logs

1. **Verify Loki is running**:
   ```bash
   curl `http://localhost:3100`/ready
   ```
   Should respond with `ready`.

2. **Verify network configuration**:
   ```bash
   docker network ls
   docker network inspect structo_observability
   ```

3. **Check Promtail logs**:
   ```bash
   docker logs structo-promtail
   ```

4. **Verify application is sending logs**:
   Look for JSON messages in the API console.

### Problem: Grafana cannot connect to Loki

1. **Verify datasource in Grafana**:
   - Go to Configuration > Data Sources
   - Verify Loki is configured with URL `http://loki:3100`

2. **Verify network between containers**:
   ```bash
   docker exec structo-grafana curl http://loki:3100/ready
   ```

3. **Check Grafana logs**:
   ```bash
   docker logs structo-grafana
   ```

### Problem: No logs appearing in Loki from production

1. **Verify Promtail is scraping the container**:
   ```bash
   docker inspect structo-api | grep -A5 Labels
   ```
   Must have the `logging=promtail` label.

2. **Verify container has the correct label**:
   In the project's `docker-compose.yml`:
   ```yaml
   services:
     structo-api:
       labels:
         - "logging=promtail"
   ```

### Verify Serilog configuration

If logs don't appear with expected fields:

1. **In development**: Verify GrafanaLoki sink is configured correctly.
2. **In production**: Verify JSON format is enabled (`CompactJsonFormatter`).

### Debugging tips

- **Use correlationId**: Add a `correlationId` to your logs to trace request flow:
  ```csharp
  Log.Information("Processing request {CorrelationId}", correlationId);
  ```
- **Filter by time**: Use Grafana's time selector to limit results.
- **Use JSON parser**: Always include `| json` in your queries to access structured fields.
