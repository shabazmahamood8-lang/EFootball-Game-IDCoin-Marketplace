import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { app } from './src/server/app.js';
import { connectToDatabase } from './lib/mongodb.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const PORT = process.env.PORT || 3000;

  // Connect to MongoDB Atlas
  try {
    await connectToDatabase();
  } catch (err) {
    console.warn('[Server Startup] MongoDB connection notice:', (err as Error).message);
  }

  // Serve static assets or mount Vite dev server
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(expressStaticFallback());
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`[FOOTBALL ID STORE] Server running on port ${PORT}`);
  });
}

function expressStaticFallback() {
  const express = (global as any).express || require('express');
  const router = express.Router();
  const distPath = path.resolve(__dirname, 'dist');
  router.use(express.static(distPath));
  router.get('*', (_req: any, res: any) => {
    res.sendFile(path.resolve(distPath, 'index.html'));
  });
  return router;
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});

export { app };
export default app;
