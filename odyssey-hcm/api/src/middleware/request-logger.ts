import { Context, Next } from 'hono'
import { loggers, createRequestLogger } from '../utils/logger'
import { generateRequestId } from '../utils/helpers'

/**
 * Request logging middleware
 */
export async function requestLogger(c: Context, next: Next) {
  const start = Date.now()
  const requestId = c.get('requestId') || generateRequestId()
  
  // Extract request information
  const method = c.req.method
  const url = c.req.url
  const path = c.req.path
  const userAgent = c.req.header('user-agent') || 'unknown'
  const ip = c.req.header('x-forwarded-for') || 
            c.req.header('x-real-ip') || 
            c.req.header('cf-connecting-ip') || 
            'unknown'
  const referer = c.req.header('referer')
  const contentLength = c.req.header('content-length')
  const acceptLanguage = c.req.header('accept-language')
  
  // Set request ID for other middleware
  c.set('requestId', requestId)
  
  // Create request-specific logger
  const logger = createRequestLogger(requestId)
  
  // Log request start
  logger.info('Request started', {
    method,
    path,
    url,
    ip,
    userAgent,
    referer,
    contentLength,
    acceptLanguage
  })

  let statusCode: number
  let error: Error | null = null

  try {
    await next()
    statusCode = c.res.status
  } catch (err) {
    error = err as Error
    statusCode = 500
    throw err
  } finally {
    const duration = Date.now() - start
    const userId = c.get('userId')
    
    // Determine log level based on status code
    const logLevel = getLogLevel(statusCode)
    
    // Prepare log data
    const logData = {
      method,
      path,
      url,
      statusCode,
      duration,
      ip,
      userAgent,
      userId,
      referer,
      responseSize: c.res.headers.get('content-length'),
      error: error?.message
    }

    // Log request completion
    logger[logLevel]('Request completed', logData)

    // Log to performance logger
    loggers.performance.apiRequest({
      method,
      path,
      duration,
      statusCode,
      userId
    })

    // Log security events for sensitive operations
    if (shouldLogSecurityEvent(path, method, statusCode)) {
      loggers.security.dataAccess({
        userId: userId || 'anonymous',
        resource: path,
        action: method,
        resourceId: extractResourceId(path)
      })
    }

    // Log slow requests
    const slowThreshold = getSlowThreshold(path)
    if (duration > slowThreshold) {
      logger.warn('Slow request detected', {
        ...logData,
        threshold: slowThreshold,
        performanceImpact: 'high'
      })
    }

    // Add response headers for debugging
    if (process.env.NODE_ENV === 'development') {
      c.header('X-Request-ID', requestId)
      c.header('X-Response-Time', `${duration}ms`)
    }
  }
}

/**
 * Determine log level based on status code
 */
function getLogLevel(statusCode: number): 'info' | 'warn' | 'error' {
  if (statusCode >= 500) {
    return 'error'
  } else if (statusCode >= 400) {
    return 'warn'
  } else {
    return 'info'
  }
}

/**
 * Check if request should trigger security logging
 */
function shouldLogSecurityEvent(path: string, method: string, statusCode: number): boolean {
  // Log all authentication attempts
  if (path.startsWith('/auth/')) {
    return true
  }

  // Log admin operations
  if (path.includes('/admin/')) {
    return true
  }

  // Log sensitive data access
  const sensitivePatterns = [
    '/api/employees',
    '/api/compensation',
    '/api/performance',
    '/api/reports',
    '/api/admin'
  ]

  if (sensitivePatterns.some(pattern => path.startsWith(pattern))) {
    return true
  }

  // Log failed authorization attempts
  if (statusCode === 401 || statusCode === 403) {
    return true
  }

  // Log data modification operations
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method) && statusCode < 400) {
    return true
  }

  return false
}

/**
 * Extract resource ID from path for security logging
 */
function extractResourceId(path: string): string | undefined {
  // Extract ID from common patterns like /api/employees/123
  const match = path.match(/\/([a-zA-Z0-9-_]+)\/([a-zA-Z0-9-_]+)$/);
  return match ? match[2] : undefined
}

/**
 * Get slow request threshold based on endpoint type
 */
function getSlowThreshold(path: string): number {
  // Default threshold: 1 second
  let threshold = 1000

  // Higher thresholds for known slow operations
  if (path.includes('/reports')) {
    threshold = 10000 // 10 seconds for reports
  } else if (path.includes('/bulk')) {
    threshold = 5000 // 5 seconds for bulk operations
  } else if (path.includes('/upload')) {
    threshold = 3000 // 3 seconds for file uploads
  } else if (path.includes('/search')) {
    threshold = 2000 // 2 seconds for search
  } else if (path.includes('/export')) {
    threshold = 8000 // 8 seconds for exports
  }

  return threshold
}

export default requestLogger