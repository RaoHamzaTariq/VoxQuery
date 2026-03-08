# 📡 VoxQuery API Documentation

> Complete API reference for VoxQuery backend endpoints and interfaces.

## 📋 Table of Contents

- [Overview](#overview)
- [Database Query API](#database-query-api)
- [Database Schema API](#database-schema-api)
- [Data Types](#data-types)
- [Error Handling](#error-handling)
- [Security](#security)
- [Rate Limiting](#rate-limiting)
- [Client Integration](#client-integration)

---

## Overview

VoxQuery provides a RESTful API for database operations. All endpoints are located under `/api/db/` and communicate using JSON.

### Base URL

```
Development:  http://localhost:3000/api/db
Production:   https://your-domain.com/api/db
```

### Authentication

API authentication is handled through connection objects passed in request bodies. Each request must include valid database credentials.

### Request Format

All requests use `POST` method with JSON body:

```json
{
  "connection": { /* DatabaseConnection object */ },
  /* Additional parameters */
}
```

### Response Format

All responses follow this structure:

**Success Response:**
```json
{
  "data": { /* Response data */ },
  "status": "success"
}
```

**Error Response:**
```json
{
  "error": "Error message",
  "details": "Additional details (in debug mode)"
}
```

---

## Database Query API

### POST `/api/db/query`

Executes a SQL query against the connected database.

#### Request

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "connection": {
    "type": "mysql" | "postgres",
    "host": "string",
    "port": number,
    "database": "string",
    "username": "string",
    "password": "string",
    "ssl": boolean,
    "isMock": boolean
  },
  "query": "string"
}
```

#### Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `connection` | `DatabaseConnection` | Yes | Database connection object |
| `connection.type` | `string` | Yes | Database type: `mysql` or `postgres` |
| `connection.host` | `string` | Yes | Database host (e.g., `localhost`) |
| `connection.port` | `number` | Yes | Database port (3306 for MySQL, 5432 for PostgreSQL) |
| `connection.database` | `string` | Yes | Database name |
| `connection.username` | `string` | Yes | Database username |
| `connection.password` | `string` | Yes | Database password |
| `connection.ssl` | `boolean` | No | Enable SSL connection (default: `false`) |
| `connection.isMock` | `boolean` | No | Use demo mode (default: `false`) |
| `query` | `string` | Yes | SQL query to execute |

#### Example Request

```json
{
  "connection": {
    "type": "mysql",
    "host": "localhost",
    "port": 3306,
    "database": "ecommerce",
    "username": "app_user",
    "password": "secure_password",
    "ssl": false,
    "isMock": false
  },
  "query": "SELECT * FROM orders LIMIT 10"
}
```

#### Response

**Success (200 OK):**
```json
{
  "rows": [
    { "id": 1, "customer_id": 101, "total_amount": 150.00, "status": "completed" },
    { "id": 2, "customer_id": 102, "total_amount": 250.00, "status": "pending" }
  ],
  "columns": ["id", "customer_id", "total_amount", "status"],
  "executionTime": 0.045,
  "sql": "SELECT * FROM orders LIMIT 10"
}
```

**Error (400 Bad Request):**
```json
{
  "error": "Query is required"
}
```

**Error (403 Forbidden):**
```json
{
  "error": "Destructive queries are not allowed through the voice interface. Please use a database client directly.",
  "blocked": true
}
```

**Error (500 Internal Server Error):**
```json
{
  "error": "Query execution failed",
  "details": "Connection timeout after 30000ms"
}
```

#### Security Validations

The API performs the following security checks:

1. **Destructive Query Blocking**
   - Blocks: `DROP`, `DELETE`, `TRUNCATE`, `UPDATE`, `INSERT`, `ALTER`, `CREATE`, `REPLACE`
   - Returns: 403 Forbidden

2. **Query Type Validation**
   - Allows: `SELECT`, `EXPLAIN`, `SHOW`, `DESCRIBE` only
   - Returns: 403 Forbidden for other types

3. **Result Limiting**
   - Auto-adds `LIMIT 1000` if not specified
   - Prevents large result sets

4. **Query Timeout**
   - 30-second timeout for all queries
   - Prevents hanging queries

#### Status Codes

| Code | Description |
|------|-------------|
| `200` | Query executed successfully |
| `400` | Bad request (missing parameters) |
| `403` | Forbidden (destructive query blocked) |
| `500` | Server error (query execution failed) |

---

## Database Schema API

### POST `/api/db/schema`

Fetches the database schema including all tables and their columns.

#### Request

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "connection": {
    "type": "mysql" | "postgres",
    "host": "string",
    "port": number,
    "database": "string",
    "username": "string",
    "password": "string",
    "ssl": boolean,
    "isMock": boolean
  }
}
```

#### Example Request

```json
{
  "connection": {
    "type": "mysql",
    "host": "localhost",
    "port": 3306,
    "database": "ecommerce",
    "username": "app_user",
    "password": "secure_password",
    "ssl": false,
    "isMock": false
  }
}
```

#### Response

**Success (200 OK):**
```json
{
  "schema": [
    {
      "tableName": "orders",
      "columns": [
        {
          "name": "id",
          "type": "int",
          "isPrimaryKey": true,
          "isForeignKey": false
        },
        {
          "name": "customer_id",
          "type": "int",
          "isPrimaryKey": false,
          "isForeignKey": true
        },
        {
          "name": "total_amount",
          "type": "decimal(10,2)",
          "isPrimaryKey": false,
          "isForeignKey": false
        },
        {
          "name": "status",
          "type": "varchar(50)",
          "isPrimaryKey": false,
          "isForeignKey": false
        },
        {
          "name": "created_at",
          "type": "datetime",
          "isPrimaryKey": false,
          "isForeignKey": false
        }
      ]
    },
    {
      "tableName": "customers",
      "columns": [
        {
          "name": "id",
          "type": "int",
          "isPrimaryKey": true,
          "isForeignKey": false
        },
        {
          "name": "name",
          "type": "varchar(100)",
          "isPrimaryKey": false,
          "isForeignKey": false
        },
        {
          "name": "region",
          "type": "varchar(50)",
          "isPrimaryKey": false,
          "isForeignKey": false
        }
      ]
    }
  ],
  "connection": {
    "type": "mysql",
    "database": "ecommerce",
    "tables": 2
  }
}
```

**Error (400 Bad Request):**
```json
{
  "error": "Failed to connect to database",
  "details": "Authentication failed for user 'app_user'"
}
```

**Error (404 Not Found):**
```json
{
  "error": "No tables found in database",
  "suggestion": "Please check if the database contains any tables"
}
```

#### Status Codes

| Code | Description |
|------|-------------|
| `200` | Schema fetched successfully |
| `400` | Connection failed |
| `404` | No tables found |
| `500` | Server error |

---

## Data Types

### DatabaseConnection

```typescript
interface DatabaseConnection {
  type: 'mysql' | 'postgres';
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl: boolean;
  isMock?: boolean;
}
```

| Field | Type | Description |
|-------|------|-------------|
| `type` | `string` | Database type |
| `host` | `string` | Database host |
| `port` | `number` | Database port |
| `database` | `string` | Database name |
| `username` | `string` | Database username |
| `password` | `string` | Database password |
| `ssl` | `boolean` | Enable SSL |
| `isMock` | `boolean` | Demo mode flag |

### TableSchema

```typescript
interface TableSchema {
  tableName: string;
  columns: ColumnSchema[];
}

interface ColumnSchema {
  name: string;
  type: string;
  isPrimaryKey: boolean;
  isForeignKey: boolean;
}
```

| Field | Type | Description |
|-------|------|-------------|
| `tableName` | `string` | Name of the table |
| `columns` | `ColumnSchema[]` | Array of column definitions |

### QueryResult

```typescript
interface QueryResult {
  rows: any[];
  columns: string[];
  executionTime: number;
  sql: string;
}
```

| Field | Type | Description |
|-------|------|-------------|
| `rows` | `any[]` | Array of row objects |
| `columns` | `string[]` | Column names |
| `executionTime` | `number` | Query execution time in seconds |
| `sql` | `string` | Executed SQL query |

---

## Error Handling

### Error Response Format

```json
{
  "error": "Human-readable error message",
  "details": "Additional technical details (debug mode only)",
  "blocked": true  // Optional: indicates if query was blocked
}
```

### Common Errors

| Error | HTTP Code | Description | Solution |
|-------|-----------|-------------|----------|
| `Database connection not configured` | 400 | Missing connection object | Include valid connection in request |
| `Query is required` | 400 | Missing query parameter | Include SQL query in request |
| `Destructive queries are not allowed` | 403 | Query contains destructive operation | Use database client directly |
| `Only SELECT queries are allowed` | 403 | Query type not allowed | Use SELECT, EXPLAIN, SHOW, or DESCRIBE |
| `Failed to connect to database` | 400 | Connection failed | Verify credentials and network |
| `Authentication failed` | 400 | Invalid credentials | Check username and password |
| `Database not found` | 400 | Database doesn't exist | Verify database name |
| `Query timed out` | 500 | Query exceeded 30s limit | Add LIMIT or optimize query |
| `Query execution failed` | 500 | SQL syntax error or other | Check query syntax |

### Error Codes Reference

```typescript
enum ErrorCodes {
  CONNECTION_REQUIRED = 400,
  QUERY_REQUIRED = 400,
  CONNECTION_FAILED = 400,
  AUTHENTICATION_FAILED = 400,
  DATABASE_NOT_FOUND = 400,
  DESTRUCTIVE_QUERY_BLOCKED = 403,
  INVALID_QUERY_TYPE = 403,
  NO_TABLES_FOUND = 404,
  QUERY_TIMEOUT = 500,
  QUERY_EXECUTION_FAILED = 500,
  INTERNAL_ERROR = 500
}
```

---

## Security

### Query Validation

All queries are validated before execution:

```typescript
// Destructive patterns blocked
const destructivePatterns = [
  /\bDROP\b/i,
  /\bDELETE\b/i,
  /\bTRUNCATE\b/i,
  /\bUPDATE\b/i,
  /\bINSERT\b/i,
  /\bALTER\b/i,
  /\bCREATE\b/i,
  /\bREPLACE\b/i,
];

// Allowed query types
const allowedQueryTypes = [
  'SELECT',
  'EXPLAIN',
  'SHOW',
  'DESCRIBE'
];
```

### Result Limiting

```typescript
// Auto-add LIMIT if not present
if (!/\bLIMIT\b/i.test(query)) {
  const cleanQuery = query.trim().replace(/;\s*$/, '');
  finalQuery = `${cleanQuery}\nLIMIT 1000`;
}
```

### Timeout Configuration

```typescript
// Query timeout in milliseconds
const QUERY_TIMEOUT_MS = 30000;  // 30 seconds
```

### Credential Protection

| Security Measure | Implementation |
|-----------------|----------------|
| **In-Memory Storage** | Passwords stored in Zustand state (memory only) |
| **No Persistence** | Passwords never saved to localStorage |
| **Environment Variables** | API keys stored in `.env.local` |
| **Git Ignore** | `.env.local` excluded from version control |

---

## Rate Limiting

### Current Implementation

VoxQuery does not implement rate limiting at the API level. Rate limiting should be configured at the deployment level:

#### Vercel

```json
// vercel.json
{
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "X-RateLimit-Limit",
          "value": "100"
        },
        {
          "key": "X-RateLimit-Remaining",
          "value": "100"
        }
      ]
    }
  ]
}
```

#### Nginx

```nginx
# Rate limiting configuration
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;

location /api/ {
    limit_req zone=api burst=20 nodelay;
    proxy_pass http://localhost:3000;
}
```

### Recommended Limits

| Endpoint | Recommended Limit |
|----------|-------------------|
| `/api/db/query` | 100 requests/minute |
| `/api/db/schema` | 10 requests/minute |

---

## Client Integration

### TypeScript/JavaScript Example

```typescript
// Execute a query
async function executeQuery(connection: DatabaseConnection, query: string) {
  const response = await fetch('/api/db/query', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ connection, query }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error);
  }

  return result;
}

// Fetch schema
async function fetchSchema(connection: DatabaseConnection) {
  const response = await fetch('/api/db/schema', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ connection }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error);
  }

  return result;
}

// Usage example
const connection = {
  type: 'mysql' as const,
  host: 'localhost',
  port: 3306,
  database: 'ecommerce',
  username: 'app_user',
  password: 'secure_password',
  ssl: false,
  isMock: false,
};

try {
  const schema = await fetchSchema(connection);
  console.log('Tables:', schema.schema.length);

  const result = await executeQuery(connection, 'SELECT * FROM orders LIMIT 10');
  console.log('Rows:', result.rows.length);
} catch (error) {
  console.error('Error:', error);
}
```

### cURL Example

```bash
# Execute a query
curl -X POST http://localhost:3000/api/db/query \
  -H "Content-Type: application/json" \
  -d '{
    "connection": {
      "type": "mysql",
      "host": "localhost",
      "port": 3306,
      "database": "ecommerce",
      "username": "app_user",
      "password": "secure_password",
      "ssl": false,
      "isMock": false
    },
    "query": "SELECT * FROM orders LIMIT 10"
  }'

# Fetch schema
curl -X POST http://localhost:3000/api/db/schema \
  -H "Content-Type: application/json" \
  -d '{
    "connection": {
      "type": "mysql",
      "host": "localhost",
      "port": 3306,
      "database": "ecommerce",
      "username": "app_user",
      "password": "secure_password",
      "ssl": false,
      "isMock": false
    }
  }'
```

### Python Example

```python
import requests

def execute_query(connection, query):
    url = "http://localhost:3000/api/db/query"
    payload = {
        "connection": connection,
        "query": query
    }
    
    response = requests.post(url, json=payload)
    result = response.json()
    
    if response.status_code != 200:
        raise Exception(result.get("error", "Query failed"))
    
    return result

def fetch_schema(connection):
    url = "http://localhost:3000/api/db/schema"
    payload = {"connection": connection}
    
    response = requests.post(url, json=payload)
    result = response.json()
    
    if response.status_code != 200:
        raise Exception(result.get("error", "Schema fetch failed"))
    
    return result

# Usage
connection = {
    "type": "mysql",
    "host": "localhost",
    "port": 3306,
    "database": "ecommerce",
    "username": "app_user",
    "password": "secure_password",
    "ssl": False,
    "isMock": False
}

try:
    schema = fetch_schema(connection)
    print(f"Tables: {len(schema['schema'])}")
    
    result = execute_query(connection, "SELECT * FROM orders LIMIT 10")
    print(f"Rows: {len(result['rows'])}")
except Exception as e:
    print(f"Error: {e}")
```

---

## Gemini Tool Integration

### run_sql_query Tool

VoxQuery uses Google Gemini's tool calling feature to execute SQL queries.

#### Tool Definition

```typescript
{
  name: 'run_sql_query',
  description: 'Executes a SQL query against the connected database and returns results.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      query: {
        type: Type.STRING,
        description: 'The SQL query to execute.',
      },
      chartType: {
        type: Type.STRING,
        description: 'Type of visualization: bar, line, pie, table, or number',
        enum: ['bar', 'line', 'pie', 'table', 'number'],
      },
      explanation: {
        type: Type.STRING,
        description: 'Brief explanation of what this query shows',
      },
    },
    required: ['query'],
  },
}
```

#### Tool Response

```typescript
{
  functionResponses: [{
    name: 'run_sql_query',
    id: 'call_123',
    response: {
      success: true,
      rows: 10,
      columns: 4,
      data: JSON.stringify(result)
    }
  }]
}
```

---

## Testing

### Unit Test Example

```typescript
import { POST } from '@/app/api/db/query/route';

describe('Query API', () => {
  it('should block destructive queries', async () => {
    const request = new Request('http://localhost:3000/api/db/query', {
      method: 'POST',
      body: JSON.stringify({
        connection: { type: 'mysql', /* ... */ },
        query: 'DELETE FROM users'
      })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.blocked).toBe(true);
  });

  it('should add LIMIT to queries without one', async () => {
    // Test implementation
  });
});
```

---

*Last Updated: March 3, 2026*
