import mysql from 'mysql2/promise';
import pg from 'pg';

const { Pool } = pg;

// Mock Data for Demo Mode
const MOCK_DATA = {
  orders: [
    { id: 1001, customer_id: 1, total_amount: 1250.00, status: 'completed', created_at: '2023-01-15' },
    { id: 1002, customer_id: 2, total_amount: 450.50, status: 'pending', created_at: '2023-01-16' },
    { id: 1003, customer_id: 1, total_amount: 2100.00, status: 'completed', created_at: '2023-02-10' },
    { id: 1004, customer_id: 3, total_amount: 89.99, status: 'cancelled', created_at: '2023-02-12' },
    { id: 1005, customer_id: 2, total_amount: 675.00, status: 'completed', created_at: '2023-03-05' },
    { id: 1006, customer_id: 4, total_amount: 3200.00, status: 'completed', created_at: '2023-03-20' },
    { id: 1007, customer_id: 1, total_amount: 150.00, status: 'completed', created_at: '2023-04-01' },
    { id: 1008, customer_id: 3, total_amount: 500.00, status: 'pending', created_at: '2023-04-15' },
    { id: 1009, customer_id: 5, total_amount: 1200.00, status: 'completed', created_at: '2023-05-10' },
    { id: 1010, customer_id: 2, total_amount: 850.00, status: 'completed', created_at: '2023-06-01' },
  ],
  customers: [
    { id: 1, name: 'Acme Corp', region: 'North America', segment: 'Enterprise' },
    { id: 2, name: 'Globex Inc', region: 'Europe', segment: 'SMB' },
    { id: 3, name: 'Soylent Corp', region: 'Asia', segment: 'Enterprise' },
    { id: 4, name: 'Initech', region: 'North America', segment: 'SMB' },
    { id: 5, name: 'Umbrella Corp', region: 'Europe', segment: 'Enterprise' },
  ],
  products: [
    { id: 1, name: 'Widget A', category: 'Hardware', price: 50.00 },
    { id: 2, name: 'Widget B', category: 'Hardware', price: 75.00 },
    { id: 3, name: 'Service X', category: 'Software', price: 100.00 },
    { id: 4, name: 'Service Y', category: 'Software', price: 200.00 },
  ]
};

export interface QueryResult {
  rows: any[];
  columns: string[];
  executionTime: number;
}

/**
 * Execute a query against the database
 */
export async function executeQuery(connectionConfig: any, query: string): Promise<QueryResult> {
  if (connectionConfig.isMock) {
    return executeMockQuery(query);
  }

  const startTime = Date.now();

  try {
    if (connectionConfig.type === 'postgres') {
      return executePostgresQuery(connectionConfig, query, startTime);
    } else {
      return executeMysqlQuery(connectionConfig, query, startTime);
    }
  } catch (error: any) {
    console.error('Database Error:', error);
    throw new Error(error.message || 'Database connection failed');
  }
}

/**
 * Execute MySQL query
 */
async function executeMysqlQuery(connectionConfig: any, query: string, startTime: number): Promise<QueryResult> {
  const connection = await mysql.createConnection({
    host: connectionConfig.host,
    user: connectionConfig.username,
    password: connectionConfig.password,
    database: connectionConfig.database,
    port: connectionConfig.port,
    ssl: connectionConfig.ssl ? { rejectUnauthorized: false } : undefined,
  });

  try {
    const [rows, fields] = await connection.execute(query);
    
    return {
      rows: rows as any[],
      columns: fields ? (fields as any[]).map((f) => f.name) : [],
      executionTime: (Date.now() - startTime) / 1000,
    };
  } finally {
    await connection.end();
  }
}

/**
 * Execute PostgreSQL query
 */
async function executePostgresQuery(connectionConfig: any, query: string, startTime: number): Promise<QueryResult> {
  const pool = new Pool({
    host: connectionConfig.host,
    user: connectionConfig.username,
    password: connectionConfig.password,
    database: connectionConfig.database,
    port: connectionConfig.port,
    ssl: connectionConfig.ssl ? { rejectUnauthorized: false } : undefined,
  });

  try {
    const result = await pool.query(query);
    
    return {
      rows: result.rows,
      columns: result.fields ? result.fields.map((f) => f.name) : [],
      executionTime: (Date.now() - startTime) / 1000,
    };
  } finally {
    await pool.end();
  }
}

/**
 * Execute mock query for demo mode
 */
async function executeMockQuery(query: string): Promise<QueryResult> {
  const lowerQuery = query.toLowerCase();
  const startTime = Date.now();

  // Simulate delay
  return new Promise<QueryResult>((resolve) => {
    setTimeout(() => {
      if (lowerQuery.includes('select') && lowerQuery.includes('orders')) {
        if (lowerQuery.includes('count')) {
          resolve({
            rows: [{ count: MOCK_DATA.orders.length }],
            columns: ['count'],
            executionTime: (Date.now() - startTime) / 1000,
          });
        }
        if (lowerQuery.includes('sum') && lowerQuery.includes('total_amount')) {
          const total = MOCK_DATA.orders.reduce((acc, order) => acc + order.total_amount, 0);
          resolve({
            rows: [{ total_revenue: total }],
            columns: ['total_revenue'],
            executionTime: (Date.now() - startTime) / 1000,
          });
        }
        if (lowerQuery.includes('group') && lowerQuery.includes('status')) {
          const grouped = MOCK_DATA.orders.reduce((acc, order) => {
            acc[order.status] = (acc[order.status] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);
          resolve({
            rows: Object.entries(grouped).map(([status, count]) => ({ status, count })),
            columns: ['status', 'count'],
            executionTime: (Date.now() - startTime) / 1000,
          });
        }
        resolve({
          rows: MOCK_DATA.orders,
          columns: Object.keys(MOCK_DATA.orders[0]),
          executionTime: (Date.now() - startTime) / 1000,
        });
      } else if (lowerQuery.includes('select') && lowerQuery.includes('customers')) {
        resolve({
          rows: MOCK_DATA.customers,
          columns: Object.keys(MOCK_DATA.customers[0]),
          executionTime: (Date.now() - startTime) / 1000,
        });
      } else if (lowerQuery.includes('select') && lowerQuery.includes('products')) {
        resolve({
          rows: MOCK_DATA.products,
          columns: Object.keys(MOCK_DATA.products[0]),
          executionTime: (Date.now() - startTime) / 1000,
        });
      } else {
        // Fallback mock response
        resolve({
          rows: MOCK_DATA.orders.slice(0, 5),
          columns: Object.keys(MOCK_DATA.orders[0]),
          executionTime: (Date.now() - startTime) / 1000,
        });
      }
    }, 300);
  });
}

/**
 * Get database schema
 */
export async function getSchema(connectionConfig: any) {
  if (connectionConfig.isMock) {
    return getMockSchema();
  }

  try {
    if (connectionConfig.type === 'postgres') {
      return getPostgresSchema(connectionConfig);
    } else {
      return getMysqlSchema(connectionConfig);
    }
  } catch (error: any) {
    console.error('Schema Error:', error);
    throw new Error(error.message || 'Failed to fetch schema');
  }
}

/**
 * Get MySQL schema
 */
async function getMysqlSchema(connectionConfig: any) {
  const connection = await mysql.createConnection({
    host: connectionConfig.host,
    user: connectionConfig.username,
    password: connectionConfig.password,
    database: connectionConfig.database,
    port: connectionConfig.port,
  });

  try {
    // Get tables
    const [tables]: any = await connection.execute('SHOW TABLES');
    const tableNames = tables.map((t: any) => Object.values(t)[0]);

    const schema = [];

    for (const tableName of tableNames) {
      const [columns]: any = await connection.execute(`DESCRIBE ${tableName}`);
      
      // Get foreign keys
      const [foreignKeys]: any = await connection.execute(`
        SELECT COLUMN_NAME 
        FROM information_schema.KEY_COLUMN_USAGE 
        WHERE TABLE_SCHEMA = ? 
        AND TABLE_NAME = ? 
        AND REFERENCED_TABLE_NAME IS NOT NULL
      `, [connectionConfig.database, tableName]);

      const foreignKeyColumns = new Set(foreignKeys.map((fk: any) => fk.COLUMN_NAME));

      schema.push({
        tableName,
        columns: columns.map((col: any) => ({
          name: col.Field,
          type: col.Type,
          isPrimaryKey: col.Key === 'PRI',
          isForeignKey: foreignKeyColumns.has(col.Field),
        }))
      });
    }

    return schema;
  } finally {
    await connection.end();
  }
}

/**
 * Get PostgreSQL schema
 */
async function getPostgresSchema(connectionConfig: any) {
  const pool = new Pool({
    host: connectionConfig.host,
    user: connectionConfig.username,
    password: connectionConfig.password,
    database: connectionConfig.database,
    port: connectionConfig.port,
  });

  try {
    // Get tables
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
    `);

    const schema = [];

    for (const table of tablesResult.rows) {
      const tableName = table.table_name;

      // Get columns
      const columnsResult = await pool.query(`
        SELECT 
          c.column_name,
          c.data_type,
          c.character_maximum_length,
          c.numeric_precision,
          c.numeric_scale,
          tc.constraint_type
        FROM information_schema.columns c
        LEFT JOIN information_schema.key_column_usage kcu 
          ON c.table_name = kcu.table_name 
          AND c.column_name = kcu.column_name
        LEFT JOIN information_schema.table_constraints tc 
          ON kcu.constraint_name = tc.constraint_name
        WHERE c.table_schema = 'public' 
        AND c.table_name = $1
      `, [tableName]);

      // Get foreign keys
      const fkResult = await pool.query(`
        SELECT kcu.column_name
        FROM information_schema.key_column_usage kcu
        JOIN information_schema.table_constraints tc 
          ON kcu.constraint_name = tc.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY'
        AND kcu.table_name = $1
      `, [tableName]);

      const foreignKeyColumns = new Set(fkResult.rows.map((r: any) => r.column_name));

      schema.push({
        tableName,
        columns: columnsResult.rows.map((col: any) => {
          let typeString = col.data_type;
          if (typeString === 'character varying' && col.character_maximum_length) {
            typeString = `varchar(${col.character_maximum_length})`;
          } else if (typeString === 'numeric' && col.numeric_precision) {
            typeString = `numeric(${col.numeric_precision},${col.numeric_scale || 0})`;
          }

          return {
            name: col.column_name,
            type: typeString,
            isPrimaryKey: col.constraint_type === 'PRIMARY KEY',
            isForeignKey: foreignKeyColumns.has(col.column_name),
          };
        })
      });
    }

    return schema;
  } finally {
    await pool.end();
  }
}

/**
 * Get mock schema for demo mode
 */
function getMockSchema() {
  return [
    {
      tableName: 'orders',
      columns: [
        { name: 'id', type: 'int', isPrimaryKey: true, isForeignKey: false },
        { name: 'customer_id', type: 'int', isPrimaryKey: false, isForeignKey: true },
        { name: 'total_amount', type: 'decimal', isPrimaryKey: false, isForeignKey: false },
        { name: 'status', type: 'varchar', isPrimaryKey: false, isForeignKey: false },
        { name: 'created_at', type: 'datetime', isPrimaryKey: false, isForeignKey: false },
      ]
    },
    {
      tableName: 'customers',
      columns: [
        { name: 'id', type: 'int', isPrimaryKey: true, isForeignKey: false },
        { name: 'name', type: 'varchar', isPrimaryKey: false, isForeignKey: false },
        { name: 'region', type: 'varchar', isPrimaryKey: false, isForeignKey: false },
        { name: 'segment', type: 'varchar', isPrimaryKey: false, isForeignKey: false },
      ]
    },
    {
      tableName: 'products',
      columns: [
        { name: 'id', type: 'int', isPrimaryKey: true, isForeignKey: false },
        { name: 'name', type: 'varchar', isPrimaryKey: false, isForeignKey: false },
        { name: 'category', type: 'varchar', isPrimaryKey: false, isForeignKey: false },
        { name: 'price', type: 'decimal', isPrimaryKey: false, isForeignKey: false },
      ]
    }
  ];
}

/**
 * Test database connection
 */
export async function testConnection(connectionConfig: any): Promise<{ success: boolean; message: string }> {
  if (connectionConfig.isMock) {
    return { success: true, message: 'Demo mode connection successful' };
  }

  try {
    if (connectionConfig.type === 'postgres') {
      const pool = new Pool({
        host: connectionConfig.host,
        user: connectionConfig.username,
        password: connectionConfig.password,
        database: connectionConfig.database,
        port: connectionConfig.port,
        ssl: connectionConfig.ssl ? { rejectUnauthorized: false } : undefined,
      });

      await pool.query('SELECT 1');
      await pool.end();
      
      return { success: true, message: 'PostgreSQL connection successful' };
    } else {
      const connection = await mysql.createConnection({
        host: connectionConfig.host,
        user: connectionConfig.username,
        password: connectionConfig.password,
        database: connectionConfig.database,
        port: connectionConfig.port,
        ssl: connectionConfig.ssl ? { rejectUnauthorized: false } : undefined,
      });

      await connection.ping();
      await connection.end();
      
      return { success: true, message: 'MySQL connection successful' };
    }
  } catch (error: any) {
    return { 
      success: false, 
      message: error.message || 'Connection failed' 
    };
  }
}
