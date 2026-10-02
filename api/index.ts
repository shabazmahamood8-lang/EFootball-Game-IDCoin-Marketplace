import { app } from '../src/server/app.js';
import { connectToDatabase } from '../lib/mongodb.js';

export default async function handler(req: any, res: any) {
  try {
    await connectToDatabase();
  } catch (err: any) {
    console.error('[Vercel Serverless] MongoDB connection note:', err?.message || err);
  }
  return app(req, res);
}

export { app };
