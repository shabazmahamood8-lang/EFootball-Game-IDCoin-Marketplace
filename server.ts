import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './src/server/routes/auth.js';
import idsRoutes from './src/server/routes/ids.js';
import coinsRoutes from './src/server/routes/coins.js';
import ordersRoutes from './src/server/routes/orders.js';
import reviewsRoutes from './src/server/routes/reviews.js';
import settingsRoutes from './src/server/routes/settings.js';
import contactRoutes from './src/server/routes/contact.js';
import uploadRoutes from './src/server/routes/upload.js';
import adminStatsRoutes from './src/server/routes/adminStats.js';
import healthRoutes from './src/server/routes/health.js';
import { connectToDatabase } from './lib/mongodb.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  // JSON Body parsing with limit for base64 image uploads
  app.use(express.json({ limit: '20mb' }));
  app.use(express.urlencoded({ extended: true, limit: '20mb' }));

  // Connect to MongoDB Atlas
  try {
    await connectToDatabase();
  } catch (err) {
    console.warn('[Server Startup] MongoDB initial connection check:', (err as Error).message);
  }

  // Health check endpoints (database check at /api/health/database)
  app.use('/api/health', healthRoutes);

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/ids', idsRoutes);
  app.use('/api/coins', coinsRoutes);
  app.use('/api/orders', ordersRoutes);
  app.use('/api/reviews', reviewsRoutes);
  app.use('/api/settings', settingsRoutes);
  app.use('/api/contact', contactRoutes);
  app.use('/api/upload', uploadRoutes);
  app.use('/api/admin', adminStatsRoutes);

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
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`[FOOTBALL ID STORE] Server running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
