import mongoose from "mongoose";

// Define the connection state type for better type safety
type ConnectionState = {
  isConnected?: number;
};

// Cache the connection to prevent multiple connections during development
// This is especially important in Next.js where hot reloading can cause multiple connection attempts
const connection: ConnectionState = {};

/**
 * Establishes a connection to MongoDB using Mongoose
 * Implements connection caching to prevent multiple simultaneous connections
 *
 * @returns Promise<void> - Resolves when connection is established
 * @throws Error - If MongoDB URI is not provided or connection fails
 */
async function connectToMongoDB(): Promise<void> {
  // Check if already connected to avoid redundant connections
  if (connection.isConnected) {
    console.log("Already connected to MongoDB");
    return;
  }

  // Validate that MongoDB URI is provided
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    throw new Error(
      "Please define the MONGODB_URI environment variable inside .env.local"
    );
  }

  try {
    console.log("Connecting to MongoDB...");

    // Establish connection with optimized settings for production
    const db = await mongoose.connect(MONGODB_URI, {
      // Connection pool settings for better performance
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity

      // Additional connection options for stability
      heartbeatFrequencyMS: 30000, // Check connection health every 30 seconds
      retryWrites: true, // Retry write operations on network errors
    });

    // Cache the connection state
    connection.isConnected = db.connections[0].readyState;

    console.log("Successfully connected to MongoDB");

    // Handle connection events for better debugging and monitoring
    mongoose.connection.on("error", (error) => {
      console.error("MongoDB connection error:", error);
    });

    mongoose.connection.on("disconnected", () => {
      console.log("MongoDB disconnected");
      connection.isConnected = 0;
    });

    // Graceful shutdown handling
    process.on("SIGINT", async () => {
      await mongoose.connection.close();
      console.log("MongoDB connection closed due to app termination");
      process.exit(0);
    });
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    throw new Error(
      `Failed to connect to MongoDB: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

/**
 * Disconnects from MongoDB
 * Useful for testing or graceful shutdowns
 *
 * @returns Promise<void> - Resolves when disconnection is complete
 */
async function disconnectFromMongoDB(): Promise<void> {
  if (connection.isConnected) {
    await mongoose.disconnect();
    connection.isConnected = 0;
    console.log("Disconnected from MongoDB");
  }
}

/**
 * Gets the current connection status
 *
 * @returns boolean - True if connected, false otherwise
 */
function isConnected(): boolean {
  return connection.isConnected === 1;
}

export { connectToMongoDB, disconnectFromMongoDB, isConnected };
