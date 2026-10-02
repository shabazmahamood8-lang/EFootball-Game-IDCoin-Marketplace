import mongoose from 'mongoose';

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongooseCache || { conn: null, promise: null };

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

export async function connectToDatabase(): Promise<typeof mongoose> {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB_NAME || 'football_id_store';

  if (!uri || uri.trim() === '' || uri.includes('username:password')) {
    const errorMsg = 'MONGODB_URI environment variable is missing or placeholder. Please configure your real MongoDB Atlas connection string in .env';
    console.warn(`[MongoDB Warning] ${errorMsg}`);
    throw new Error(errorMsg);
  }

  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
      dbName,
      serverSelectionTimeoutMS: 10000,
    };

    console.log(`[MongoDB] Initiating connection to database: "${dbName}"...`);
    cached.promise = mongoose.connect(uri, opts).then((instance) => {
      console.log(`[MongoDB] Successfully connected to MongoDB Atlas database: "${dbName}"`);
      return instance;
    }).catch((err) => {
      console.error('[MongoDB Error] Connection failed:', (err as Error).message);
      cached.promise = null;
      throw err;
    });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (err) {
    cached.promise = null;
    throw err;
  }
}

export function isMongoConnected(): boolean {
  return mongoose.connection.readyState === 1;
}

export function getDatabaseName(): string {
  return process.env.MONGODB_DB_NAME || mongoose.connection.name || 'football_id_store';
}
