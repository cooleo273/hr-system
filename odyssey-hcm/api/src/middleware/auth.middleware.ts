import { Context, Next } from 'hono';
import { verify } from 'jsonwebtoken';

interface JWTPayload {
  userId: string;
  email: string;
  tenantId: string;
  roles: string[];
  permissions: string[];
  iat: number;
  exp: number;
}

// Mock JWT secret - in production this should come from environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const authMiddleware = async (c: Context, next: Next) => {
  try {
    // Skip auth for health check and public endpoints
    const publicPaths = ['/health', '/api/v1/docs', '/'];
    if (publicPaths.includes(c.req.path)) {
      return next();
    }

    // Skip auth for public recruitment endpoints (career site)
    if (c.req.path.startsWith('/api/v1/recruitment/public/')) {
      return next();
    }

    const authHeader = c.req.header('Authorization');
    if (!authHeader) {
      return c.json({ error: 'Authorization header is required' }, 401);
    }

    const token = authHeader.replace('Bearer ', '');
    if (!token) {
      return c.json({ error: 'Bearer token is required' }, 401);
    }

    try {
      const decoded = verify(token, JWT_SECRET) as JWTPayload;
      
      // Check if token is expired
      if (decoded.exp * 1000 < Date.now()) {
        return c.json({ error: 'Token has expired' }, 401);
      }

      // Set user context
      c.set('user', {
        id: decoded.userId,
        email: decoded.email,
        tenantId: decoded.tenantId,
        roles: decoded.roles,
        permissions: decoded.permissions
      });

      return next();
    } catch (jwtError) {
      console.error('JWT verification failed:', jwtError);
      return c.json({ error: 'Invalid token' }, 401);
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return c.json({ error: 'Authentication failed' }, 401);
  }
};

// Helper function to get current user from context
export const getCurrentUser = (c: Context) => {
  return c.get('user') as {
    id: string;
    email: string;
    tenantId: string;
    roles: string[];
    permissions: string[];
  } | undefined;
};

// Helper function to check if user has specific role
export const hasRole = (c: Context, role: string): boolean => {
  const user = getCurrentUser(c);
  return user?.roles?.includes(role) || false;
};

// Helper function to check if user has specific permission
export const hasPermission = (c: Context, permission: string): boolean => {
  const user = getCurrentUser(c);
  return user?.permissions?.includes(permission) || false;
};

// Helper function to check if user has any of the provided permissions
export const hasAnyPermission = (c: Context, permissions: string[]): boolean => {
  const user = getCurrentUser(c);
  if (!user?.permissions) return false;
  
  return permissions.some(permission => user.permissions.includes(permission));
};