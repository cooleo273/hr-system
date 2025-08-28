import { z } from 'zod';

// Job Requisition Schemas
export const createJobRequisitionSchema = z.object({
  title: z.string().min(1, 'Job title is required'),
  departmentId: z.string().uuid('Invalid department ID'),
  positionId: z.string().uuid('Invalid position ID').optional(),
  requestingManagerId: z.string().uuid('Invalid manager ID'),
  employmentType: z.enum(['full_time', 'part_time', 'contract', 'internship']),
  location: z.string().min(1, 'Location is required'),
  description: z.string().min(50, 'Job description must be at least 50 characters'),
  requirements: z.string().min(20, 'Requirements must be at least 20 characters'),
  responsibilities: z.string().min(20, 'Responsibilities must be at least 20 characters'),
  skillsRequired: z.array(z.string()).min(1, 'At least one skill is required'),
  skillsPreferred: z.array(z.string()).optional(),
  experienceLevel: z.enum(['entry', 'mid', 'senior', 'lead', 'executive']),
  salaryRangeMin: z.number().positive().optional(),
  salaryRangeMax: z.number().positive().optional(),
  currency: z.string().length(3).default('USD'),
  benefits: z.array(z.string()).optional(),
  headcountJustification: z.string().min(10, 'Justification is required'),
  urgency: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  targetStartDate: z.string().datetime().optional(),
  budgetApproved: z.boolean().default(false),
  approvalRequired: z.boolean().default(true),
  isRemoteAllowed: z.boolean().default(false),
  travelRequirement: z.number().min(0).max(100).default(0), // Percentage
  securityClearance: z.string().optional(),
  metadata: z.record(z.any()).optional()
});

export const updateJobRequisitionSchema = createJobRequisitionSchema.partial().extend({
  id: z.string().uuid(),
  status: z.enum(['draft', 'pending_approval', 'approved', 'rejected', 'published', 'on_hold', 'cancelled', 'closed']).optional()
});

export const jobRequisitionQuerySchema = z.object({
  departmentId: z.string().uuid().optional(),
  requestingManagerId: z.string().uuid().optional(),
  status: z.enum(['draft', 'pending_approval', 'approved', 'rejected', 'published', 'on_hold', 'cancelled', 'closed']).optional(),
  employmentType: z.enum(['full_time', 'part_time', 'contract', 'internship']).optional(),
  urgency: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  page: z.coerce.number().positive().default(1),
  limit: z.coerce.number().positive().max(100).default(20),
  search: z.string().optional(),
  sortBy: z.enum(['createdAt', 'title', 'department', 'urgency', 'status']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

// Job Posting Schemas  
export const createJobPostingSchema = z.object({
  requisitionId: z.string().uuid('Invalid requisition ID'),
  title: z.string().min(1, 'Job title is required'),
  companyDescription: z.string().min(50, 'Company description is required'),
  jobDescription: z.string().min(100, 'Job description must be detailed'),
  requirements: z.string().min(50, 'Requirements must be detailed'),
  responsibilities: z.string().min(50, 'Responsibilities must be detailed'),
  qualifications: z.string().min(20, 'Qualifications are required'),
  benefits: z.array(z.string()).optional(),
  salaryDisplay: z.enum(['range', 'starting_from', 'up_to', 'competitive', 'hidden']).default('competitive'),
  salaryRangeMin: z.number().positive().optional(),
  salaryRangeMax: z.number().positive().optional(),
  currency: z.string().length(3).default('USD'),
  location: z.string().min(1, 'Location is required'),
  isRemote: z.boolean().default(false),
  employmentType: z.enum(['full_time', 'part_time', 'contract', 'internship']),
  experienceLevel: z.enum(['entry', 'mid', 'senior', 'lead', 'executive']),
  applicationDeadline: z.string().datetime().optional(),
  keywords: z.array(z.string()).optional(),
  applicationInstructions: z.string().optional(),
  contactEmail: z.string().email('Invalid email').optional(),
  externalPostings: z.array(z.object({
    platform: z.string(),
    url: z.string().url(),
    posted: z.boolean().default(false),
    postedAt: z.string().datetime().optional()
  })).optional(),
  seoTitle: z.string().max(60).optional(),
  seoDescription: z.string().max(160).optional(),
  isActive: z.boolean().default(true)
});

export const updateJobPostingSchema = createJobPostingSchema.partial().extend({
  id: z.string().uuid()
});

// Candidate Schemas
export const createCandidateSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number is required').optional(),
  linkedInUrl: z.string().url('Invalid LinkedIn URL').optional(),
  portfolioUrl: z.string().url('Invalid portfolio URL').optional(),
  githubUrl: z.string().url('Invalid GitHub URL').optional(),
  location: z.string().optional(),
  currentTitle: z.string().optional(),
  currentCompany: z.string().optional(),
  yearsOfExperience: z.number().min(0).max(50).optional(),
  expectedSalary: z.number().positive().optional(),
  currency: z.string().length(3).default('USD'),
  availabilityDate: z.string().datetime().optional(),
  noticePeriod: z.string().optional(),
  source: z.enum(['career_site', 'referral', 'linkedin', 'indeed', 'glassdoor', 'recruiter', 'other']).default('career_site'),
  referredBy: z.string().uuid('Invalid referrer ID').optional(),
  resumeUrl: z.string().url('Invalid resume URL').optional(),
  coverLetterUrl: z.string().url('Invalid cover letter URL').optional(),
  skills: z.array(z.string()).optional(),
  educationLevel: z.enum(['high_school', 'bachelors', 'masters', 'phd', 'other']).optional(),
  workAuthorization: z.enum(['citizen', 'permanent_resident', 'visa_required', 'other']).optional(),
  willingToRelocate: z.boolean().default(false),
  gdprConsent: z.boolean().default(false),
  marketingConsent: z.boolean().default(false),
  customFields: z.record(z.any()).optional()
});

export const updateCandidateSchema = createCandidateSchema.partial().extend({
  id: z.string().uuid()
});

// Application Schemas
export const createApplicationSchema = z.object({
  candidateId: z.string().uuid('Invalid candidate ID'),
  jobPostingId: z.string().uuid('Invalid job posting ID'),
  appliedAt: z.string().datetime().default(new Date().toISOString()),
  coverLetter: z.string().optional(),
  additionalDocuments: z.array(z.object({
    name: z.string(),
    url: z.string().url(),
    type: z.string()
  })).optional(),
  questionnaire: z.array(z.object({
    question: z.string(),
    answer: z.string()
  })).optional(),
  source: z.enum(['career_site', 'referral', 'linkedin', 'indeed', 'glassdoor', 'recruiter', 'other']).default('career_site'),
  initialScreening: z.object({
    passedAutoScreening: z.boolean().default(true),
    screeningNotes: z.string().optional(),
    screeningScore: z.number().min(0).max(100).optional()
  }).optional()
});

// Interview Schemas
export const createInterviewSchema = z.object({
  applicationId: z.string().uuid('Invalid application ID'),
  interviewerIds: z.array(z.string().uuid()).min(1, 'At least one interviewer is required'),
  scheduledDate: z.string().datetime('Invalid date format'),
  duration: z.number().positive().default(60), // minutes
  type: z.enum(['phone', 'video', 'in_person', 'technical', 'panel', 'cultural_fit']),
  location: z.string().optional(),
  meetingLink: z.string().url('Invalid meeting link').optional(),
  meetingPlatform: z.enum(['zoom', 'teams', 'google_meet', 'in_person', 'phone', 'other']).optional(),
  interviewGuide: z.string().optional(),
  requiredPreparation: z.string().optional(),
  notes: z.string().optional(),
  round: z.number().positive().default(1),
  isPanel: z.boolean().default(false),
  recordingConsent: z.boolean().default(false),
  reminderSent: z.boolean().default(false),
  calendarInviteSent: z.boolean().default(false)
});

export const updateInterviewSchema = createInterviewSchema.partial().extend({
  id: z.string().uuid(),
  status: z.enum(['scheduled', 'completed', 'cancelled', 'no_show', 'rescheduled']).optional()
});

export const interviewFeedbackSchema = z.object({
  interviewId: z.string().uuid('Invalid interview ID'),
  interviewerId: z.string().uuid('Invalid interviewer ID'),
  overallRating: z.number().min(1).max(5),
  technicalSkills: z.number().min(1).max(5).optional(),
  communicationSkills: z.number().min(1).max(5).optional(),
  culturalFit: z.number().min(1).max(5).optional(),
  problemSolving: z.number().min(1).max(5).optional(),
  experience: z.number().min(1).max(5).optional(),
  strengths: z.string().min(10, 'Please provide detailed strengths'),
  weaknesses: z.string().min(10, 'Please provide detailed weaknesses'),
  notes: z.string().optional(),
  recommendation: z.enum(['strong_hire', 'hire', 'on_fence', 'no_hire', 'strong_no_hire']),
  nextSteps: z.string().optional(),
  questionsAsked: z.array(z.string()).optional(),
  candidateQuestions: z.array(z.string()).optional(),
  followUpRequired: z.boolean().default(false),
  confidential: z.boolean().default(false)
});

// Offer Management Schemas
export const createOfferSchema = z.object({
  applicationId: z.string().uuid('Invalid application ID'),
  approverIds: z.array(z.string().uuid()).min(1, 'At least one approver is required'),
  jobTitle: z.string().min(1, 'Job title is required'),
  department: z.string().min(1, 'Department is required'),
  reportingManagerId: z.string().uuid('Invalid manager ID'),
  employmentType: z.enum(['full_time', 'part_time', 'contract', 'internship']),
  startDate: z.string().datetime('Invalid start date'),
  baseSalary: z.number().positive('Base salary must be positive'),
  currency: z.string().length(3).default('USD'),
  bonusAmount: z.number().min(0).optional(),
  equityAmount: z.number().min(0).optional(),
  equityType: z.enum(['rsu', 'options', 'phantom', 'none']).optional(),
  benefits: z.array(z.string()).optional(),
  paidTimeOff: z.number().min(0).optional(),
  workLocation: z.string().min(1, 'Work location is required'),
  isRemoteAllowed: z.boolean().default(false),
  probationPeriod: z.number().min(0).optional(), // months
  noticePeriod: z.number().min(0).optional(), // weeks
  specialTerms: z.string().optional(),
  offerValidUntil: z.string().datetime('Invalid expiration date'),
  internalNotes: z.string().optional(),
  template: z.string().optional(),
  customClauses: z.array(z.object({
    title: z.string(),
    content: z.string()
  })).optional(),
  requiresBackground: z.boolean().default(true),
  requiresReferences: z.boolean().default(true),
  signatureRequired: z.boolean().default(true)
});

export const updateOfferSchema = createOfferSchema.partial().extend({
  id: z.string().uuid(),
  status: z.enum(['draft', 'pending_approval', 'approved', 'sent', 'viewed', 'accepted', 'declined', 'withdrawn', 'expired']).optional()
});

// Pipeline Stage Schemas
export const updateApplicationStageSchema = z.object({
  applicationId: z.string().uuid('Invalid application ID'),
  stage: z.enum([
    'applied', 
    'screening', 
    'phone_interview', 
    'technical_interview', 
    'onsite_interview', 
    'final_interview', 
    'background_check', 
    'offer_pending', 
    'offer_sent', 
    'hired', 
    'rejected', 
    'withdrawn'
  ]),
  notes: z.string().optional(),
  rejectionReason: z.string().optional(),
  feedback: z.string().optional()
});

// Query Schemas
export const candidateQuerySchema = z.object({
  search: z.string().optional(),
  skills: z.array(z.string()).optional(),
  experienceLevel: z.enum(['entry', 'mid', 'senior', 'lead', 'executive']).optional(),
  source: z.enum(['career_site', 'referral', 'linkedin', 'indeed', 'glassdoor', 'recruiter', 'other']).optional(),
  location: z.string().optional(),
  availabilityDate: z.string().datetime().optional(),
  page: z.coerce.number().positive().default(1),
  limit: z.coerce.number().positive().max(100).default(20),
  sortBy: z.enum(['createdAt', 'lastName', 'yearsOfExperience', 'expectedSalary']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

export const applicationQuerySchema = z.object({
  jobPostingId: z.string().uuid().optional(),
  candidateId: z.string().uuid().optional(),
  stage: z.enum([
    'applied', 
    'screening', 
    'phone_interview', 
    'technical_interview', 
    'onsite_interview', 
    'final_interview', 
    'background_check', 
    'offer_pending', 
    'offer_sent', 
    'hired', 
    'rejected', 
    'withdrawn'
  ]).optional(),
  appliedAfter: z.string().datetime().optional(),
  appliedBefore: z.string().datetime().optional(),
  page: z.coerce.number().positive().default(1),
  limit: z.coerce.number().positive().max(100).default(20),
  sortBy: z.enum(['appliedAt', 'candidateName', 'stage', 'score']).default('appliedAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

export const interviewQuerySchema = z.object({
  interviewerId: z.string().uuid().optional(),
  applicationId: z.string().uuid().optional(),
  scheduledAfter: z.string().datetime().optional(),
  scheduledBefore: z.string().datetime().optional(),
  status: z.enum(['scheduled', 'completed', 'cancelled', 'no_show', 'rescheduled']).optional(),
  type: z.enum(['phone', 'video', 'in_person', 'technical', 'panel', 'cultural_fit']).optional(),
  page: z.coerce.number().positive().default(1),
  limit: z.coerce.number().positive().max(100).default(20),
  sortBy: z.enum(['scheduledDate', 'candidateName', 'type', 'round']).default('scheduledDate'),
  sortOrder: z.enum(['asc', 'desc']).default('asc')
});

// Bulk Operations
export const bulkUpdateApplicationsSchema = z.object({
  applicationIds: z.array(z.string().uuid()).min(1, 'At least one application is required'),
  updates: z.object({
    stage: z.enum([
      'applied', 
      'screening', 
      'phone_interview', 
      'technical_interview', 
      'onsite_interview', 
      'final_interview', 
      'background_check', 
      'offer_pending', 
      'offer_sent', 
      'hired', 
      'rejected', 
      'withdrawn'
    ]).optional(),
    notes: z.string().optional(),
    rejectionReason: z.string().optional()
  })
});

// Analytics Schemas
export const recruitmentAnalyticsQuerySchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  departmentId: z.string().uuid().optional(),
  jobPostingId: z.string().uuid().optional(),
  metrics: z.array(z.enum([
    'applications_count',
    'candidates_count', 
    'interviews_count',
    'hires_count',
    'time_to_hire',
    'cost_per_hire',
    'conversion_rates',
    'source_effectiveness',
    'pipeline_health'
  ])).optional(),
  groupBy: z.enum(['day', 'week', 'month', 'department', 'source', 'stage']).default('month')
});

// Types
export type CreateJobRequisition = z.infer<typeof createJobRequisitionSchema>;
export type UpdateJobRequisition = z.infer<typeof updateJobRequisitionSchema>;
export type JobRequisitionQuery = z.infer<typeof jobRequisitionQuerySchema>;

export type CreateJobPosting = z.infer<typeof createJobPostingSchema>;
export type UpdateJobPosting = z.infer<typeof updateJobPostingSchema>;

export type CreateCandidate = z.infer<typeof createCandidateSchema>;
export type UpdateCandidate = z.infer<typeof updateCandidateSchema>;

export type CreateApplication = z.infer<typeof createApplicationSchema>;
export type UpdateApplicationStage = z.infer<typeof updateApplicationStageSchema>;

export type CreateInterview = z.infer<typeof createInterviewSchema>;
export type UpdateInterview = z.infer<typeof updateInterviewSchema>;
export type InterviewFeedback = z.infer<typeof interviewFeedbackSchema>;

export type CreateOffer = z.infer<typeof createOfferSchema>;
export type UpdateOffer = z.infer<typeof updateOfferSchema>;

export type CandidateQuery = z.infer<typeof candidateQuerySchema>;
export type ApplicationQuery = z.infer<typeof applicationQuerySchema>;
export type InterviewQuery = z.infer<typeof interviewQuerySchema>;
export type BulkUpdateApplications = z.infer<typeof bulkUpdateApplicationsSchema>;
export type RecruitmentAnalyticsQuery = z.infer<typeof recruitmentAnalyticsQuerySchema>;