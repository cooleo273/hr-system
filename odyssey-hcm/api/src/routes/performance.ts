import { Hono } from 'hono';
import { validator } from 'hono/validator';
import { PerformanceService } from '../services/performance.service';
import { 
  CreatePerformanceReviewSchema,
  UpdatePerformanceReviewSchema,
  CreateGoalSchema,
  UpdateGoalSchema,
  CreateKeyResultSchema,
  UpdateKeyResultSchema,
  GoalProgressUpdateSchema,
  CreateFeedbackSchema,
  UpdateFeedbackSchema,
  FeedbackRequestSchema,
  SuccessionPlanSchema,
  SuccessionCandidateSchema,
  CompetencySchema,
  EmployeeCompetencyAssessmentSchema,
  PerformanceSearchSchema,
  GoalSearchSchema,
  FeedbackSearchSchema,
  PerformanceAnalyticsSchema,
  GoalAnalyticsSchema,
  BulkUpdateGoalsSchema,
  BulkAssignReviewsSchema
} from '../schemas/performance.schemas';
import { authMiddleware } from '../middleware/auth.middleware';
import { permissionMiddleware } from '../middleware/permission.middleware';
import { prisma } from '../lib/prisma';

const performance = new Hono();
const performanceService = new PerformanceService(prisma);

// Apply authentication middleware to all routes
performance.use('*', authMiddleware);

// Performance Review Routes
performance.get(
  '/reviews',
  permissionMiddleware(['performance:read']),
  validator('query', (value, c) => {
    const result = PerformanceSearchSchema.safeParse(value);
    if (!result.success) {
      return c.json({ error: 'Invalid query parameters', details: result.error.errors }, 400);
    }
    return result.data;
  }),
  async (c) => {
    try {
      const params = c.req.valid('query');
      const result = await performanceService.searchPerformanceReviews(params);
      return c.json(result);
    } catch (error) {
      console.error('Error searching performance reviews:', error);
      return c.json({ error: 'Failed to search performance reviews' }, 500);
    }
  }
);

performance.get(
  '/reviews/:id',
  permissionMiddleware(['performance:read']),
  async (c) => {
    try {
      const id = c.req.param('id');
      const review = await performanceService.getPerformanceReviewById(id);
      
      if (!review) {
        return c.json({ error: 'Performance review not found' }, 404);
      }
      
      return c.json(review);
    } catch (error) {
      console.error('Error fetching performance review:', error);
      return c.json({ error: 'Failed to fetch performance review' }, 500);
    }
  }
);

performance.post(
  '/reviews',
  permissionMiddleware(['performance:write']),
  validator('json', (value, c) => {
    const result = CreatePerformanceReviewSchema.safeParse(value);
    if (!result.success) {
      return c.json({ error: 'Invalid request body', details: result.error.errors }, 400);
    }
    return result.data;
  }),
  async (c) => {
    try {
      const data = c.req.valid('json');
      const review = await performanceService.createPerformanceReview(data);
      return c.json(review, 201);
    } catch (error) {
      console.error('Error creating performance review:', error);
      return c.json({ error: 'Failed to create performance review' }, 500);
    }
  }
);

performance.put(
  '/reviews/:id',
  permissionMiddleware(['performance:write']),
  validator('json', (value, c) => {
    const result = UpdatePerformanceReviewSchema.safeParse(value);
    if (!result.success) {
      return c.json({ error: 'Invalid request body', details: result.error.errors }, 400);
    }
    return result.data;
  }),
  async (c) => {
    try {
      const id = c.req.param('id');
      const data = c.req.valid('json');
      const review = await performanceService.updatePerformanceReview(id, data);
      return c.json(review);
    } catch (error) {
      console.error('Error updating performance review:', error);
      return c.json({ error: 'Failed to update performance review' }, 500);
    }
  }
);

performance.post(
  '/reviews/bulk-assign',
  permissionMiddleware(['performance:admin']),
  validator('json', (value, c) => {
    const result = BulkAssignReviewsSchema.safeParse(value);
    if (!result.success) {
      return c.json({ error: 'Invalid request body', details: result.error.errors }, 400);
    }
    return result.data;
  }),
  async (c) => {
    try {
      const data = c.req.valid('json');
      const result = await performanceService.bulkAssignReviews(data);
      return c.json(result);
    } catch (error) {
      console.error('Error bulk assigning reviews:', error);
      return c.json({ error: 'Failed to bulk assign reviews' }, 500);
    }
  }
);

// Goal Management Routes
performance.get(
  '/goals',
  permissionMiddleware(['goals:read']),
  validator('query', (value, c) => {
    const result = GoalSearchSchema.safeParse(value);
    if (!result.success) {
      return c.json({ error: 'Invalid query parameters', details: result.error.errors }, 400);
    }
    return result.data;
  }),
  async (c) => {
    try {
      const params = c.req.valid('query');
      const result = await performanceService.searchGoals(params);
      return c.json(result);
    } catch (error) {
      console.error('Error searching goals:', error);
      return c.json({ error: 'Failed to search goals' }, 500);
    }
  }
);

performance.get(
  '/goals/:id',
  permissionMiddleware(['goals:read']),
  async (c) => {
    try {
      const id = c.req.param('id');
      const goal = await performanceService.getGoalById(id);
      
      if (!goal) {
        return c.json({ error: 'Goal not found' }, 404);
      }
      
      return c.json(goal);
    } catch (error) {
      console.error('Error fetching goal:', error);
      return c.json({ error: 'Failed to fetch goal' }, 500);
    }
  }
);

performance.post(
  '/goals',
  permissionMiddleware(['goals:write']),
  validator('json', (value, c) => {
    const result = CreateGoalSchema.safeParse(value);
    if (!result.success) {
      return c.json({ error: 'Invalid request body', details: result.error.errors }, 400);
    }
    return result.data;
  }),
  async (c) => {
    try {
      const data = c.req.valid('json');
      const goal = await performanceService.createGoal(data);
      return c.json(goal, 201);
    } catch (error) {
      console.error('Error creating goal:', error);
      return c.json({ error: 'Failed to create goal' }, 500);
    }
  }
);

performance.put(
  '/goals/:id',
  permissionMiddleware(['goals:write']),
  validator('json', (value, c) => {
    const result = UpdateGoalSchema.safeParse(value);
    if (!result.success) {
      return c.json({ error: 'Invalid request body', details: result.error.errors }, 400);
    }
    return result.data;
  }),
  async (c) => {
    try {
      const id = c.req.param('id');
      const data = c.req.valid('json');
      const goal = await performanceService.updateGoal(id, data);
      return c.json(goal);
    } catch (error) {
      console.error('Error updating goal:', error);
      return c.json({ error: 'Failed to update goal' }, 500);
    }
  }
);

performance.post(
  '/goals/bulk-update',
  permissionMiddleware(['goals:admin']),
  validator('json', (value, c) => {
    const result = BulkUpdateGoalsSchema.safeParse(value);
    if (!result.success) {
      return c.json({ error: 'Invalid request body', details: result.error.errors }, 400);
    }
    return result.data;
  }),
  async (c) => {
    try {
      const data = c.req.valid('json');
      const result = await performanceService.bulkUpdateGoals(data);
      return c.json(result);
    } catch (error) {
      console.error('Error bulk updating goals:', error);
      return c.json({ error: 'Failed to bulk update goals' }, 500);
    }
  }
);

// Key Results Routes
performance.post(
  '/goals/:goalId/key-results',
  permissionMiddleware(['goals:write']),
  validator('json', (value, c) => {
    const result = CreateKeyResultSchema.safeParse(value);
    if (!result.success) {
      return c.json({ error: 'Invalid request body', details: result.error.errors }, 400);
    }
    return result.data;
  }),
  async (c) => {
    try {
      const goalId = c.req.param('goalId');
      const data = c.req.valid('json');
      const keyResult = await performanceService.createKeyResult({
        ...data,
        goal_id: goalId
      });
      return c.json(keyResult, 201);
    } catch (error) {
      console.error('Error creating key result:', error);
      return c.json({ error: 'Failed to create key result' }, 500);
    }
  }
);

performance.put(
  '/key-results/:id',
  permissionMiddleware(['goals:write']),
  validator('json', (value, c) => {
    const result = UpdateKeyResultSchema.safeParse(value);
    if (!result.success) {
      return c.json({ error: 'Invalid request body', details: result.error.errors }, 400);
    }
    return result.data;
  }),
  async (c) => {
    try {
      const id = c.req.param('id');
      const data = c.req.valid('json');
      const keyResult = await performanceService.updateKeyResult(id, data);
      return c.json(keyResult);
    } catch (error) {
      console.error('Error updating key result:', error);
      return c.json({ error: 'Failed to update key result' }, 500);
    }
  }
);

// Goal Progress Routes
performance.post(
  '/goals/:goalId/progress',
  permissionMiddleware(['goals:write']),
  validator('json', (value, c) => {
    const result = GoalProgressUpdateSchema.safeParse(value);
    if (!result.success) {
      return c.json({ error: 'Invalid request body', details: result.error.errors }, 400);
    }
    return result.data;
  }),
  async (c) => {
    try {
      const goalId = c.req.param('goalId');
      const data = c.req.valid('json');
      const progressUpdate = await performanceService.createGoalProgressUpdate({
        ...data,
        goal_id: goalId
      });
      return c.json(progressUpdate, 201);
    } catch (error) {
      console.error('Error creating goal progress update:', error);
      return c.json({ error: 'Failed to create goal progress update' }, 500);
    }
  }
);

// Feedback Routes
performance.get(
  '/feedback',
  permissionMiddleware(['feedback:read']),
  validator('query', (value, c) => {
    const result = FeedbackSearchSchema.safeParse(value);
    if (!result.success) {
      return c.json({ error: 'Invalid query parameters', details: result.error.errors }, 400);
    }
    return result.data;
  }),
  async (c) => {
    try {
      const params = c.req.valid('query');
      const result = await performanceService.searchFeedback(params);
      return c.json(result);
    } catch (error) {
      console.error('Error searching feedback:', error);
      return c.json({ error: 'Failed to search feedback' }, 500);
    }
  }
);

performance.get(
  '/feedback/:id',
  permissionMiddleware(['feedback:read']),
  async (c) => {
    try {
      const id = c.req.param('id');
      const feedback = await performanceService.getFeedbackById(id);
      
      if (!feedback) {
        return c.json({ error: 'Feedback not found' }, 404);
      }
      
      return c.json(feedback);
    } catch (error) {
      console.error('Error fetching feedback:', error);
      return c.json({ error: 'Failed to fetch feedback' }, 500);
    }
  }
);

performance.post(
  '/feedback',
  permissionMiddleware(['feedback:write']),
  validator('json', (value, c) => {
    const result = CreateFeedbackSchema.safeParse(value);
    if (!result.success) {
      return c.json({ error: 'Invalid request body', details: result.error.errors }, 400);
    }
    return result.data;
  }),
  async (c) => {
    try {
      const data = c.req.valid('json');
      const feedback = await performanceService.createFeedback(data);
      return c.json(feedback, 201);
    } catch (error) {
      console.error('Error creating feedback:', error);
      return c.json({ error: 'Failed to create feedback' }, 500);
    }
  }
);

performance.put(
  '/feedback/:id',
  permissionMiddleware(['feedback:write']),
  validator('json', (value, c) => {
    const result = UpdateFeedbackSchema.safeParse(value);
    if (!result.success) {
      return c.json({ error: 'Invalid request body', details: result.error.errors }, 400);
    }
    return result.data;
  }),
  async (c) => {
    try {
      const id = c.req.param('id');
      const data = c.req.valid('json');
      const feedback = await performanceService.updateFeedback(id, data);
      return c.json(feedback);
    } catch (error) {
      console.error('Error updating feedback:', error);
      return c.json({ error: 'Failed to update feedback' }, 500);
    }
  }
);

// Feedback Request Routes
performance.post(
  '/feedback-requests',
  permissionMiddleware(['feedback:write']),
  validator('json', (value, c) => {
    const result = FeedbackRequestSchema.safeParse(value);
    if (!result.success) {
      return c.json({ error: 'Invalid request body', details: result.error.errors }, 400);
    }
    return result.data;
  }),
  async (c) => {
    try {
      const data = c.req.valid('json');
      const request = await performanceService.createFeedbackRequest(data);
      return c.json(request, 201);
    } catch (error) {
      console.error('Error creating feedback request:', error);
      return c.json({ error: 'Failed to create feedback request' }, 500);
    }
  }
);

// Succession Planning Routes
performance.get(
  '/succession-plans',
  permissionMiddleware(['succession:read']),
  async (c) => {
    try {
      const plans = await prisma.successionPlan.findMany({
        include: {
          position: {
            select: {
              id: true,
              title: true,
              department: true
            }
          },
          current_employee: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              email: true
            }
          },
          candidates: {
            include: {
              employee: {
                select: {
                  id: true,
                  first_name: true,
                  last_name: true,
                  email: true,
                  position: true
                }
              }
            }
          }
        }
      });
      return c.json(plans);
    } catch (error) {
      console.error('Error fetching succession plans:', error);
      return c.json({ error: 'Failed to fetch succession plans' }, 500);
    }
  }
);

performance.get(
  '/succession-plans/:id',
  permissionMiddleware(['succession:read']),
  async (c) => {
    try {
      const id = c.req.param('id');
      const plan = await prisma.successionPlan.findUnique({
        where: { id },
        include: {
          position: {
            select: {
              id: true,
              title: true,
              department: true,
              level: true,
              location: true
            }
          },
          current_employee: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              email: true,
              position: true,
              department: true
            }
          },
          candidates: {
            include: {
              employee: {
                select: {
                  id: true,
                  first_name: true,
                  last_name: true,
                  email: true,
                  position: true,
                  department: true,
                  hire_date: true
                }
              }
            },
            orderBy: {
              readiness_level: 'asc'
            }
          }
        }
      });
      
      if (!plan) {
        return c.json({ error: 'Succession plan not found' }, 404);
      }
      
      return c.json(plan);
    } catch (error) {
      console.error('Error fetching succession plan:', error);
      return c.json({ error: 'Failed to fetch succession plan' }, 500);
    }
  }
);

performance.post(
  '/succession-plans',
  permissionMiddleware(['succession:write']),
  validator('json', (value, c) => {
    const result = SuccessionPlanSchema.safeParse(value);
    if (!result.success) {
      return c.json({ error: 'Invalid request body', details: result.error.errors }, 400);
    }
    return result.data;
  }),
  async (c) => {
    try {
      const data = c.req.valid('json');
      const plan = await performanceService.createSuccessionPlan(data);
      return c.json(plan, 201);
    } catch (error) {
      console.error('Error creating succession plan:', error);
      return c.json({ error: 'Failed to create succession plan' }, 500);
    }
  }
);

performance.post(
  '/succession-plans/:planId/candidates',
  permissionMiddleware(['succession:write']),
  validator('json', (value, c) => {
    const result = SuccessionCandidateSchema.safeParse(value);
    if (!result.success) {
      return c.json({ error: 'Invalid request body', details: result.error.errors }, 400);
    }
    return result.data;
  }),
  async (c) => {
    try {
      const planId = c.req.param('planId');
      const data = c.req.valid('json');
      const candidate = await performanceService.addSuccessionCandidate({
        ...data,
        succession_plan_id: planId
      });
      return c.json(candidate, 201);
    } catch (error) {
      console.error('Error adding succession candidate:', error);
      return c.json({ error: 'Failed to add succession candidate' }, 500);
    }
  }
);

// Competency Routes
performance.get(
  '/competencies',
  permissionMiddleware(['competencies:read']),
  async (c) => {
    try {
      const competencies = await prisma.competency.findMany({
        orderBy: [
          { is_core: 'desc' },
          { category: 'asc' },
          { name: 'asc' }
        ]
      });
      return c.json(competencies);
    } catch (error) {
      console.error('Error fetching competencies:', error);
      return c.json({ error: 'Failed to fetch competencies' }, 500);
    }
  }
);

performance.post(
  '/competencies',
  permissionMiddleware(['competencies:write']),
  validator('json', (value, c) => {
    const result = CompetencySchema.safeParse(value);
    if (!result.success) {
      return c.json({ error: 'Invalid request body', details: result.error.errors }, 400);
    }
    return result.data;
  }),
  async (c) => {
    try {
      const data = c.req.valid('json');
      const competency = await performanceService.createCompetency(data);
      return c.json(competency, 201);
    } catch (error) {
      console.error('Error creating competency:', error);
      return c.json({ error: 'Failed to create competency' }, 500);
    }
  }
);

performance.post(
  '/employees/:employeeId/competency-assessments',
  permissionMiddleware(['competencies:write']),
  validator('json', (value, c) => {
    const result = EmployeeCompetencyAssessmentSchema.safeParse(value);
    if (!result.success) {
      return c.json({ error: 'Invalid request body', details: result.error.errors }, 400);
    }
    return result.data;
  }),
  async (c) => {
    try {
      const employeeId = c.req.param('employeeId');
      const data = c.req.valid('json');
      const assessment = await performanceService.assessEmployeeCompetency({
        ...data,
        employee_id: employeeId
      });
      return c.json(assessment, 201);
    } catch (error) {
      console.error('Error creating competency assessment:', error);
      return c.json({ error: 'Failed to create competency assessment' }, 500);
    }
  }
);

performance.get(
  '/employees/:employeeId/competency-assessments',
  permissionMiddleware(['competencies:read']),
  async (c) => {
    try {
      const employeeId = c.req.param('employeeId');
      const assessments = await prisma.employeeCompetencyAssessment.findMany({
        where: { employee_id: employeeId },
        include: {
          competency: true,
          assessed_by_user: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              email: true
            }
          }
        },
        orderBy: {
          assessment_date: 'desc'
        }
      });
      return c.json(assessments);
    } catch (error) {
      console.error('Error fetching competency assessments:', error);
      return c.json({ error: 'Failed to fetch competency assessments' }, 500);
    }
  }
);

// Analytics Routes
performance.get(
  '/analytics/performance',
  permissionMiddleware(['analytics:read']),
  validator('query', (value, c) => {
    const result = PerformanceAnalyticsSchema.safeParse(value);
    if (!result.success) {
      return c.json({ error: 'Invalid query parameters', details: result.error.errors }, 400);
    }
    return result.data;
  }),
  async (c) => {
    try {
      const params = c.req.valid('query');
      const analytics = await performanceService.getPerformanceAnalytics(params);
      return c.json(analytics);
    } catch (error) {
      console.error('Error getting performance analytics:', error);
      return c.json({ error: 'Failed to get performance analytics' }, 500);
    }
  }
);

performance.get(
  '/analytics/goals',
  permissionMiddleware(['analytics:read']),
  validator('query', (value, c) => {
    const result = GoalAnalyticsSchema.safeParse(value);
    if (!result.success) {
      return c.json({ error: 'Invalid query parameters', details: result.error.errors }, 400);
    }
    return result.data;
  }),
  async (c) => {
    try {
      const params = c.req.valid('query');
      const analytics = await performanceService.getGoalAnalytics(params);
      return c.json(analytics);
    } catch (error) {
      console.error('Error getting goal analytics:', error);
      return c.json({ error: 'Failed to get goal analytics' }, 500);
    }
  }
);

// Manager Dashboard Routes
performance.get(
  '/managers/:managerId/dashboard',
  permissionMiddleware(['performance:read']),
  async (c) => {
    try {
      const managerId = c.req.param('managerId');
      
      // Get manager's team overview
      const [
        teamMembers,
        pendingReviews,
        teamGoals,
        recentFeedback
      ] = await Promise.all([
        prisma.employee.findMany({
          where: { manager_id: managerId },
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
            position: true,
            performance_reviews: {
              where: { status: { in: ['in_progress', 'pending_manager'] } },
              take: 1,
              orderBy: { created_at: 'desc' }
            }
          }
        }),
        prisma.performanceReview.count({
          where: {
            reviewer_id: managerId,
            status: 'pending_manager'
          }
        }),
        prisma.goal.count({
          where: {
            manager_id: managerId,
            status: 'active'
          }
        }),
        prisma.feedback.findMany({
          where: {
            OR: [
              { from_employee_id: managerId },
              { to_employee: { manager_id: managerId } }
            ]
          },
          take: 10,
          orderBy: { created_at: 'desc' },
          include: {
            from_employee: {
              select: {
                id: true,
                first_name: true,
                last_name: true
              }
            },
            to_employee: {
              select: {
                id: true,
                first_name: true,
                last_name: true
              }
            }
          }
        })
      ]);

      return c.json({
        team_members: teamMembers,
        pending_reviews: pendingReviews,
        active_team_goals: teamGoals,
        recent_feedback: recentFeedback
      });
    } catch (error) {
      console.error('Error getting manager dashboard:', error);
      return c.json({ error: 'Failed to get manager dashboard' }, 500);
    }
  }
);

// Employee Dashboard Routes
performance.get(
  '/employees/:employeeId/dashboard',
  permissionMiddleware(['performance:read']),
  async (c) => {
    try {
      const employeeId = c.req.param('employeeId');
      
      const [
        activeGoals,
        currentReview,
        recentFeedback,
        upcomingDeadlines
      ] = await Promise.all([
        prisma.goal.findMany({
          where: {
            employee_id: employeeId,
            status: 'active'
          },
          include: {
            key_results: true
          },
          orderBy: { target_date: 'asc' },
          take: 10
        }),
        prisma.performanceReview.findFirst({
          where: {
            employee_id: employeeId,
            status: { in: ['in_progress', 'pending_employee'] }
          },
          orderBy: { created_at: 'desc' }
        }),
        prisma.feedback.findMany({
          where: { to_employee_id: employeeId },
          take: 10,
          orderBy: { created_at: 'desc' },
          include: {
            from_employee: {
              select: {
                id: true,
                first_name: true,
                last_name: true,
                is_anonymous: true
              }
            }
          }
        }),
        prisma.goal.findMany({
          where: {
            employee_id: employeeId,
            status: 'active',
            target_date: {
              lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Next 30 days
            }
          },
          orderBy: { target_date: 'asc' },
          take: 5
        })
      ]);

      return c.json({
        active_goals: activeGoals,
        current_review: currentReview,
        recent_feedback: recentFeedback,
        upcoming_deadlines: upcomingDeadlines
      });
    } catch (error) {
      console.error('Error getting employee dashboard:', error);
      return c.json({ error: 'Failed to get employee dashboard' }, 500);
    }
  }
);

export default performance;