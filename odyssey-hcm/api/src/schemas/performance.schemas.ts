import { z } from 'zod';

// Enums for Performance Management
export const ReviewTypeEnum = z.enum([
  'annual',
  'quarterly', 
  'project_based',
  'probationary',
  '360_degree',
  'self_assessment',
  'manager_assessment'
]);

export const ReviewStatusEnum = z.enum([
  'draft',
  'in_progress',
  'pending_manager',
  'pending_employee',
  'pending_hr',
  'completed',
  'cancelled'
]);

export const GoalStatusEnum = z.enum([
  'draft',
  'active',
  'completed',
  'cancelled',
  'on_hold'
]);

export const GoalCategoryEnum = z.enum([
  'company',
  'department',
  'team',
  'individual',
  'development',
  'performance'
]);

export const FeedbackTypeEnum = z.enum([
  'appreciation',
  'constructive',
  'coaching',
  'development',
  'project_feedback'
]);

export const SuccessionReadinessEnum = z.enum([
  'ready_now',
  'ready_1_2_years',
  'ready_2_3_years',
  'ready_3_plus_years',
  'not_ready'
]);

export const TalentRatingEnum = z.enum([
  'top_talent',
  'high_performer',
  'solid_performer',
  'developing',
  'underperforming'
]);

// Performance Review Schemas
export const PerformanceReviewSchema = z.object({
  id: z.string().uuid().optional(),
  employee_id: z.string().uuid(),
  reviewer_id: z.string().uuid(),
  review_period_start: z.string().date(),
  review_period_end: z.string().date(),
  review_type: ReviewTypeEnum,
  status: ReviewStatusEnum,
  self_assessment_deadline: z.string().datetime().optional(),
  manager_review_deadline: z.string().datetime().optional(),
  final_meeting_date: z.string().datetime().optional(),
  overall_rating: z.number().min(1).max(5).optional(),
  goals_achievement_rating: z.number().min(1).max(5).optional(),
  competencies_rating: z.number().min(1).max(5).optional(),
  development_areas: z.array(z.string()).default([]),
  achievements: z.array(z.string()).default([]),
  manager_comments: z.string().optional(),
  employee_comments: z.string().optional(),
  hr_comments: z.string().optional(),
  next_review_date: z.string().date().optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional()
});

export const CreatePerformanceReviewSchema = PerformanceReviewSchema.omit({
  id: true,
  created_at: true,
  updated_at: true
});

export const UpdatePerformanceReviewSchema = PerformanceReviewSchema.partial().omit({
  id: true,
  created_at: true
});

// Review Questions Schema
export const ReviewQuestionSchema = z.object({
  id: z.string().uuid().optional(),
  review_template_id: z.string().uuid(),
  question_text: z.string().min(1),
  question_type: z.enum(['text', 'rating', 'multiple_choice', 'boolean']),
  is_required: z.boolean().default(false),
  weight: z.number().min(0).max(100).default(0),
  options: z.array(z.string()).optional(),
  section: z.string().optional(),
  order_index: z.number().default(0),
  created_at: z.string().datetime().optional()
});

export const ReviewResponseSchema = z.object({
  id: z.string().uuid().optional(),
  review_id: z.string().uuid(),
  question_id: z.string().uuid(),
  response_text: z.string().optional(),
  response_rating: z.number().min(1).max(5).optional(),
  response_boolean: z.boolean().optional(),
  response_choice: z.string().optional(),
  created_at: z.string().datetime().optional()
});

// Goals and OKRs Schemas
export const GoalSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1),
  description: z.string().optional(),
  employee_id: z.string().uuid(),
  manager_id: z.string().uuid().optional(),
  parent_goal_id: z.string().uuid().optional(),
  category: GoalCategoryEnum,
  status: GoalStatusEnum,
  priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  target_date: z.string().date(),
  start_date: z.string().date(),
  completion_date: z.string().date().optional(),
  progress_percentage: z.number().min(0).max(100).default(0),
  is_stretch_goal: z.boolean().default(false),
  alignment_notes: z.string().optional(),
  success_criteria: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional()
});

export const CreateGoalSchema = GoalSchema.omit({
  id: true,
  created_at: true,
  updated_at: true
});

export const UpdateGoalSchema = GoalSchema.partial().omit({
  id: true,
  created_at: true
});

// Key Results Schema (for OKRs)
export const KeyResultSchema = z.object({
  id: z.string().uuid().optional(),
  goal_id: z.string().uuid(),
  title: z.string().min(1),
  description: z.string().optional(),
  target_value: z.number(),
  current_value: z.number().default(0),
  unit: z.string().optional(),
  is_binary: z.boolean().default(false),
  weight: z.number().min(0).max(100).default(100),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional()
});

export const CreateKeyResultSchema = KeyResultSchema.omit({
  id: true,
  created_at: true,
  updated_at: true
});

export const UpdateKeyResultSchema = KeyResultSchema.partial().omit({
  id: true,
  created_at: true
});

// Goal Progress Update Schema
export const GoalProgressUpdateSchema = z.object({
  id: z.string().uuid().optional(),
  goal_id: z.string().uuid(),
  updated_by: z.string().uuid(),
  previous_progress: z.number().min(0).max(100),
  new_progress: z.number().min(0).max(100),
  update_notes: z.string().optional(),
  attachments: z.array(z.string()).default([]),
  created_at: z.string().datetime().optional()
});

// Feedback Schemas
export const FeedbackSchema = z.object({
  id: z.string().uuid().optional(),
  from_employee_id: z.string().uuid(),
  to_employee_id: z.string().uuid(),
  feedback_type: FeedbackTypeEnum,
  subject: z.string().min(1),
  content: z.string().min(1),
  is_anonymous: z.boolean().default(false),
  is_private: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
  project_id: z.string().uuid().optional(),
  goal_id: z.string().uuid().optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional()
});

export const CreateFeedbackSchema = FeedbackSchema.omit({
  id: true,
  created_at: true,
  updated_at: true
});

export const UpdateFeedbackSchema = FeedbackSchema.partial().omit({
  id: true,
  created_at: true
});

// Feedback Request Schema
export const FeedbackRequestSchema = z.object({
  id: z.string().uuid().optional(),
  requester_id: z.string().uuid(),
  requested_from_id: z.string().uuid(),
  subject: z.string().min(1),
  description: z.string().optional(),
  feedback_areas: z.array(z.string()).default([]),
  deadline: z.string().date().optional(),
  is_completed: z.boolean().default(false),
  completed_at: z.string().datetime().optional(),
  created_at: z.string().datetime().optional()
});

// Succession Planning Schemas
export const SuccessionPlanSchema = z.object({
  id: z.string().uuid().optional(),
  position_id: z.string().uuid(),
  current_employee_id: z.string().uuid().optional(),
  is_critical_role: z.boolean().default(false),
  risk_level: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  succession_timeline: z.string().optional(),
  required_competencies: z.array(z.string()).default([]),
  development_requirements: z.array(z.string()).default([]),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional()
});

export const SuccessionCandidateSchema = z.object({
  id: z.string().uuid().optional(),
  succession_plan_id: z.string().uuid(),
  employee_id: z.string().uuid(),
  readiness_level: SuccessionReadinessEnum,
  talent_rating: TalentRatingEnum,
  development_plan: z.string().optional(),
  competency_gaps: z.array(z.string()).default([]),
  development_goals: z.array(z.string()).default([]),
  last_assessment_date: z.string().date().optional(),
  notes: z.string().optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional()
});

// Competency Framework Schemas
export const CompetencySchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1),
  description: z.string().optional(),
  category: z.string().optional(),
  is_core: z.boolean().default(false),
  proficiency_levels: z.array(z.object({
    level: z.number().min(1).max(5),
    name: z.string(),
    description: z.string()
  })).default([]),
  created_at: z.string().datetime().optional()
});

export const EmployeeCompetencyAssessmentSchema = z.object({
  id: z.string().uuid().optional(),
  employee_id: z.string().uuid(),
  competency_id: z.string().uuid(),
  current_level: z.number().min(1).max(5),
  target_level: z.number().min(1).max(5).optional(),
  assessed_by: z.string().uuid(),
  assessment_date: z.string().date(),
  notes: z.string().optional(),
  evidence: z.array(z.string()).default([]),
  created_at: z.string().datetime().optional()
});

// Search and Filter Schemas
export const PerformanceSearchSchema = z.object({
  search: z.string().optional(),
  employee_id: z.string().uuid().optional(),
  reviewer_id: z.string().uuid().optional(),
  status: ReviewStatusEnum.optional(),
  review_type: ReviewTypeEnum.optional(),
  department_id: z.string().uuid().optional(),
  date_from: z.string().date().optional(),
  date_to: z.string().date().optional(),
  rating_min: z.number().min(1).max(5).optional(),
  rating_max: z.number().min(1).max(5).optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  sort_by: z.enum(['created_at', 'updated_at', 'review_period_end', 'overall_rating']).default('updated_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc')
});

export const GoalSearchSchema = z.object({
  search: z.string().optional(),
  employee_id: z.string().uuid().optional(),
  manager_id: z.string().uuid().optional(),
  category: GoalCategoryEnum.optional(),
  status: GoalStatusEnum.optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  due_date_from: z.string().date().optional(),
  due_date_to: z.string().date().optional(),
  progress_min: z.number().min(0).max(100).optional(),
  progress_max: z.number().min(0).max(100).optional(),
  tags: z.array(z.string()).optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  sort_by: z.enum(['created_at', 'updated_at', 'target_date', 'progress_percentage']).default('updated_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc')
});

export const FeedbackSearchSchema = z.object({
  search: z.string().optional(),
  from_employee_id: z.string().uuid().optional(),
  to_employee_id: z.string().uuid().optional(),
  feedback_type: FeedbackTypeEnum.optional(),
  is_anonymous: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  date_from: z.string().date().optional(),
  date_to: z.string().date().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  sort_by: z.enum(['created_at', 'updated_at']).default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc')
});

// Analytics Schemas
export const PerformanceAnalyticsSchema = z.object({
  department_id: z.string().uuid().optional(),
  date_from: z.string().date().optional(),
  date_to: z.string().date().optional(),
  review_type: ReviewTypeEnum.optional(),
  include_competencies: z.boolean().default(false),
  include_goals: z.boolean().default(false),
  include_feedback: z.boolean().default(false)
});

export const GoalAnalyticsSchema = z.object({
  department_id: z.string().uuid().optional(),
  date_from: z.string().date().optional(),
  date_to: z.string().date().optional(),
  category: GoalCategoryEnum.optional(),
  include_key_results: z.boolean().default(false)
});

// Bulk Operations Schemas
export const BulkUpdateGoalsSchema = z.object({
  goal_ids: z.array(z.string().uuid()),
  updates: UpdateGoalSchema
});

export const BulkAssignReviewsSchema = z.object({
  employee_ids: z.array(z.string().uuid()),
  review_template_id: z.string().uuid(),
  review_period_start: z.string().date(),
  review_period_end: z.string().date(),
  self_assessment_deadline: z.string().datetime(),
  manager_review_deadline: z.string().datetime()
});

// Type exports
export type PerformanceReview = z.infer<typeof PerformanceReviewSchema>;
export type CreatePerformanceReview = z.infer<typeof CreatePerformanceReviewSchema>;
export type UpdatePerformanceReview = z.infer<typeof UpdatePerformanceReviewSchema>;
export type ReviewQuestion = z.infer<typeof ReviewQuestionSchema>;
export type ReviewResponse = z.infer<typeof ReviewResponseSchema>;
export type Goal = z.infer<typeof GoalSchema>;
export type CreateGoal = z.infer<typeof CreateGoalSchema>;
export type UpdateGoal = z.infer<typeof UpdateGoalSchema>;
export type KeyResult = z.infer<typeof KeyResultSchema>;
export type CreateKeyResult = z.infer<typeof CreateKeyResultSchema>;
export type UpdateKeyResult = z.infer<typeof UpdateKeyResultSchema>;
export type GoalProgressUpdate = z.infer<typeof GoalProgressUpdateSchema>;
export type Feedback = z.infer<typeof FeedbackSchema>;
export type CreateFeedback = z.infer<typeof CreateFeedbackSchema>;
export type UpdateFeedback = z.infer<typeof UpdateFeedbackSchema>;
export type FeedbackRequest = z.infer<typeof FeedbackRequestSchema>;
export type SuccessionPlan = z.infer<typeof SuccessionPlanSchema>;
export type SuccessionCandidate = z.infer<typeof SuccessionCandidateSchema>;
export type Competency = z.infer<typeof CompetencySchema>;
export type EmployeeCompetencyAssessment = z.infer<typeof EmployeeCompetencyAssessmentSchema>;
export type PerformanceSearch = z.infer<typeof PerformanceSearchSchema>;
export type GoalSearch = z.infer<typeof GoalSearchSchema>;
export type FeedbackSearch = z.infer<typeof FeedbackSearchSchema>;
export type PerformanceAnalytics = z.infer<typeof PerformanceAnalyticsSchema>;
export type GoalAnalytics = z.infer<typeof GoalAnalyticsSchema>;
export type BulkUpdateGoals = z.infer<typeof BulkUpdateGoalsSchema>;
export type BulkAssignReviews = z.infer<typeof BulkAssignReviewsSchema>;