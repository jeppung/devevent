import { connectToMongoDB } from "./mongodb";

/**
 * Database utility wrapper that ensures connection before database operations
 * Use this wrapper for all database operations to ensure connection is established
 *
 * @param operation - Async function that performs database operations
 * @returns Promise<T> - Returns the result of the database operation
 */
export async function withDatabase<T>(operation: () => Promise<T>): Promise<T> {
  try {
    // Ensure connection is established before operation
    await connectToMongoDB();

    // Execute the database operation
    return await operation();
  } catch (error) {
    console.error("Database operation failed:", error);
    throw error;
  }
}

/**
 * Example usage of the database connection in an API route:
 *
 * import { withDatabase } from '@/lib/db-utils';
 * import { EventModel } from '@/models/Event';
 *
 * export async function GET() {
 *   try {
 *     const events = await withDatabase(async () => {
 *       return await EventModel.find({}).limit(10);
 *     });
 *
 *     return Response.json({ events });
 *   } catch (error) {
 *     return Response.json(
 *       { error: 'Failed to fetch events' },
 *       { status: 500 }
 *     );
 *   }
 * }
 */
