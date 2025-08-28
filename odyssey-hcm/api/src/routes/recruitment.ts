import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { RecruitmentService } from '../services/recruitment.service';
import { authMiddleware } from '../middleware/auth';
import { validatePermissions } from '../middleware/permissions';
import {
  createJobRequisitionSchema,
  updateJobRequisitionSchema,
  jobRequisitionQuerySchema,
  createJobPostingSchema,
  updateJobPostingSchema,
  createCandidateSchema,
  updateCandidateSchema,
  createApplicationSchema,
  updateApplicationStageSchema,
  createInterviewSchema,
  updateInterviewSchema,
  interviewFeedbackSchema,
  createOfferSchema,
  updateOfferSchema,
  candidateQuerySchema,
  applicationQuerySchema,
  interviewQuerySchema,
  bulkUpdateApplicationsSchema,
  recruitmentAnalyticsQuerySchema
} from '../schemas/recruitment.schemas';

const app = new Hono();
const recruitmentService = new RecruitmentService(global.prisma);

// ============================================================================
// JOB REQUISITIONS
// ============================================================================

// Create job requisition
app.post(
  '/requisitions',
  authMiddleware,
  validatePermissions(['recruitment.requisitions.create']),
  zValidator('json', createJobRequisitionSchema),
  async (c) => {
    try {
      const data = c.req.valid('json');
      const userId = c.get('user').id;
      
      const requisition = await recruitmentService.createJobRequisition(data, userId);
      
      return c.json({
        success: true,
        data: requisition,
        message: 'Job requisition created successfully'
      }, 201);
    } catch (error) {
      return c.json({
        success: false,
        error: error.message || 'Failed to create job requisition'
      }, 400);
    }
  }
);

// Get job requisitions
app.get(
  '/requisitions',
  authMiddleware,
  validatePermissions(['recruitment.requisitions.read']),
  zValidator('query', jobRequisitionQuerySchema),
  async (c) => {
    try {
      const query = c.req.valid('query');
      const result = await recruitmentService.getJobRequisitions(query);
      
      return c.json({
        success: true,
        data: result.requisitions,
        pagination: result.pagination
      });
    } catch (error) {
      return c.json({
        success: false,
        error: error.message || 'Failed to fetch job requisitions'
      }, 400);
    }
  }
);

// Get job requisition by ID
app.get(
  '/requisitions/:id',
  authMiddleware,
  validatePermissions(['recruitment.requisitions.read']),
  async (c) => {
    try {
      const id = c.req.param('id');
      const requisition = await recruitmentService.getJobRequisitionById(id);
      
      if (!requisition) {
        return c.json({
          success: false,
          error: 'Job requisition not found'
        }, 404);
      }
      
      return c.json({
        success: true,
        data: requisition
      });
    } catch (error) {
      return c.json({
        success: false,
        error: error.message || 'Failed to fetch job requisition'
      }, 400);
    }
  }
);

// Update job requisition
app.put(
  '/requisitions/:id',
  authMiddleware,
  validatePermissions(['recruitment.requisitions.update']),
  zValidator('json', updateJobRequisitionSchema),
  async (c) => {
    try {
      const id = c.req.param('id');
      const data = c.req.valid('json');
      const userId = c.get('user').id;
      
      const requisition = await recruitmentService.updateJobRequisition(id, data, userId);
      
      return c.json({
        success: true,
        data: requisition,
        message: 'Job requisition updated successfully'
      });
    } catch (error) {
      return c.json({
        success: false,
        error: error.message || 'Failed to update job requisition'
      }, 400);
    }
  }
);

// Approve job requisition
app.post(
  '/requisitions/:id/approve',
  authMiddleware,
  validatePermissions(['recruitment.requisitions.approve']),
  zValidator('json', z.object({
    comments: z.string().optional()
  })),
  async (c) => {
    try {
      const id = c.req.param('id');
      const { comments } = c.req.valid('json');
      const userId = c.get('user').id;
      
      const requisition = await recruitmentService.approveJobRequisition(id, userId, comments);
      
      return c.json({
        success: true,
        data: requisition,
        message: 'Job requisition approved successfully'
      });
    } catch (error) {
      return c.json({
        success: false,
        error: error.message || 'Failed to approve job requisition'
      }, 400);
    }
  }
);

// ============================================================================
// JOB POSTINGS
// ============================================================================

// Create job posting
app.post(
  '/postings',
  authMiddleware,
  validatePermissions(['recruitment.postings.create']),
  zValidator('json', createJobPostingSchema),
  async (c) => {
    try {
      const data = c.req.valid('json');
      const userId = c.get('user').id;
      
      const posting = await recruitmentService.createJobPosting(data, userId);
      
      return c.json({
        success: true,
        data: posting,
        message: 'Job posting created successfully'
      }, 201);
    } catch (error) {
      return c.json({
        success: false,
        error: error.message || 'Failed to create job posting'
      }, 400);
    }
  }
);

// Get active job postings (public endpoint)
app.get('/postings/public', async (c) => {
  try {
    const location = c.req.query('location');
    const department = c.req.query('department');
    
    const postings = await recruitmentService.getActiveJobPostings(location, department);
    
    return c.json({
      success: true,
      data: postings
    });
  } catch (error) {
    return c.json({
      success: false,
      error: error.message || 'Failed to fetch job postings'
    }, 400);
  }
});

// Get job posting by slug (public endpoint)
app.get('/postings/public/:slug', async (c) => {
  try {
    const slug = c.req.param('slug');
    const posting = await recruitmentService.getJobPostingBySlug(slug);
    
    if (!posting) {
      return c.json({
        success: false,
        error: 'Job posting not found'
      }, 404);
    }
    
    return c.json({
      success: true,
      data: posting
    });
  } catch (error) {
    return c.json({
      success: false,
      error: error.message || 'Failed to fetch job posting'
    }, 400);
  }
});

// Update job posting
app.put(
  '/postings/:id',
  authMiddleware,
  validatePermissions(['recruitment.postings.update']),
  zValidator('json', updateJobPostingSchema),
  async (c) => {
    try {
      const id = c.req.param('id');
      const data = c.req.valid('json');
      const userId = c.get('user').id;
      
      const posting = await recruitmentService.updateJobPosting(id, data, userId);
      
      return c.json({
        success: true,
        data: posting,
        message: 'Job posting updated successfully'
      });
    } catch (error) {
      return c.json({
        success: false,
        error: error.message || 'Failed to update job posting'
      }, 400);
    }
  }
);

// ============================================================================
// CANDIDATES
// ============================================================================

// Create candidate
app.post(
  '/candidates',
  zValidator('json', createCandidateSchema),
  async (c) => {
    try {
      const data = c.req.valid('json');
      const candidate = await recruitmentService.createCandidate(data);
      
      return c.json({
        success: true,
        data: candidate,
        message: 'Candidate profile created successfully'
      }, 201);
    } catch (error) {
      return c.json({
        success: false,
        error: error.message || 'Failed to create candidate profile'
      }, 400);
    }
  }
);

// Search candidates
app.get(
  '/candidates',
  authMiddleware,
  validatePermissions(['recruitment.candidates.read']),
  zValidator('query', candidateQuerySchema),
  async (c) => {
    try {
      const query = c.req.valid('query');
      const result = await recruitmentService.searchCandidates(query);
      
      return c.json({
        success: true,
        data: result.candidates,
        pagination: result.pagination
      });
    } catch (error) {
      return c.json({
        success: false,
        error: error.message || 'Failed to search candidates'
      }, 400);
    }
  }
);

// Get candidate by ID
app.get(
  '/candidates/:id',
  authMiddleware,
  validatePermissions(['recruitment.candidates.read']),
  async (c) => {
    try {
      const id = c.req.param('id');
      const candidate = await recruitmentService.getCandidateById(id);
      
      if (!candidate) {
        return c.json({
          success: false,
          error: 'Candidate not found'
        }, 404);
      }
      
      return c.json({
        success: true,
        data: candidate
      });
    } catch (error) {
      return c.json({
        success: false,
        error: error.message || 'Failed to fetch candidate'
      }, 400);
    }
  }
);

// Update candidate
app.put(
  '/candidates/:id',
  authMiddleware,
  validatePermissions(['recruitment.candidates.update']),
  zValidator('json', updateCandidateSchema),
  async (c) => {
    try {
      const id = c.req.param('id');
      const data = c.req.valid('json');
      
      const candidate = await recruitmentService.updateCandidate(id, data);
      
      return c.json({
        success: true,
        data: candidate,
        message: 'Candidate updated successfully'
      });
    } catch (error) {
      return c.json({
        success: false,
        error: error.message || 'Failed to update candidate'
      }, 400);
    }
  }
);

// ============================================================================
// APPLICATIONS
// ============================================================================

// Submit application (public endpoint)
app.post(
  '/applications',
  zValidator('json', createApplicationSchema),
  async (c) => {
    try {
      const data = c.req.valid('json');
      const application = await recruitmentService.createApplication(data);
      
      return c.json({
        success: true,
        data: application,
        message: 'Application submitted successfully'
      }, 201);
    } catch (error) {
      return c.json({
        success: false,
        error: error.message || 'Failed to submit application'
      }, 400);
    }
  }
);

// Get applications
app.get(
  '/applications',
  authMiddleware,
  validatePermissions(['recruitment.applications.read']),
  zValidator('query', applicationQuerySchema),
  async (c) => {
    try {
      const query = c.req.valid('query');
      const result = await recruitmentService.getApplications(query);
      
      return c.json({
        success: true,
        data: result.applications,
        pagination: result.pagination
      });
    } catch (error) {
      return c.json({
        success: false,
        error: error.message || 'Failed to fetch applications'
      }, 400);
    }
  }
);

// Get application by ID
app.get(
  '/applications/:id',
  authMiddleware,
  validatePermissions(['recruitment.applications.read']),
  async (c) => {
    try {
      const id = c.req.param('id');
      const application = await recruitmentService.getApplicationById(id);
      
      if (!application) {
        return c.json({
          success: false,
          error: 'Application not found'
        }, 404);
      }
      
      return c.json({
        success: true,
        data: application
      });
    } catch (error) {
      return c.json({
        success: false,
        error: error.message || 'Failed to fetch application'
      }, 400);
    }
  }
);

// Update application stage
app.put(
  '/applications/:id/stage',
  authMiddleware,
  validatePermissions(['recruitment.applications.update']),
  zValidator('json', updateApplicationStageSchema),
  async (c) => {
    try {
      const id = c.req.param('id');
      const data = { ...c.req.valid('json'), applicationId: id };
      const userId = c.get('user').id;
      
      const application = await recruitmentService.updateApplicationStage(data, userId);
      
      return c.json({
        success: true,
        data: application,
        message: 'Application stage updated successfully'
      });
    } catch (error) {
      return c.json({
        success: false,
        error: error.message || 'Failed to update application stage'
      }, 400);
    }
  }
);

// Bulk update applications
app.put(
  '/applications/bulk',
  authMiddleware,
  validatePermissions(['recruitment.applications.update']),
  zValidator('json', bulkUpdateApplicationsSchema),
  async (c) => {
    try {
      const data = c.req.valid('json');
      const userId = c.get('user').id;
      
      const result = await recruitmentService.bulkUpdateApplications(data, userId);
      
      return c.json({
        success: true,
        data: result,
        message: 'Applications updated successfully'
      });
    } catch (error) {
      return c.json({
        success: false,
        error: error.message || 'Failed to update applications'
      }, 400);
    }
  }
);

// ============================================================================
// INTERVIEWS
// ============================================================================

// Schedule interview
app.post(
  '/interviews',
  authMiddleware,
  validatePermissions(['recruitment.interviews.create']),
  zValidator('json', createInterviewSchema),
  async (c) => {
    try {
      const data = c.req.valid('json');
      const userId = c.get('user').id;
      
      const interview = await recruitmentService.scheduleInterview(data, userId);
      
      return c.json({
        success: true,
        data: interview,
        message: 'Interview scheduled successfully'
      }, 201);
    } catch (error) {
      return c.json({
        success: false,
        error: error.message || 'Failed to schedule interview'
      }, 400);
    }
  }
);

// Get interviews
app.get(
  '/interviews',
  authMiddleware,
  validatePermissions(['recruitment.interviews.read']),
  zValidator('query', interviewQuerySchema),
  async (c) => {
    try {
      const query = c.req.valid('query');
      const result = await recruitmentService.getInterviews(query);
      
      return c.json({
        success: true,
        data: result.interviews,
        pagination: result.pagination
      });
    } catch (error) {
      return c.json({
        success: false,
        error: error.message || 'Failed to fetch interviews'
      }, 400);
    }
  }
);

// Update interview
app.put(
  '/interviews/:id',
  authMiddleware,
  validatePermissions(['recruitment.interviews.update']),
  zValidator('json', updateInterviewSchema),
  async (c) => {
    try {
      const id = c.req.param('id');
      const data = c.req.valid('json');
      const userId = c.get('user').id;
      
      const interview = await recruitmentService.updateInterview(id, data, userId);
      
      return c.json({
        success: true,
        data: interview,
        message: 'Interview updated successfully'
      });
    } catch (error) {
      return c.json({
        success: false,
        error: error.message || 'Failed to update interview'
      }, 400);
    }
  }
);

// Submit interview feedback
app.post(
  '/interviews/:id/feedback',
  authMiddleware,
  validatePermissions(['recruitment.interviews.feedback']),
  zValidator('json', interviewFeedbackSchema),
  async (c) => {
    try {
      const id = c.req.param('id');
      const data = { ...c.req.valid('json'), interviewId: id };
      
      const feedback = await recruitmentService.submitInterviewFeedback(data);
      
      return c.json({
        success: true,
        data: feedback,
        message: 'Interview feedback submitted successfully'
      }, 201);
    } catch (error) {
      return c.json({
        success: false,
        error: error.message || 'Failed to submit interview feedback'
      }, 400);
    }
  }
);

// ============================================================================
// OFFERS
// ============================================================================

// Create offer
app.post(
  '/offers',
  authMiddleware,
  validatePermissions(['recruitment.offers.create']),
  zValidator('json', createOfferSchema),
  async (c) => {
    try {
      const data = c.req.valid('json');
      const userId = c.get('user').id;
      
      const offer = await recruitmentService.createOffer(data, userId);
      
      return c.json({
        success: true,
        data: offer,
        message: 'Offer created successfully'
      }, 201);
    } catch (error) {
      return c.json({
        success: false,
        error: error.message || 'Failed to create offer'
      }, 400);
    }
  }
);

// Update offer
app.put(
  '/offers/:id',
  authMiddleware,
  validatePermissions(['recruitment.offers.update']),
  zValidator('json', updateOfferSchema),
  async (c) => {
    try {
      const id = c.req.param('id');
      const data = c.req.valid('json');
      const userId = c.get('user').id;
      
      const offer = await recruitmentService.updateOffer(id, data, userId);
      
      return c.json({
        success: true,
        data: offer,
        message: 'Offer updated successfully'
      });
    } catch (error) {
      return c.json({
        success: false,
        error: error.message || 'Failed to update offer'
      }, 400);
    }
  }
);

// ============================================================================
// ANALYTICS & REPORTING
// ============================================================================

// Get recruitment analytics
app.get(
  '/analytics',
  authMiddleware,
  validatePermissions(['recruitment.analytics.read']),
  zValidator('query', recruitmentAnalyticsQuerySchema),
  async (c) => {
    try {
      const query = c.req.valid('query');
      const analytics = await recruitmentService.getRecruitmentAnalytics(query);
      
      return c.json({
        success: true,
        data: analytics
      });
    } catch (error) {
      return c.json({
        success: false,
        error: error.message || 'Failed to fetch recruitment analytics'
      }, 400);
    }
  }
);

// Get recruitment dashboard data
app.get(
  '/dashboard',
  authMiddleware,
  validatePermissions(['recruitment.dashboard.read']),
  async (c) => {
    try {
      const today = new Date();
      const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
      
      const [
        activeRequisitions,
        activePostings,
        recentApplications,
        pendingInterviews,
        pendingOffers
      ] = await Promise.all([
        recruitmentService.getJobRequisitions({
          status: 'approved',
          page: 1,
          limit: 10
        }),
        recruitmentService.getActiveJobPostings(),
        recruitmentService.getApplications({
          appliedAfter: thirtyDaysAgo.toISOString(),
          page: 1,
          limit: 10
        }),
        recruitmentService.getInterviews({
          status: 'scheduled',
          scheduledAfter: today.toISOString(),
          page: 1,
          limit: 10
        }),
        // Pending offers would require additional service methods
      ]);
      
      return c.json({
        success: true,
        data: {
          activeRequisitions: activeRequisitions.requisitions.length,
          activePostings: activePostings.length,
          recentApplications: recentApplications.applications.length,
          pendingInterviews: pendingInterviews.interviews.length,
          pendingOffers: 0 // Placeholder
        }
      });
    } catch (error) {
      return c.json({
        success: false,
        error: error.message || 'Failed to fetch dashboard data'
      }, 400);
    }
  }
);

export default app;