import express from 'express';
import authRoutes from './routes/auth.js';
import idsRoutes from './routes/ids.js';
import coinsRoutes from './routes/coins.js';
import ordersRoutes from './routes/orders.js';
import reviewsRoutes from './routes/reviews.js';
import settingsRoutes from './routes/settings.js';
import contactRoutes from './routes/contact.js';
import uploadRoutes from './routes/upload.js';
import adminStatsRoutes from './routes/adminStats.js';
import healthRoutes from './routes/health.js';

export function createApp() {
  const app = express();

  // JSON Body parsing
  app.use(express.json({ limit: '20mb' }));
  app.use(express.urlencoded({ extended: true, limit: '20mb' }));

  // CORS headers for production and Vercel
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
      return;
    }
    next();
  });

  // Vercel Serverless Path Normalization
  // When vercel.json rewrites /api/(.*) -> /api, x-matched-path contains the original requested path
  app.use((req, _res, next) => {
    const matchedPath = req.headers['x-matched-path'] as string;
    if (matchedPath && (req.url === '/api' || req.url === '/' || req.url.startsWith('/api?'))) {
      const qIndex = req.url.indexOf('?');
      const query = qIndex !== -1 ? req.url.substring(qIndex) : '';
      req.url = matchedPath.split('?')[0] + query;
    }
    next();
  });

  // Health check endpoints (database check at /api/health/database)
  app.use('/api/health', healthRoutes);
  app.use('/health', healthRoutes);

  // API Routes (Mounted on both /api/ and / for compatibility with all Vercel rewrite modes)
  const routeList = [
    { path: 'auth', router: authRoutes },
    { path: 'ids', router: idsRoutes },
    { path: 'coins', router: coinsRoutes },
    { path: 'orders', router: ordersRoutes },
    { path: 'reviews', router: reviewsRoutes },
    { path: 'settings', router: settingsRoutes },
    { path: 'contact', router: contactRoutes },
    { path: 'upload', router: uploadRoutes },
    { path: 'admin', router: adminStatsRoutes },
  ];

  for (const route of routeList) {
    app.use(`/api/${route.path}`, route.router);
    app.use(`/${route.path}`, route.router);
  }

  return app;
}

export const app = createApp();
export default app;
