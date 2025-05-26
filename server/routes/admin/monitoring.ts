import express from 'express';
import { isAuthenticated } from '../../replitAuth';
import { checkDatabaseHealth, getPoolStats } from '../../db';
import { getCacheStats } from '../../middleware/cache';
import { logger } from '../../middleware/errorHandler';
import os from 'os';

const router = express.Router();

// System health endpoint
router.get('/health', isAuthenticated, async (req, res) => {
  try {
    const dbHealth = await checkDatabaseHealth();
    const uptime = process.uptime();
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    
    const healthData = {
      status: dbHealth ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(uptime),
      database: {
        connected: dbHealth,
        poolStats: getPoolStats()
      },
      memory: {
        used: Math.round(memoryUsage.heapUsed / 1024 / 1024),
        total: Math.round(memoryUsage.heapTotal / 1024 / 1024),
        external: Math.round(memoryUsage.external / 1024 / 1024)
      },
      cpu: {
        user: cpuUsage.user,
        system: cpuUsage.system
      },
      system: {
        platform: os.platform(),
        arch: os.arch(),
        loadAverage: os.loadavg(),
        totalMemory: Math.round(os.totalmem() / 1024 / 1024),
        freeMemory: Math.round(os.freemem() / 1024 / 1024)
      },
      cache: getCacheStats()
    };
    
    res.json(healthData);
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(500).json({ error: 'Health check failed' });
  }
});

// Performance metrics endpoint
router.get('/metrics', isAuthenticated, async (req, res) => {
  try {
    const metrics = {
      timestamp: new Date().toISOString(),
      requestCount: req.app.locals.requestCount || 0,
      errorCount: req.app.locals.errorCount || 0,
      averageResponseTime: req.app.locals.averageResponseTime || 0,
      activeUsers: req.app.locals.activeUsers || 0,
      cacheHitRatio: calculateCacheHitRatio()
    };
    
    res.json(metrics);
  } catch (error) {
    logger.error('Metrics retrieval failed:', error);
    res.status(500).json({ error: 'Metrics retrieval failed' });
  }
});

function calculateCacheHitRatio(): number {
  const stats = getCacheStats();
  const totalRequests = Object.values(stats).reduce((total, stat) => total + stat.hits + stat.misses, 0);
  const totalHits = Object.values(stats).reduce((total, stat) => total + stat.hits, 0);
  return totalRequests > 0 ? (totalHits / totalRequests) * 100 : 0;
}

export default router;