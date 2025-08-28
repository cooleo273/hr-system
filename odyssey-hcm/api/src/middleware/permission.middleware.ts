import { Context, Next } from 'hono';
import { getCurrentUser, hasAnyPermission } from './auth.middleware';

/**
 * Middleware to check if the authenticated user has the required permissions
 * @param requiredPermissions Array of permissions, user needs at least one
 * @param requireAll If true, user must have ALL permissions; if false, user needs ANY permission
 */
export const permissionMiddleware = (
  requiredPermissions: string[],
  requireAll: boolean = false
) => {
  return async (c: Context, next: Next) => {
    try {
      const user = getCurrentUser(c);
      
      if (!user) {
        return c.json({ error: 'User not authenticated' }, 401);
      }

      // Super admin bypass
      if (user.roles?.includes('super_admin')) {
        return next();
      }

      // Check permissions
      if (requireAll) {
        // User must have ALL permissions
        const hasAllPermissions = requiredPermissions.every(permission => 
          user.permissions?.includes(permission)
        );
        
        if (!hasAllPermissions) {
          return c.json({
            error: 'Insufficient permissions',
            required: requiredPermissions,
            missing: requiredPermissions.filter(p => !user.permissions?.includes(p))
          }, 403);
        }
      } else {
        // User needs ANY of the permissions
        const hasPermission = hasAnyPermission(c, requiredPermissions);
        
        if (!hasPermission) {
          return c.json({
            error: 'Insufficient permissions',
            required: `One of: ${requiredPermissions.join(', ')}`,
            userPermissions: user.permissions || []
          }, 403);
        }
      }

      return next();
    } catch (error) {
      console.error('Permission middleware error:', error);
      return c.json({ error: 'Permission check failed' }, 500);
    }
  };
};

/**
 * Role-based middleware to check if user has required roles
 * @param requiredRoles Array of roles, user needs at least one
 */
export const roleMiddleware = (requiredRoles: string[]) => {
  return async (c: Context, next: Next) => {
    try {
      const user = getCurrentUser(c);
      
      if (!user) {
        return c.json({ error: 'User not authenticated' }, 401);
      }

      // Super admin bypass
      if (user.roles?.includes('super_admin')) {
        return next();
      }

      // Check if user has any of the required roles
      const hasRole = requiredRoles.some(role => user.roles?.includes(role));
      
      if (!hasRole) {
        return c.json({
          error: 'Insufficient role privileges',
          required: `One of: ${requiredRoles.join(', ')}`,
          userRoles: user.roles || []
        }, 403);
      }

      return next();
    } catch (error) {
      console.error('Role middleware error:', error);
      return c.json({ error: 'Role check failed' }, 500);
    }
  };
};

/**
 * Tenant isolation middleware to ensure users can only access data from their tenant
 * @param getTenantId Function to extract tenant ID from request parameters
 */
export const tenantMiddleware = (getTenantId?: (c: Context) => string) => {
  return async (c: Context, next: Next) => {
    try {
      const user = getCurrentUser(c);
      
      if (!user) {
        return c.json({ error: 'User not authenticated' }, 401);
      }

      // Super admin can access all tenants
      if (user.roles?.includes('super_admin')) {
        return next();
      }

      // If getTenantId function is provided, validate tenant access
      if (getTenantId) {
        const requestedTenantId = getTenantId(c);
        if (requestedTenantId && requestedTenantId !== user.tenantId) {
          return c.json({
            error: 'Access denied',
            message: 'You can only access data from your organization'
          }, 403);
        }
      }

      // Add tenant filter to request context
      c.set('tenantId', user.tenantId);
      
      return next();
    } catch (error) {
      console.error('Tenant middleware error:', error);
      return c.json({ error: 'Tenant validation failed' }, 500);
    }
  };
};

/**
 * Employee data access middleware to ensure users can only access appropriate employee data
 * @param getEmployeeId Function to extract employee ID from request parameters
 */
export const employeeAccessMiddleware = (getEmployeeId: (c: Context) => string) => {
  return async (c: Context, next: Next) => {
    try {
      const user = getCurrentUser(c);
      
      if (!user) {
        return c.json({ error: 'User not authenticated' }, 401);
      }

      const requestedEmployeeId = getEmployeeId(c);
      
      // Super admin and HR admin can access all employee data
      if (user.roles?.includes('super_admin') || user.roles?.includes('hr_admin')) {
        return next();
      }

      // Managers can access their direct reports' data
      if (user.roles?.includes('manager')) {
        // This would require a database query to check if the requested employee reports to this manager
        // For now, we'll allow manager access and implement the check in the service layer
        return next();
      }

      // Employees can only access their own data
      if (requestedEmployeeId !== user.id) {
        return c.json({
          error: 'Access denied',
          message: 'You can only access your own employee data'
        }, 403);
      }

      return next();
    } catch (error) {
      console.error('Employee access middleware error:', error);
      return c.json({ error: 'Employee access validation failed' }, 500);
    }
  };
};

// Common permission constants
export const PERMISSIONS = {
  // HRIS permissions
  EMPLOYEE_READ: 'employee:read',
  EMPLOYEE_WRITE: 'employee:write',
  EMPLOYEE_ADMIN: 'employee:admin',
  
  // Leave permissions
  LEAVE_READ: 'leave:read',
  LEAVE_WRITE: 'leave:write',
  LEAVE_APPROVE: 'leave:approve',
  LEAVE_ADMIN: 'leave:admin',
  
  // Recruitment permissions
  RECRUITMENT_READ: 'recruitment:read',
  RECRUITMENT_WRITE: 'recruitment:write',
  RECRUITMENT_ADMIN: 'recruitment:admin',
  
  // Performance permissions
  PERFORMANCE_READ: 'performance:read',
  PERFORMANCE_WRITE: 'performance:write',
  PERFORMANCE_ADMIN: 'performance:admin',
  
  // Goals permissions
  GOALS_READ: 'goals:read',
  GOALS_WRITE: 'goals:write',
  GOALS_ADMIN: 'goals:admin',
  
  // Feedback permissions
  FEEDBACK_READ: 'feedback:read',
  FEEDBACK_WRITE: 'feedback:write',
  FEEDBACK_ADMIN: 'feedback:admin',
  
  // Succession planning permissions
  SUCCESSION_READ: 'succession:read',
  SUCCESSION_WRITE: 'succession:write',
  SUCCESSION_ADMIN: 'succession:admin',
  
  // Competencies permissions
  COMPETENCIES_READ: 'competencies:read',
  COMPETENCIES_WRITE: 'competencies:write',
  COMPETENCIES_ADMIN: 'competencies:admin',
  
  // Analytics permissions
  ANALYTICS_READ: 'analytics:read',
  ANALYTICS_ADMIN: 'analytics:admin',
  
  // System admin permissions
  SYSTEM_ADMIN: 'system:admin',
  USER_MANAGEMENT: 'users:admin',
  ROLE_MANAGEMENT: 'roles:admin',
} as const;

// Common role constants
export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  HR_ADMIN: 'hr_admin',
  MANAGER: 'manager',
  EMPLOYEE: 'employee',
  RECRUITER: 'recruiter',
  ANALYST: 'analyst',
} as const;