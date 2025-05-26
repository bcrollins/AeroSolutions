import request from 'supertest';
import { app } from '../../index';
import { checkDatabaseHealth } from '../../db';

describe('API Integration Tests', () => {
  beforeAll(async () => {
    // Ensure database is healthy before running tests
    const isHealthy = await checkDatabaseHealth();
    if (!isHealthy) {
      throw new Error('Database is not healthy - cannot run tests');
    }
  });

  describe('Health Endpoints', () => {
    test('GET /api/health should return system health', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
    });
  });

  describe('Course Endpoints', () => {
    test('GET /api/courses should return courses list', async () => {
      const response = await request(app)
        .get('/api/courses')
        .expect(200);

      expect(response.body).toHaveProperty('courses');
      expect(Array.isArray(response.body.courses)).toBe(true);
    });
  });

  describe('Security Headers', () => {
    test('Should include security headers in responses', async () => {
      const response = await request(app)
        .get('/api/courses')
        .expect(200);

      expect(response.headers).toHaveProperty('x-content-type-options', 'nosniff');
      expect(response.headers).toHaveProperty('x-frame-options', 'DENY');
      expect(response.headers).toHaveProperty('x-xss-protection', '1; mode=block');
    });
  });
});