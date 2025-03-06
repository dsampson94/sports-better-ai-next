import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    throw new Error('⚠️ MONGODB_URI environment variable is missing!');
}

// Global cache to prevent re-establishing DB connections on hot reloads
let cached = (global as any).mongoose || { conn: null, promise: null };

async function connectToDatabase() {
    if (cached.conn) {
        console.log('✅ Using existing MongoDB connection');
        return cached.conn;
    }

    if (!cached.promise) {
        console.log('🔗 Connecting to MongoDB...');
        cached.promise = mongoose
            .connect(MONGODB_URI as string, {
                maxPoolSize: 5, // 🔥 Reduce max connections (prevents overload)
                minPoolSize: 2, // 🔥 Keep some connections alive
                serverSelectionTimeoutMS: 5000, // Avoid infinite retries
                socketTimeoutMS: 45000, // Avoid long-hanging requests
                connectTimeoutMS: 10000, // Ensure connections timeout properly
            })
            .then((mongoose) => {
                console.log('✅ MongoDB Connected Successfully');

                // Log disconnection events for debugging
                mongoose.connection.on('disconnected', () => {
                    console.log('❌ MongoDB Disconnected. Reconnecting...');
                    cached.conn = null;
                });

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
(global as any).mongoose = cached;

export default connectToDatabase;
