import { query, getClient } from '@/lib/db';

export interface QueryResult {
  rows: any[];
  columns: string[];
  executionTime: number;
}

/**
 * Execute a raw SQL query against the database using pg driver
 */
export async function executeQuery(queryText: string): Promise<QueryResult> {
  const startTime = Date.now();

  try {
    console.log('📝 Executing query:', queryText.substring(0, 100) + (queryText.length > 100 ? '...' : ''));

    // Use pg driver for raw SQL queries
    const result = await query(queryText);

    // Extract column names from the result
    const columns = result.fields ? result.fields.map(field => field.name) : [];

    return {
      rows: result.rows,
      columns,
      executionTime: (Date.now() - startTime) / 1000,
    };
  } catch (error: any) {
    console.error('❌ Database Query Error:', error.message);
    throw new Error(error.message || 'Database query failed');
  }
}

/**
 * Get database schema using pg driver
 */
export async function getSchema() {
  try {
    console.log('📋 Fetching database schema using pg driver...');

    // Query to get all tables in public schema
    const tablesQuery = await query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);

    console.log('📊 Found tables:', tablesQuery.rows.map((t: any) => t.table_name));

    if (tablesQuery.rows.length === 0) {
      throw new Error('No tables found in database. Please create tables first.');
    }

    const schema = [];

    for (const table of tablesQuery.rows) {
      const tableName = table.table_name;

      // Get columns for this table
      const columnsQuery = await query(`
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
        ORDER BY c.ordinal_position
      `, [tableName]);

      // Get foreign keys
      const fkQuery = await query(`
        SELECT kcu.column_name
        FROM information_schema.key_column_usage kcu
        JOIN information_schema.table_constraints tc
          ON kcu.constraint_name = tc.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY'
        AND kcu.table_name = $1
      `, [tableName]);

      const foreignKeyColumns = new Set(fkQuery.rows.map((r: any) => r.column_name));

      schema.push({
        tableName,
        columns: columnsQuery.rows.map((col: any) => {
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

    console.log('✅ Schema loaded successfully:', schema.length, 'tables');
    return schema;
  } catch (error: any) {
    console.error('❌ Schema Error:', error.message);
    throw new Error(error.message || 'Failed to fetch schema');
  }
}

/**
 * Test database connection using pg driver
 */
export async function testConnection(): Promise<{ success: boolean; message: string }> {
  try {
    console.log('🔌 Testing database connection with pg driver...');

    // Run a simple query to verify connection
    await query('SELECT 1 as connected');

    console.log('✅ Database connection successful');
    return { success: true, message: 'Database connection successful' };
  } catch (error: any) {
    console.error('❌ Connection test failed:', error.message);
    return {
      success: false,
      message: error.message || 'Connection failed'
    };
  }
}