import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    throw new Error('⚠️ MONGODB_URI environment variable is missing!');
}

// Global cache to prevent re-establishing DB connections on hot reloads
let cached = global.mongoose || { conn: null, promise: null };

async function connectToDatabase() {
    if (cached.conn) {
        console.log('✅ Using existing MongoDB connection');
        return cached.conn;
    }

    if (!cached.promise) {
        console.log('🔗 Connecting to MongoDB...');
        cached.promise = mongoose
            .connect(MONGODB_URI as string, {
                maxPoolSize: 10, // Prevent too many open connections
                serverSelectionTimeoutMS: 5000, // Avoid infinite wait on DB connection
                connectTimeoutMS: 10000, // Ensure connections timeout properly
            })
            .then((mongoose) => {
                console.log('✅ MongoDB Connected Successfully');
                return mongoose;
            })
            .catch((err) => {
                console.error('❌ MongoDB Connection Error:', err);
                process.exit(1); // Exit process if DB fails
            });
    }

    cached.conn = await cached.promise;
    return cached.conn;
}

// Save cached instance globally for hot reloads
global.mongoose = cached;

export default connectToDatabase;
