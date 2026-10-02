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

/**
 * Connects to MongoDB Atlas with serverless connection pooling and clear diagnostics.
 */
export async function connectToDatabase(): Promise<typeof mongoose> {
  const rawUri =
    process.env.MONGODB_URI ||
    process.env.MONGO_URI ||
    process.env.MONGODB_URL ||
    process.env.DATABASE_URL;

  if (!rawUri || typeof rawUri !== 'string') {
    const errorMsg =
      'MONGODB_URI environment variable is missing. Please add MONGODB_URI in your Vercel Project Settings > Environment Variables.';
    console.error(`[MongoDB Error] ${errorMsg}`);
    throw new Error(errorMsg);
  }

  // Sanitize URI: remove surrounding quotes, whitespace, trailing newlines
  const uri = rawUri.trim().replace(/^["']|["']$/g, '');

  if (
    !uri ||
    uri.includes('username:password') ||
    uri.includes('YOUR_MONGODB') ||
    uri.includes('user:pass@')
  ) {
    const errorMsg =
      'MONGODB_URI contains placeholder credentials (username:password). Please configure your real MongoDB Atlas connection string in Vercel environment variables.';
    console.error(`[MongoDB Error] ${errorMsg}`);
    throw new Error(errorMsg);
  }

  // If already connected and ready, return existing connection immediately
  if (mongoose.connection.readyState === 1) {
    cached.conn = mongoose;
    return cached.conn;
  }

  // If currently connecting, await in-flight promise
  if (mongoose.connection.readyState === 2 && cached.promise) {
    cached.conn = await cached.promise;
    return cached.conn;
  }

  // Reset state if connection was dropped
  cached.conn = null;
  cached.promise = null;

  const rawDbName = process.env.MONGODB_DB_NAME;
  const dbName = rawDbName ? rawDbName.trim().replace(/^["']|["']$/g, '') : undefined;

  const opts: mongoose.ConnectOptions = {
    bufferCommands: false, // Critical for serverless: never buffer commands when disconnected
    serverSelectionTimeoutMS: 6000, // Fail fast with actionable message instead of hanging
    connectTimeoutMS: 8000,
    socketTimeoutMS: 45000,
    maxPoolSize: 10,
    minPoolSize: 1,
    retryWrites: true,
    w: 'majority',
  };

  if (dbName && dbName !== '') {
    opts.dbName = dbName;
  }

  console.log(`[MongoDB] Connecting to MongoDB Atlas (${dbName || 'database from URI'})...`);

  cached.promise = mongoose
    .connect(uri, opts)
    .then((instance) => {
      cached.conn = instance;
      console.log(
        `[MongoDB] Successfully connected to MongoDB Atlas database: "${instance.connection.name || dbName || 'football_id_store'}"`
      );
      return instance;
    })
    .catch((err) => {
      cached.conn = null;
      cached.promise = null;

      const rawMsg = (err as Error).message || '';
      console.error('[MongoDB Error] Connection failed:', rawMsg);

      if (rawMsg.includes('bad auth') || rawMsg.includes('Authentication failed') || rawMsg.includes('auth error')) {
        throw new Error(
          `MongoDB Authentication Failed: Please check the username and password in MONGODB_URI. Details: ${rawMsg}`
        );
      }

      if (
        rawMsg.includes('Server selection timed out') ||
        rawMsg.includes('ECONNREFUSED') ||
        rawMsg.includes('ETIMEDOUT') ||
        rawMsg.includes('querySrv ENOTFOUND')
      ) {
        throw new Error(
          `MongoDB Atlas Connection Timed Out. ROOT CAUSE FOR VERCEL: Ensure MongoDB Atlas > Security > Network Access allows "0.0.0.0/0" (Allow Access from Anywhere), as Vercel serverless IP addresses change dynamically. Details: ${rawMsg}`
        );
      }

      throw new Error(`MongoDB connection error: ${rawMsg}`);
    });

  cached.conn = await cached.promise;
  return cached.conn;
}

export function isMongoConnected(): boolean {
  return mongoose.connection.readyState === 1;
}

export function getDatabaseName(): string {
  const envDbName = process.env.MONGODB_DB_NAME
    ? process.env.MONGODB_DB_NAME.trim().replace(/^["']|["']$/g, '')
    : undefined;
  return envDbName || mongoose.connection.name || 'football_id_store';
}
