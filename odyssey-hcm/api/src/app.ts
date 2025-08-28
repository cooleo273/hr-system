import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import { requestId } from 'hono/request-id';
import { timing } from 'hono/timing';

// Import route modules
import leave from './routes/leave';
import recruitment from './routes/recruitment';
import performance from './routes/performance';

// Import middleware
import { requestLogger } from './middleware/request-logger';

const app = new Hono();

// Global middleware
app.use('*', logger());
app.use('*', prettyJSON());
app.use('*', requestId());
app.use('*', timing());
app.use('*', requestLogger);

// CORS configuration
app.use('*', cors({
  origin: (origin) => {
    // Allow all origins in development
    if (process.env.NODE_ENV === 'development') {
      return origin || '*';
    }
    
    // In production, allow specific origins
    const allowedOrigins = [
      'https://odyssey-hcm-frontend.scout.site',
      'http://localhost:5173',
      'http://localhost:3000'
    ];
    
    return allowedOrigins.includes(origin || '') ? origin : null;
  },
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'X-Request-ID'
  ],
  credentials: true,
  maxAge: 86400 // 24 hours
}));

// Health check endpoint
app.get('/health', (c) => {
  return c.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// API versioning
const v1 = app.basePath('/api/v1');

// Register route modules
v1.route('/leave', leave);
v1.route('/recruitment', recruitment);
v1.route('/performance', performance);

// Root endpoint
app.get('/', (c) => {
  return c.json({
    message: 'Odyssey HCM API',
    version: '1.0.0',
    documentation: '/api/v1/docs',
    health: '/health',
    endpoints: {
      leave: '/api/v1/leave',
      recruitment: '/api/v1/recruitment',
      performance: '/api/v1/performance'
    }
  });
});

// API documentation endpoint
v1.get('/docs', (c) => {
  return c.json({
    title: 'Odyssey HCM API Documentation',
    version: '1.0.0',
    modules: {
      leave: {
        description: 'Leave and Attendance Management',
        endpoints: [
          'GET /api/v1/leave/requests',
          'POST /api/v1/leave/requests',
          'GET /api/v1/leave/requests/:id',
          'PUT /api/v1/leave/requests/:id',
          'POST /api/v1/leave/requests/:id/approve',
          'POST /api/v1/leave/requests/:id/reject',
          'GET /api/v1/leave/balances/:employeeId',
          'GET /api/v1/leave/policies',
          'GET /api/v1/leave/calendar'
        ]
      },
      recruitment: {
        description: 'Recruitment and Applicant Tracking System',
        endpoints: [
          'GET /api/v1/recruitment/requisitions',
          'POST /api/v1/recruitment/requisitions',
          'GET /api/v1/recruitment/postings',
          'POST /api/v1/recruitment/postings',
          'GET /api/v1/recruitment/candidates',
          'POST /api/v1/recruitment/candidates',
          'GET /api/v1/recruitment/applications',
          'POST /api/v1/recruitment/applications',
          'GET /api/v1/recruitment/interviews',
          'POST /api/v1/recruitment/interviews',
          'GET /api/v1/recruitment/offers',
          'POST /api/v1/recruitment/offers'
        ]
      },
      performance: {
        description: 'Performance and Talent Management',
        endpoints: [
          'GET /api/v1/performance/reviews',
          'POST /api/v1/performance/reviews',
          'GET /api/v1/performance/goals',
          'POST /api/v1/performance/goals',
          'GET /api/v1/performance/feedback',
          'POST /api/v1/performance/feedback',
          'GET /api/v1/performance/succession-plans',
          'POST /api/v1/performance/succession-plans',
          'GET /api/v1/performance/competencies',
          'POST /api/v1/performance/competencies',
          'GET /api/v1/performance/analytics/performance',
          'GET /api/v1/performance/analytics/goals'
        ]
      }
    }
  });
});

// 404 handler
app.notFound((c) => {
  return c.json({
    error: 'Not Found',
    message: 'The requested endpoint does not exist',
    path: c.req.path,
    method: c.req.method
  }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error('Application error:', err);
  
  return c.json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
    timestamp: new Date().toISOString(),
    requestId: c.get('requestId')
  }, 500);
});

// Start server
const port = process.env.PORT || 3001;

console.log(`🚀 Odyssey HCM API starting on port ${port}`);
console.log(`📚 API Documentation: http://localhost:${port}/api/v1/docs`);
console.log(`🏥 Health Check: http://localhost:${port}/health`);

export default {
  port,
  fetch: app.fetch,
};