import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { LeaveService } from '../services/leave.service.js'
import { authMiddleware, requirePermission } from '../middleware/auth.js'
import { 
  CreateLeavePolicySchema,
  UpdateLeavePolicySchema,
  CreateLeaveRequestSchema,
  UpdateLeaveRequestSchema,
  LeaveActionSchema,
  LeaveCalendarQuerySchema,
  LeaveReportQuerySchema,
  LeaveRequestQuerySchema
} from '../schemas/leave.schemas.js'
import { createSuccessResponse, createErrorResponse } from '../utils/response.js'
import { AppError } from '../middleware/error-handler.js'

const leaveRoutes = new Hono()
const leaveService = new LeaveService()

// Apply authentication to all routes
leaveRoutes.use('*', authMiddleware)

// ===============================
// LEAVE POLICIES
// ===============================

// Get all leave policies
leaveRoutes.get(
  '/policies',
  requirePermission('leave.policies.read'),
  async (c) => {
    try {
      const user = c.get('user')
      
      // TODO: Implement get all policies with pagination
      const result = { policies: [], total: 0, page: 1, totalPages: 0 }
      
      return c.json(createSuccessResponse(result, 'Leave policies retrieved successfully'))
    } catch (error) {
      const appError = error instanceof AppError ? error : new AppError('Failed to fetch leave policies', 500)
      return c.json(createErrorResponse(appError.message, appError.statusCode, appError.code), appError.statusCode)
    }
  }
)

// Create leave policy
leaveRoutes.post(
  '/policies',
  zValidator('json', CreateLeavePolicySchema),
  requirePermission('leave.policies.create'),
  async (c) => {
    try {
      const data = c.req.valid('json')
      const user = c.get('user')
      
      const result = await leaveService.createLeavePolicy(data, user.id)
      
      return c.json(createSuccessResponse(result, 'Leave policy created successfully'), 201)
    } catch (error) {
      const appError = error instanceof AppError ? error : new AppError('Failed to create leave policy', 500)
      return c.json(createErrorResponse(appError.message, appError.statusCode, appError.code), appError.statusCode)
    }
  }
)

// Get leave policy by ID
leaveRoutes.get(
  '/policies/:id',
  requirePermission('leave.policies.read'),
  async (c) => {
    try {
      const id = c.req.param('id')
      
      const result = await leaveService.getLeavePolicy(id)
      
      return c.json(createSuccessResponse(result, 'Leave policy retrieved successfully'))
    } catch (error) {
      const appError = error instanceof AppError ? error : new AppError('Failed to fetch leave policy', 500)
      return c.json(createErrorResponse(appError.message, appError.statusCode, appError.code), appError.statusCode)
    }
  }
)

// Update leave policy
leaveRoutes.put(
  '/policies/:id',
  zValidator('json', UpdateLeavePolicySchema),
  requirePermission('leave.policies.update'),
  async (c) => {
    try {
      const id = c.req.param('id')
      const data = c.req.valid('json')
      const user = c.get('user')
      
      const result = await leaveService.updateLeavePolicy(id, data, user.id)
      
      return c.json(createSuccessResponse(result, 'Leave policy updated successfully'))
    } catch (error) {
      const appError = error instanceof AppError ? error : new AppError('Failed to update leave policy', 500)
      return c.json(createErrorResponse(appError.message, appError.statusCode, appError.code), appError.statusCode)
    }
  }
)

// ===============================
// LEAVE BALANCES
// ===============================

// Get employee leave balances
leaveRoutes.get(
  '/balances/employee/:employeeId',
  requirePermission('leave.balances.read'),
  async (c) => {
    try {
      const employeeId = c.req.param('employeeId')
      const year = c.req.query('year') ? parseInt(c.req.query('year')!) : undefined
      
      const result = await leaveService.getEmployeeLeaveBalances(employeeId, year)
      
      return c.json(createSuccessResponse(result, 'Leave balances retrieved successfully'))
    } catch (error) {
      const appError = error instanceof AppError ? error : new AppError('Failed to fetch leave balances', 500)
      return c.json(createErrorResponse(appError.message, appError.statusCode, appError.code), appError.statusCode)
    }
  }
)

// Get current user's leave balances
leaveRoutes.get(
  '/balances/my',
  requirePermission('leave.balances.read'),
  async (c) => {
    try {
      const user = c.get('user')
      const year = c.req.query('year') ? parseInt(c.req.query('year')!) : undefined
      
      const result = await leaveService.getEmployeeLeaveBalances(user.id, year)
      
      return c.json(createSuccessResponse(result, 'Your leave balances retrieved successfully'))
    } catch (error) {
      const appError = error instanceof AppError ? error : new AppError('Failed to fetch leave balances', 500)
      return c.json(createErrorResponse(appError.message, appError.statusCode, appError.code), appError.statusCode)
    }
  }
)

// Update leave balance (recalculate)
leaveRoutes.post(
  '/balances/recalculate',
  requirePermission('leave.balances.update'),
  async (c) => {
    try {
      const { employeeId, policyId, year } = await c.req.json()
      
      if (!employeeId || !policyId || !year) {
        throw new AppError('Employee ID, Policy ID, and Year are required', 400)
      }
      
      const result = await leaveService.updateLeaveBalance(employeeId, policyId, year)
      
      return c.json(createSuccessResponse(result, 'Leave balance updated successfully'))
    } catch (error) {
      const appError = error instanceof AppError ? error : new AppError('Failed to update leave balance', 500)
      return c.json(createErrorResponse(appError.message, appError.statusCode, appError.code), appError.statusCode)
    }
  }
)

// ===============================
// LEAVE REQUESTS
// ===============================

// Get leave requests with filtering
leaveRoutes.get(
  '/requests',
  zValidator('query', LeaveRequestQuerySchema),
  requirePermission('leave.requests.read'),
  async (c) => {
    try {
      const query = c.req.valid('query')
      const user = c.get('user')
      
      // TODO: Implement get leave requests with filtering
      const result = { requests: [], total: 0, page: query.page, totalPages: 0, hasNext: false, hasPrev: false }
      
      return c.json(createSuccessResponse(result, 'Leave requests retrieved successfully'))
    } catch (error) {
      const appError = error instanceof AppError ? error : new AppError('Failed to fetch leave requests', 500)
      return c.json(createErrorResponse(appError.message, appError.statusCode, appError.code), appError.statusCode)
    }
  }
)

// Create leave request
leaveRoutes.post(
  '/requests',
  zValidator('json', CreateLeaveRequestSchema),
  requirePermission('leave.requests.create'),
  async (c) => {
    try {
      const data = c.req.valid('json')
      const user = c.get('user')
      
      const result = await leaveService.createLeaveRequest(data, user.id)
      
      return c.json(createSuccessResponse(result, 'Leave request created successfully'), 201)
    } catch (error) {
      const appError = error instanceof AppError ? error : new AppError('Failed to create leave request', 500)
      return c.json(createErrorResponse(appError.message, appError.statusCode, appError.code), appError.statusCode)
    }
  }
)

// Get leave request by ID
leaveRoutes.get(
  '/requests/:id',
  requirePermission('leave.requests.read'),
  async (c) => {
    try {
      const id = c.req.param('id')
      
      // TODO: Implement get leave request by ID
      const result = {}
      
      return c.json(createSuccessResponse(result, 'Leave request retrieved successfully'))
    } catch (error) {
      const appError = error instanceof AppError ? error : new AppError('Failed to fetch leave request', 500)
      return c.json(createErrorResponse(appError.message, appError.statusCode, appError.code), appError.statusCode)
    }
  }
)

// Update leave request
leaveRoutes.put(
  '/requests/:id',
  zValidator('json', UpdateLeaveRequestSchema),
  requirePermission('leave.requests.update'),
  async (c) => {
    try {
      const id = c.req.param('id')
      const data = c.req.valid('json')
      const user = c.get('user')
      
      const result = await leaveService.updateLeaveRequest(id, data, user.id)
      
      return c.json(createSuccessResponse(result, 'Leave request updated successfully'))
    } catch (error) {
      const appError = error instanceof AppError ? error : new AppError('Failed to update leave request', 500)
      return c.json(createErrorResponse(appError.message, appError.statusCode, appError.code), appError.statusCode)
    }
  }
)

// Get my leave requests
leaveRoutes.get(
  '/requests/my',
  zValidator('query', LeaveRequestQuerySchema.omit({ employeeId: true })),
  requirePermission('leave.requests.read'),
  async (c) => {
    try {
      const query = c.req.valid('query')
      const user = c.get('user')
      
      const queryWithEmployee = { ...query, employeeId: user.id }
      
      // TODO: Implement get my leave requests
      const result = { requests: [], total: 0, page: query.page, totalPages: 0, hasNext: false, hasPrev: false }
      
      return c.json(createSuccessResponse(result, 'Your leave requests retrieved successfully'))
    } catch (error) {
      const appError = error instanceof AppError ? error : new AppError('Failed to fetch your leave requests', 500)
      return c.json(createErrorResponse(appError.message, appError.statusCode, appError.code), appError.statusCode)
    }
  }
)

// Process leave request approval/rejection
leaveRoutes.post(
  '/requests/:id/action',
  zValidator('json', LeaveActionSchema),
  requirePermission('leave.requests.approve'),
  async (c) => {
    try {
      const id = c.req.param('id')
      const action = c.req.valid('json')
      const user = c.get('user')
      
      const result = await leaveService.processLeaveAction(id, action, user.id)
      
      return c.json(createSuccessResponse(result, `Leave request ${action.action.toLowerCase()}d successfully`))
    } catch (error) {
      const appError = error instanceof AppError ? error : new AppError('Failed to process leave action', 500)
      return c.json(createErrorResponse(appError.message, appError.statusCode, appError.code), appError.statusCode)
    }
  }
)

// ===============================
// LEAVE CALENDAR
// ===============================

// Get leave calendar
leaveRoutes.get(
  '/calendar',
  zValidator('query', LeaveCalendarQuerySchema),
  requirePermission('leave.calendar.read'),
  async (c) => {
    try {
      const query = c.req.valid('query')
      const user = c.get('user')
      
      // TODO: Implement get leave calendar
      const result = []
      
      return c.json(createSuccessResponse(result, 'Leave calendar retrieved successfully'))
    } catch (error) {
      const appError = error instanceof AppError ? error : new AppError('Failed to fetch leave calendar', 500)
      return c.json(createErrorResponse(appError.message, appError.statusCode, appError.code), appError.statusCode)
    }
  }
)

// ===============================
// LEAVE REPORTS
// ===============================

// Generate leave report
leaveRoutes.get(
  '/reports',
  zValidator('query', LeaveReportQuerySchema),
  requirePermission('leave.reports.read'),
  async (c) => {
    try {
      const query = c.req.valid('query')
      const user = c.get('user')
      
      // TODO: Implement generate leave report
      const result = {
        summary: {},
        data: [],
        metadata: {
          generatedAt: new Date().toISOString(),
          generatedBy: `${user.firstName} ${user.lastName}`,
          period: `${query.startDate} to ${query.endDate}`,
          groupBy: query.groupBy
        }
      }
      
      return c.json(createSuccessResponse(result, 'Leave report generated successfully'))
    } catch (error) {
      const appError = error instanceof AppError ? error : new AppError('Failed to generate leave report', 500)
      return c.json(createErrorResponse(appError.message, appError.statusCode, appError.code), appError.statusCode)
    }
  }
)

// Get leave statistics
leaveRoutes.get(
  '/stats',
  requirePermission('leave.stats.read'),
  async (c) => {
    try {
      const user = c.get('user')
      
      // TODO: Implement get leave statistics
      const result = {
        totalRequests: 0,
        pendingRequests: 0,
        approvedRequests: 0,
        rejectedRequests: 0,
        averageLeaveDays: 0,
        mostUsedLeaveType: '',
        upcomingLeave: [],
        recentActivity: []
      }
      
      return c.json(createSuccessResponse(result, 'Leave statistics retrieved successfully'))
    } catch (error) {
      const appError = error instanceof AppError ? error : new AppError('Failed to fetch leave statistics', 500)
      return c.json(createErrorResponse(appError.message, appError.statusCode, appError.code), appError.statusCode)
    }
  }
)

export { leaveRoutes }