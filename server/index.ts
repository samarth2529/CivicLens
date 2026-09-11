import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import apiRoutes from './routes/api';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env'), override: true });

const app = express();
const PORT = Number(process.env.PORT) || 3001;
const HOST = '0.0.0.0';

app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// API Routes
app.use('/api', apiRoutes);

// Handle unknown API routes cleanly with JSON
app.all('/api/*', (_req: Request, res: Response) => {
  res.status(404).json({ success: false, error: 'API endpoint not found' });
});

// Serve static frontend assets in production (Cloud Run single-container architecture)
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

// Fallback for Single Page Application client-side routing
app.get('*', (_req: Request, res: Response) => {
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) {
      res.status(200).json({ 
        service: 'CivicLens API Server', 
        status: 'running', 
        note: 'Frontend bundle not yet built. Run npm run build or visit dev server at port 5173.' 
      });
    }
  });
});

// Production error handling middleware (never expose internal stack traces or paths)
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[CivicLens Server Error]:', err?.message || err);
  res.status(err?.status || 500).json({
    success: false,
    error: err?.message || 'An internal server error occurred',
  });
});

const server = app.listen(PORT, HOST, () => {
  console.log(`[CivicLens Production Server] Running on http://${HOST}:${PORT}`);
});

// Graceful termination for Cloud Run container lifecycle
process.on('SIGTERM', () => {
  console.log('[CivicLens] SIGTERM received. Closing HTTP server gracefully.');
  server.close(() => {
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('[CivicLens] SIGINT received. Shutting down.');
  server.close(() => {
    process.exit(0);
  });
});
