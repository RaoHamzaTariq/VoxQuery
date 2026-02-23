import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';

// Connection string from Supabase Dashboard → Settings → Database → Connection string
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Create connection pool
export const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false, // Required for Supabase
  },
  // Optional: connection pool settings
  max: 20, // maximum number of clients in the pool
  idleTimeoutMillis: 30000, // close idle clients after 30 seconds
  connectionTimeoutMillis: 20000, // return error after 2 seconds if connection not established
});

// Handle pool errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Helper function for queries
export async function query<T extends QueryResultRow = any>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> {
  const start = Date.now();
  const result = await pool.query(text, params);
  const duration = Date.now() - start;

  console.log('Executed query', { text: text.substring(0, 50), duration, rows: result.rowCount });

  return result;
}

// Get client from pool (for transactions)
export async function getClient(): Promise<PoolClient> {
  return await pool.connect();
}

// Graceful shutdown
export async function closePool(): Promise<void> {
  await pool.end();
}