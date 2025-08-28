import { PrismaClient } from '@prisma/client';
import { 
  PerformanceReview, 
  CreatePerformanceReview, 
  UpdatePerformanceReview,
  Goal, 
  CreateGoal, 
  UpdateGoal,
  KeyResult,
  CreateKeyResult,
  UpdateKeyResult,
  GoalProgressUpdate,
  Feedback, 
  CreateFeedback, 
  UpdateFeedback,
  FeedbackRequest,
  SuccessionPlan,
  SuccessionCandidate,
  Competency,
  EmployeeCompetencyAssessment,
  PerformanceSearch,
  GoalSearch,
  FeedbackSearch,
  PerformanceAnalytics,
  GoalAnalytics,
  BulkUpdateGoals,
  BulkAssignReviews
} from '../schemas/performance.schemas';

export class PerformanceService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  // Performance Review Methods
  async createPerformanceReview(data: CreatePerformanceReview): Promise<PerformanceReview> {
    try {
      const reviewNumber = await this.generateReviewNumber();
      
      const review = await this.prisma.performanceReview.create({
        data: {
          ...data,
          review_number: reviewNumber,
          status: data.status || 'draft'
        },
        include: {
          employee: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              email: true,
              employee_number: true
            }
          },
          reviewer: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              email: true
            }
          }
        }
      });

      // Create audit log
      await this.createAuditLog('performance_review', review.id, 'created', data);

      return review as PerformanceReview;
    } catch (error) {
      console.error('Error creating performance review:', error);
      throw new Error('Failed to create performance review');
    }
  }

  async getPerformanceReviewById(id: string): Promise<PerformanceReview | null> {
    try {
      const review = await this.prisma.performanceReview.findUnique({
        where: { id },
        include: {
          employee: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              email: true,
              employee_number: true,
              department: true,
              position: true
            }
          },
          reviewer: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              email: true
            }
          },
          responses: {
            include: {
              question: true
            }
          }
        }
      });

      return review as PerformanceReview;
    } catch (error) {
      console.error('Error fetching performance review:', error);
      throw new Error('Failed to fetch performance review');
    }
  }

  async updatePerformanceReview(id: string, data: UpdatePerformanceReview): Promise<PerformanceReview> {
    try {
      const review = await this.prisma.performanceReview.update({
        where: { id },
        data: {
          ...data,
          updated_at: new Date().toISOString()
        },
        include: {
          employee: true,
          reviewer: true
        }
      });

      // Create audit log
      await this.createAuditLog('performance_review', id, 'updated', data);

      return review as PerformanceReview;
    } catch (error) {
      console.error('Error updating performance review:', error);
      throw new Error('Failed to update performance review');
    }
  }

  async searchPerformanceReviews(params: PerformanceSearch) {
    try {
      const {
        search,
        employee_id,
        reviewer_id,
        status,
        review_type,
        department_id,
        date_from,
        date_to,
        rating_min,
        rating_max,
        page = 1,
        limit = 10,
        sort_by = 'updated_at',
        sort_order = 'desc'
      } = params;

      const skip = (page - 1) * limit;

      const where: any = {};

      if (search) {
        where.OR = [
          { employee: { first_name: { contains: search, mode: 'insensitive' } } },
          { employee: { last_name: { contains: search, mode: 'insensitive' } } },
          { employee: { email: { contains: search, mode: 'insensitive' } } },
          { review_number: { contains: search, mode: 'insensitive' } }
        ];
      }

      if (employee_id) where.employee_id = employee_id;
      if (reviewer_id) where.reviewer_id = reviewer_id;
      if (status) where.status = status;
      if (review_type) where.review_type = review_type;
      if (department_id) where.employee = { department_id: department_id };
      
      if (date_from || date_to) {
        where.review_period_start = {};
        if (date_from) where.review_period_start.gte = new Date(date_from);
        if (date_to) where.review_period_start.lte = new Date(date_to);
      }

      if (rating_min || rating_max) {
        where.overall_rating = {};
        if (rating_min) where.overall_rating.gte = rating_min;
        if (rating_max) where.overall_rating.lte = rating_max;
      }

      const [reviews, total] = await Promise.all([
        this.prisma.performanceReview.findMany({
          where,
          include: {
            employee: {
              select: {
                id: true,
                first_name: true,
                last_name: true,
                email: true,
                employee_number: true,
                department: true,
                position: true
              }
            },
            reviewer: {
              select: {
                id: true,
                first_name: true,
                last_name: true,
                email: true
              }
            }
          },
          orderBy: { [sort_by]: sort_order },
          skip,
          take: limit
        }),
        this.prisma.performanceReview.count({ where })
      ]);

      return {
        reviews,
        pagination: {
          total,
          pages: Math.ceil(total / limit),
          page,
          limit
        }
      };
    } catch (error) {
      console.error('Error searching performance reviews:', error);
      throw new Error('Failed to search performance reviews');
    }
  }

  async bulkAssignReviews(data: BulkAssignReviews) {
    try {
      const { employee_ids, review_template_id, review_period_start, review_period_end, self_assessment_deadline, manager_review_deadline } = data;

      const reviews = await Promise.all(
        employee_ids.map(async (employee_id) => {
          // Get employee's manager
          const employee = await this.prisma.employee.findUnique({
            where: { id: employee_id },
            select: { manager_id: true }
          });

          if (!employee?.manager_id) {
            throw new Error(`Employee ${employee_id} has no assigned manager`);
          }

          const reviewNumber = await this.generateReviewNumber();

          return this.prisma.performanceReview.create({
            data: {
              employee_id,
              reviewer_id: employee.manager_id,
              review_number: reviewNumber,
              review_period_start,
              review_period_end,
              review_type: 'annual',
              status: 'draft',
              self_assessment_deadline,
              manager_review_deadline
            }
          });
        })
      );

      return { created_reviews: reviews.length, reviews };
    } catch (error) {
      console.error('Error bulk assigning reviews:', error);
      throw new Error('Failed to bulk assign reviews');
    }
  }

  // Goal Management Methods
  async createGoal(data: CreateGoal): Promise<Goal> {
    try {
      const goal = await this.prisma.goal.create({
        data: {
          ...data,
          start_date: data.start_date || new Date().toISOString().split('T')[0]
        },
        include: {
          employee: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              email: true
            }
          },
          manager: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              email: true
            }
          },
          parent_goal: {
            select: {
              id: true,
              title: true,
              category: true
            }
          },
          key_results: true
        }
      });

      // Create audit log
      await this.createAuditLog('goal', goal.id, 'created', data);

      return goal as Goal;
    } catch (error) {
      console.error('Error creating goal:', error);
      throw new Error('Failed to create goal');
    }
  }

  async getGoalById(id: string): Promise<Goal | null> {
    try {
      const goal = await this.prisma.goal.findUnique({
        where: { id },
        include: {
          employee: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              email: true,
              department: true,
              position: true
            }
          },
          manager: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              email: true
            }
          },
          parent_goal: {
            select: {
              id: true,
              title: true,
              category: true,
              progress_percentage: true
            }
          },
          child_goals: {
            select: {
              id: true,
              title: true,
              category: true,
              status: true,
              progress_percentage: true,
              target_date: true
            }
          },
          key_results: true,
          progress_updates: {
            orderBy: { created_at: 'desc' },
            take: 10,
            include: {
              updated_by_user: {
                select: {
                  id: true,
                  first_name: true,
                  last_name: true
                }
              }
            }
          }
        }
      });

      return goal as Goal;
    } catch (error) {
      console.error('Error fetching goal:', error);
      throw new Error('Failed to fetch goal');
    }
  }

  async updateGoal(id: string, data: UpdateGoal): Promise<Goal> {
    try {
      const currentGoal = await this.prisma.goal.findUnique({
        where: { id },
        select: { progress_percentage: true }
      });

      const goal = await this.prisma.goal.update({
        where: { id },
        data: {
          ...data,
          updated_at: new Date().toISOString(),
          completion_date: data.status === 'completed' && !data.completion_date 
            ? new Date().toISOString().split('T')[0] 
            : data.completion_date
        },
        include: {
          employee: true,
          manager: true,
          key_results: true
        }
      });

      // Create progress update if progress changed
      if (data.progress_percentage !== undefined && currentGoal && data.progress_percentage !== currentGoal.progress_percentage) {
        await this.createGoalProgressUpdate({
          goal_id: id,
          updated_by: data.updated_by || goal.employee_id,
          previous_progress: currentGoal.progress_percentage,
          new_progress: data.progress_percentage,
          update_notes: `Progress updated to ${data.progress_percentage}%`
        });
      }

      // Create audit log
      await this.createAuditLog('goal', id, 'updated', data);

      return goal as Goal;
    } catch (error) {
      console.error('Error updating goal:', error);
      throw new Error('Failed to update goal');
    }
  }

  async searchGoals(params: GoalSearch) {
    try {
      const {
        search,
        employee_id,
        manager_id,
        category,
        status,
        priority,
        due_date_from,
        due_date_to,
        progress_min,
        progress_max,
        tags,
        page = 1,
        limit = 10,
        sort_by = 'updated_at',
        sort_order = 'desc'
      } = params;

      const skip = (page - 1) * limit;

      const where: any = {};

      if (search) {
        where.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { employee: { first_name: { contains: search, mode: 'insensitive' } } },
          { employee: { last_name: { contains: search, mode: 'insensitive' } } }
        ];
      }

      if (employee_id) where.employee_id = employee_id;
      if (manager_id) where.manager_id = manager_id;
      if (category) where.category = category;
      if (status) where.status = status;
      if (priority) where.priority = priority;
      
      if (due_date_from || due_date_to) {
        where.target_date = {};
        if (due_date_from) where.target_date.gte = new Date(due_date_from);
        if (due_date_to) where.target_date.lte = new Date(due_date_to);
      }

      if (progress_min || progress_max) {
        where.progress_percentage = {};
        if (progress_min) where.progress_percentage.gte = progress_min;
        if (progress_max) where.progress_percentage.lte = progress_max;
      }

      if (tags && tags.length > 0) {
        where.tags = {
          hasSome: tags
        };
      }

      const [goals, total] = await Promise.all([
        this.prisma.goal.findMany({
          where,
          include: {
            employee: {
              select: {
                id: true,
                first_name: true,
                last_name: true,
                email: true,
                department: true,
                position: true
              }
            },
            manager: {
              select: {
                id: true,
                first_name: true,
                last_name: true,
                email: true
              }
            },
            parent_goal: {
              select: {
                id: true,
                title: true,
                category: true
              }
            },
            key_results: true,
            _count: {
              select: {
                child_goals: true
              }
            }
          },
          orderBy: { [sort_by]: sort_order },
          skip,
          take: limit
        }),
        this.prisma.goal.count({ where })
      ]);

      return {
        goals,
        pagination: {
          total,
          pages: Math.ceil(total / limit),
          page,
          limit
        }
      };
    } catch (error) {
      console.error('Error searching goals:', error);
      throw new Error('Failed to search goals');
    }
  }

  async bulkUpdateGoals(data: BulkUpdateGoals) {
    try {
      const { goal_ids, updates } = data;

      const goals = await Promise.all(
        goal_ids.map(id => this.updateGoal(id, updates))
      );

      return { updated_goals: goals.length, goals };
    } catch (error) {
      console.error('Error bulk updating goals:', error);
      throw new Error('Failed to bulk update goals');
    }
  }

  // Key Results Methods
  async createKeyResult(data: CreateKeyResult): Promise<KeyResult> {
    try {
      const keyResult = await this.prisma.keyResult.create({
        data,
        include: {
          goal: {
            select: {
              id: true,
              title: true,
              employee_id: true
            }
          }
        }
      });

      return keyResult as KeyResult;
    } catch (error) {
      console.error('Error creating key result:', error);
      throw new Error('Failed to create key result');
    }
  }

  async updateKeyResult(id: string, data: UpdateKeyResult): Promise<KeyResult> {
    try {
      const keyResult = await this.prisma.keyResult.update({
        where: { id },
        data: {
          ...data,
          updated_at: new Date().toISOString()
        },
        include: {
          goal: true
        }
      });

      // Update parent goal progress based on key results
      await this.updateGoalProgressFromKeyResults(keyResult.goal_id);

      return keyResult as KeyResult;
    } catch (error) {
      console.error('Error updating key result:', error);
      throw new Error('Failed to update key result');
    }
  }

  // Goal Progress Methods
  async createGoalProgressUpdate(data: GoalProgressUpdate): Promise<GoalProgressUpdate> {
    try {
      const progressUpdate = await this.prisma.goalProgressUpdate.create({
        data,
        include: {
          goal: {
            select: {
              id: true,
              title: true,
              employee_id: true
            }
          },
          updated_by_user: {
            select: {
              id: true,
              first_name: true,
              last_name: true
            }
          }
        }
      });

      return progressUpdate as GoalProgressUpdate;
    } catch (error) {
      console.error('Error creating goal progress update:', error);
      throw new Error('Failed to create goal progress update');
    }
  }

  private async updateGoalProgressFromKeyResults(goalId: string) {
    try {
      const keyResults = await this.prisma.keyResult.findMany({
        where: { goal_id: goalId }
      });

      if (keyResults.length === 0) return;

      let totalProgress = 0;
      let totalWeight = 0;

      keyResults.forEach(kr => {
        const progress = kr.is_binary 
          ? (kr.current_value >= kr.target_value ? 100 : 0)
          : Math.min((kr.current_value / kr.target_value) * 100, 100);
        
        totalProgress += progress * kr.weight;
        totalWeight += kr.weight;
      });

      const averageProgress = totalWeight > 0 ? totalProgress / totalWeight : 0;

      await this.prisma.goal.update({
        where: { id: goalId },
        data: { progress_percentage: Math.round(averageProgress) }
      });
    } catch (error) {
      console.error('Error updating goal progress from key results:', error);
    }
  }

  // Feedback Methods
  async createFeedback(data: CreateFeedback): Promise<Feedback> {
    try {
      const feedback = await this.prisma.feedback.create({
        data,
        include: {
          from_employee: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              email: true,
              position: true
            }
          },
          to_employee: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              email: true,
              position: true
            }
          }
        }
      });

      // Create audit log
      await this.createAuditLog('feedback', feedback.id, 'created', data);

      return feedback as Feedback;
    } catch (error) {
      console.error('Error creating feedback:', error);
      throw new Error('Failed to create feedback');
    }
  }

  async getFeedbackById(id: string): Promise<Feedback | null> {
    try {
      const feedback = await this.prisma.feedback.findUnique({
        where: { id },
        include: {
          from_employee: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              email: true,
              position: true,
              department: true
            }
          },
          to_employee: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              email: true,
              position: true,
              department: true
            }
          },
          project: {
            select: {
              id: true,
              name: true
            }
          },
          goal: {
            select: {
              id: true,
              title: true
            }
          }
        }
      });

      return feedback as Feedback;
    } catch (error) {
      console.error('Error fetching feedback:', error);
      throw new Error('Failed to fetch feedback');
    }
  }

  async searchFeedback(params: FeedbackSearch) {
    try {
      const {
        search,
        from_employee_id,
        to_employee_id,
        feedback_type,
        is_anonymous,
        tags,
        date_from,
        date_to,
        page = 1,
        limit = 10,
        sort_by = 'created_at',
        sort_order = 'desc'
      } = params;

      const skip = (page - 1) * limit;

      const where: any = {};

      if (search) {
        where.OR = [
          { subject: { contains: search, mode: 'insensitive' } },
          { content: { contains: search, mode: 'insensitive' } },
          { from_employee: { first_name: { contains: search, mode: 'insensitive' } } },
          { from_employee: { last_name: { contains: search, mode: 'insensitive' } } },
          { to_employee: { first_name: { contains: search, mode: 'insensitive' } } },
          { to_employee: { last_name: { contains: search, mode: 'insensitive' } } }
        ];
      }

      if (from_employee_id) where.from_employee_id = from_employee_id;
      if (to_employee_id) where.to_employee_id = to_employee_id;
      if (feedback_type) where.feedback_type = feedback_type;
      if (is_anonymous !== undefined) where.is_anonymous = is_anonymous;
      
      if (date_from || date_to) {
        where.created_at = {};
        if (date_from) where.created_at.gte = new Date(date_from);
        if (date_to) where.created_at.lte = new Date(date_to);
      }

      if (tags && tags.length > 0) {
        where.tags = {
          hasSome: tags
        };
      }

      const [feedback, total] = await Promise.all([
        this.prisma.feedback.findMany({
          where,
          include: {
            from_employee: {
              select: {
                id: true,
                first_name: true,
                last_name: true,
                email: true,
                position: true
              }
            },
            to_employee: {
              select: {
                id: true,
                first_name: true,
                last_name: true,
                email: true,
                position: true
              }
            }
          },
          orderBy: { [sort_by]: sort_order },
          skip,
          take: limit
        }),
        this.prisma.feedback.count({ where })
      ]);

      return {
        feedback,
        pagination: {
          total,
          pages: Math.ceil(total / limit),
          page,
          limit
        }
      };
    } catch (error) {
      console.error('Error searching feedback:', error);
      throw new Error('Failed to search feedback');
    }
  }

  async createFeedbackRequest(data: FeedbackRequest): Promise<FeedbackRequest> {
    try {
      const request = await this.prisma.feedbackRequest.create({
        data,
        include: {
          requester: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              email: true
            }
          },
          requested_from: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              email: true
            }
          }
        }
      });

      return request as FeedbackRequest;
    } catch (error) {
      console.error('Error creating feedback request:', error);
      throw new Error('Failed to create feedback request');
    }
  }

  // Succession Planning Methods
  async createSuccessionPlan(data: SuccessionPlan): Promise<SuccessionPlan> {
    try {
      const plan = await this.prisma.successionPlan.create({
        data,
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
          }
        }
      });

      return plan as SuccessionPlan;
    } catch (error) {
      console.error('Error creating succession plan:', error);
      throw new Error('Failed to create succession plan');
    }
  }

  async addSuccessionCandidate(data: SuccessionCandidate): Promise<SuccessionCandidate> {
    try {
      const candidate = await this.prisma.successionCandidate.create({
        data,
        include: {
          succession_plan: {
            include: {
              position: true
            }
          },
          employee: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              email: true,
              position: true,
              department: true
            }
          }
        }
      });

      return candidate as SuccessionCandidate;
    } catch (error) {
      console.error('Error adding succession candidate:', error);
      throw new Error('Failed to add succession candidate');
    }
  }

  // Competency Methods
  async createCompetency(data: Competency): Promise<Competency> {
    try {
      const competency = await this.prisma.competency.create({
        data
      });

      return competency as Competency;
    } catch (error) {
      console.error('Error creating competency:', error);
      throw new Error('Failed to create competency');
    }
  }

  async assessEmployeeCompetency(data: EmployeeCompetencyAssessment): Promise<EmployeeCompetencyAssessment> {
    try {
      const assessment = await this.prisma.employeeCompetencyAssessment.create({
        data,
        include: {
          employee: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              email: true
            }
          },
          competency: true,
          assessed_by_user: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              email: true
            }
          }
        }
      });

      return assessment as EmployeeCompetencyAssessment;
    } catch (error) {
      console.error('Error assessing employee competency:', error);
      throw new Error('Failed to assess employee competency');
    }
  }

  // Analytics Methods
  async getPerformanceAnalytics(params: PerformanceAnalytics) {
    try {
      const { department_id, date_from, date_to, review_type, include_competencies, include_goals, include_feedback } = params;

      const where: any = {};
      
      if (department_id) {
        where.employee = { department_id };
      }
      
      if (date_from || date_to) {
        where.review_period_start = {};
        if (date_from) where.review_period_start.gte = new Date(date_from);
        if (date_to) where.review_period_start.lte = new Date(date_to);
      }
      
      if (review_type) {
        where.review_type = review_type;
      }

      // Get basic performance metrics
      const [
        totalReviews,
        completedReviews,
        averageRating,
        ratingDistribution
      ] = await Promise.all([
        this.prisma.performanceReview.count({ where }),
        this.prisma.performanceReview.count({ 
          where: { ...where, status: 'completed' } 
        }),
        this.prisma.performanceReview.aggregate({
          where: { ...where, overall_rating: { not: null } },
          _avg: { overall_rating: true }
        }),
        this.prisma.performanceReview.groupBy({
          by: ['overall_rating'],
          where: { ...where, overall_rating: { not: null } },
          _count: true
        })
      ]);

      const analytics: any = {
        total_reviews: totalReviews,
        completed_reviews: completedReviews,
        completion_rate: totalReviews > 0 ? (completedReviews / totalReviews) * 100 : 0,
        average_rating: averageRating._avg.overall_rating || 0,
        rating_distribution: ratingDistribution.map(item => ({
          rating: item.overall_rating,
          count: item._count
        }))
      };

      // Include additional analytics if requested
      if (include_goals) {
        const goalMetrics = await this.getGoalAnalytics({
          department_id,
          date_from,
          date_to
        });
        analytics.goal_metrics = goalMetrics;
      }

      if (include_feedback) {
        const feedbackCount = await this.prisma.feedback.count({
          where: {
            ...(department_id && {
              OR: [
                { from_employee: { department_id } },
                { to_employee: { department_id } }
              ]
            }),
            ...(date_from || date_to) && {
              created_at: {
                ...(date_from && { gte: new Date(date_from) }),
                ...(date_to && { lte: new Date(date_to) })
              }
            }
          }
        });
        analytics.feedback_count = feedbackCount;
      }

      return analytics;
    } catch (error) {
      console.error('Error getting performance analytics:', error);
      throw new Error('Failed to get performance analytics');
    }
  }

  async getGoalAnalytics(params: GoalAnalytics) {
    try {
      const { department_id, date_from, date_to, category, include_key_results } = params;

      const where: any = {};
      
      if (department_id) {
        where.employee = { department_id };
      }
      
      if (date_from || date_to) {
        where.target_date = {};
        if (date_from) where.target_date.gte = new Date(date_from);
        if (date_to) where.target_date.lte = new Date(date_to);
      }
      
      if (category) {
        where.category = category;
      }

      const [
        totalGoals,
        completedGoals,
        averageProgress,
        statusDistribution,
        categoryDistribution
      ] = await Promise.all([
        this.prisma.goal.count({ where }),
        this.prisma.goal.count({ 
          where: { ...where, status: 'completed' } 
        }),
        this.prisma.goal.aggregate({
          where,
          _avg: { progress_percentage: true }
        }),
        this.prisma.goal.groupBy({
          by: ['status'],
          where,
          _count: true
        }),
        this.prisma.goal.groupBy({
          by: ['category'],
          where,
          _count: true
        })
      ]);

      const analytics: any = {
        total_goals: totalGoals,
        completed_goals: completedGoals,
        completion_rate: totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0,
        average_progress: averageProgress._avg.progress_percentage || 0,
        status_distribution: statusDistribution.map(item => ({
          status: item.status,
          count: item._count
        })),
        category_distribution: categoryDistribution.map(item => ({
          category: item.category,
          count: item._count
        }))
      };

      if (include_key_results) {
        const keyResultMetrics = await this.prisma.keyResult.aggregate({
          where: {
            goal: where
          },
          _avg: { current_value: true, target_value: true },
          _count: true
        });
        analytics.key_result_metrics = keyResultMetrics;
      }

      return analytics;
    } catch (error) {
      console.error('Error getting goal analytics:', error);
      throw new Error('Failed to get goal analytics');
    }
  }

  // Helper Methods
  private async generateReviewNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `REV-${year}-`;
    
    const lastReview = await this.prisma.performanceReview.findFirst({
      where: {
        review_number: {
          startsWith: prefix
        }
      },
      orderBy: {
        review_number: 'desc'
      }
    });

    let nextNumber = 1;
    if (lastReview) {
      const lastNumber = parseInt(lastReview.review_number.replace(prefix, ''));
      nextNumber = lastNumber + 1;
    }

    return `${prefix}${nextNumber.toString().padStart(4, '0')}`;
  }

  private async createAuditLog(entity_type: string, entity_id: string, action: string, data: any) {
    try {
      await this.prisma.auditLog.create({
        data: {
          entity_type,
          entity_id,
          action,
          old_values: {},
          new_values: data,
          performed_by: data.updated_by || data.employee_id || 'system',
          performed_at: new Date()
        }
      });
    } catch (error) {
      console.error('Error creating audit log:', error);
      // Don't throw error for audit log failures
    }
  }
}