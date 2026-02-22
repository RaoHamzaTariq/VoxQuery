import { NextResponse } from 'next/server';
import { getSchema, testConnection } from '@/lib/db-service';

/**
 * GET /api/db/schema
 * Fetches database schema using environment-configured database connection
 */
export async function GET() {
  try {
    console.log('📡 Schema API: Starting...');
    
    // Test connection first
    const testResult = await testConnection();
    if (!testResult.success) {
      console.error('❌ Schema API: Connection test failed:', testResult.message);
      return NextResponse.json(
        {
          error: 'Failed to connect to database',
          details: testResult.message
        },
        { status: 500 }
      );
    }

    // Get schema
    const schema = await getSchema();

    if (schema.length === 0) {
      return NextResponse.json(
        {
          error: 'No tables found in database',
          suggestion: 'Please check if the database contains any tables'
        },
        { status: 404 }
      );
    }

    console.log('✅ Schema API: Success -', schema.length, 'tables');
    return NextResponse.json({
      schema,
      connection: {
        type: 'postgres',
        database: process.env.DB_NAME || 'postgres',
        tables: schema.length,
      }
    });
  } catch (error: any) {
    console.error('❌ Schema API Error:', error);
    console.error('Stack:', error.stack);

    let errorMessage = error.message || 'Failed to fetch schema';

    if (error.message?.includes('authentication') || error.message?.includes('password')) {
      errorMessage = 'Database authentication failed. Please check your credentials.';
    } else if (error.message?.includes('database')) {
      errorMessage = 'Database not found. Please check the database name.';
    } else if (error.message?.includes('host') || error.message?.includes('ENOTFOUND')) {
      errorMessage = 'Could not connect to database host. Please check the host and port.';
    } else if (error.message?.includes('timeout')) {
      errorMessage = 'Connection timeout. Please check your network and Supabase project status.';
    } else if (error.message?.includes('SSL') || error.message?.includes('ssl')) {
      errorMessage = 'SSL connection failed. Please check SSL settings.';
    }

    return NextResponse.json(
      {
        error: errorMessage,
        details: process.env.DEBUG_MODE === 'true' ? error.stack : error.message
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/db/schema
 * Also supports POST for compatibility (ignores body, uses env vars)
 */
export async function POST() {
  return GET();
}
