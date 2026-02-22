import mongoose from 'mongoose';

// Define the connection cache type
type MongooseCache = {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
};

// Extend the global object to include our mongoose cache
declare global {

    var mongoose: MongooseCache | undefined;
}

const MONGODB_URI = process.env.MONGODB_URI;


// Initialize the cache on the global object to persist across hot reloads in development
const cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
    global.mongoose = cached;
}

/**
 * Establishes a connection to MongoDB using Mongoose.
 * Caches the connection to prevent multiple connections during development hot reloads.
 * @returns Promise resolving to the Mongoose instance
 */
async function connectDB(): Promise<typeof mongoose> {
    // Return existing connection if available and ready
    if (cached.conn && mongoose.connection.readyState === 1) {
        return cached.conn;
    }

    // Return existing connection promise if one is in progress
    if (!cached.promise) {
        // Validate MongoDB URI exists
        if (!MONGODB_URI) {
            throw new Error(
                'Please define the MONGODB_URI environment variable inside .env.local'
            );
        }
        const options = {
            bufferCommands: false, // Disable Mongoose buffering
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        };

        // Create a new connection promise
        cached.promise = mongoose.connect(MONGODB_URI!, options).then((mongoose) => {
            return mongoose;
        });
    }

    try {
        // Wait for the connection to establish
        cached.conn = await cached.promise;
        
        // Verify connection is ready
        if (mongoose.connection.readyState !== 1) {
            throw new Error('MongoDB connection is not ready');
        }
    } catch (error) {
        // Reset promise on error to allow retry
        cached.promise = null;
        cached.conn = null;
        throw error;
    }

    return cached.conn;
}

export default connectDB;