import { NextResponse } from 'next/server';
import { getSchema, testConnection } from '@/lib/db-service';

export async function POST(req: Request) {
  try {
    const { connection } = await req.json();

    if (!connection) {
      return NextResponse.json(
        { error: 'Connection details are required' }, 
        { status: 400 }
      );
    }

    // Test connection first
    const testResult = await testConnection(connection);
    if (!testResult.success) {
      return NextResponse.json(
        { 
          error: 'Failed to connect to database',
          details: testResult.message
        }, 
        { status: 400 }
      );
    }

    // Get schema
    const schema = await getSchema(connection);
    
    if (schema.length === 0) {
      return NextResponse.json(
        { 
          error: 'No tables found in database',
          suggestion: 'Please check if the database contains any tables'
        }, 
        { status: 404 }
      );
    }

    return NextResponse.json({
      schema,
      connection: {
        type: connection.type,
        database: connection.database,
        tables: schema.length,
      }
    });
  } catch (error: any) {
    console.error('Schema API Error:', error);
    
    let errorMessage = error.message || 'Failed to fetch schema';
    
    if (error.message?.includes('authentication')) {
      errorMessage = 'Authentication failed. Please check your username and password.';
    } else if (error.message?.includes('database')) {
      errorMessage = 'Database not found. Please check the database name.';
    } else if (error.message?.includes('host') || error.message?.includes('ECONNREFUSED')) {
      errorMessage = 'Could not connect to database host. Please check the host and port.';
    }

    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.DEBUG_MODE === 'true' ? error.stack : undefined
      }, 
      { status: 500 }
    );
  }
}
