import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db-service';

export async function POST(req: Request) {
  try {
    const { connection, query } = await req.json();

    if (!connection) {
      return NextResponse.json(
        { error: 'Database connection not configured' }, 
        { status: 400 }
      );
    }

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required' }, 
        { status: 400 }
      );
    }

    // Security: Block destructive queries unless explicitly enabled
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

    const isDestructive = destructivePatterns.some(pattern => pattern.test(query));
    
    if (isDestructive) {
      return NextResponse.json(
        { 
          error: 'Destructive queries are not allowed through the voice interface. Please use a database client directly.',
          blocked: true
        }, 
        { status: 403 }
      );
    }

    // Validate query starts with SELECT or EXPLAIN (read-only)
    const trimmedQuery = query.trim().toUpperCase();
    if (!trimmedQuery.startsWith('SELECT') && 
        !trimmedQuery.startsWith('EXPLAIN') && 
        !trimmedQuery.startsWith('SHOW') &&
        !trimmedQuery.startsWith('DESCRIBE')) {
      return NextResponse.json(
        { error: 'Only SELECT queries are allowed through the voice interface' }, 
        { status: 403 }
      );
    }

    // Add reasonable LIMIT if not present (prevent huge result sets)
    let finalQuery = query;
    if (!/\bLIMIT\b/i.test(query)) {
      // Remove trailing semicolon if present, then add LIMIT
      const cleanQuery = query.trim().replace(/;\s*$/, '');
      finalQuery = `${cleanQuery}\nLIMIT 1000`;
    }

    const result = await executeQuery(connection, finalQuery);
    
    return NextResponse.json({
      ...result,
      sql: finalQuery,
    });
  } catch (error: any) {
    console.error('Query API Error:', error);
    
    // Provide user-friendly error messages
    let errorMessage = error.message || 'Query execution failed';
    
    if (error.message?.includes('timeout')) {
      errorMessage = 'Query timed out. Try adding more specific filters or a LIMIT clause.';
    } else if (error.message?.includes('syntax')) {
      errorMessage = 'There was a syntax error in the SQL query. Please rephrase your question.';
    } else if (error.message?.includes('connection')) {
      errorMessage = 'Database connection failed. Please check your connection settings.';
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
