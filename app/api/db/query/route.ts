import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db-service';

/**
 * POST /api/db/query
 * Executes a SQL query using environment-configured database connection
 * Designed for non-technical university stakeholders - no SQL exposure
 */
export async function POST(req: Request) {
  try {
    const { query } = await req.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    // Security: Block destructive queries
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
          error: 'This type of query is not allowed for safety reasons.',
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
        { error: 'Only data retrieval queries are allowed' },
        { status: 403 }
      );
    }

    // Add reasonable LIMIT if not present
    let finalQuery = query;
    if (!/\bLIMIT\b/i.test(query)) {
      const cleanQuery = query.trim().replace(/;\s*$/, '');
      finalQuery = `${cleanQuery}\nLIMIT 1000`;
    }

    const result = await executeQuery(finalQuery);

    // Return only data - no SQL echo for non-technical users
    return NextResponse.json({
      rows: result.rows,
      columns: result.columns,
    });
  } catch (error: any) {
    console.error('Query API Error:', error);

    // User-friendly error messages for non-technical stakeholders
    let errorMessage = 'Unable to retrieve data. Please try rephrasing your question.';

    if (error.message?.includes('timeout')) {
      errorMessage = 'The query is taking too long. Please try a more specific question.';
    } else if (error.message?.includes('syntax') || error.message?.includes('column')) {
      errorMessage = 'Unable to find that information. Please try asking differently.';
    } else if (error.message?.includes('relation') || error.message?.includes('table')) {
      errorMessage = 'That data is not available in the system.';
    }

    return NextResponse.json(
      {
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
