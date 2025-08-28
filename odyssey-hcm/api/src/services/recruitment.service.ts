import { PrismaClient } from '@prisma/client';
import type {
  CreateJobRequisition,
  UpdateJobRequisition,
  JobRequisitionQuery,
  CreateJobPosting,
  UpdateJobPosting,
  CreateCandidate,
  UpdateCandidate,
  CreateApplication,
  UpdateApplicationStage,
  CreateInterview,
  UpdateInterview,
  InterviewFeedback,
  CreateOffer,
  UpdateOffer,
  CandidateQuery,
  ApplicationQuery,
  InterviewQuery,
  BulkUpdateApplications,
  RecruitmentAnalyticsQuery
} from '../schemas/recruitment.schemas';

export class RecruitmentService {
  constructor(private prisma: PrismaClient) {}

  // ============================================================================
  // JOB REQUISITIONS
  // ============================================================================
  
  async createJobRequisition(data: CreateJobRequisition, createdById: string) {
    // Create requisition with initial approval workflow if required
    const requisition = await this.prisma.jobRequisition.create({
      data: {
        ...data,
        createdById,
        status: data.approvalRequired ? 'pending_approval' : 'approved',
        requisitionNumber: await this.generateRequisitionNumber()
      },
      include: {
        department: true,
        position: true,
        requestingManager: {
          select: { id: true, firstName: true, lastName: true, email: true }
        },
        createdBy: {
          select: { id: true, firstName: true, lastName: true }
        }
      }
    });

    // Create approval workflow if required
    if (data.approvalRequired) {
      await this.createRequisitionApprovalWorkflow(requisition.id, data.requestingManagerId);
    }

    return requisition;
  }

  async updateJobRequisition(id: string, data: UpdateJobRequisition, updatedById: string) {
    return this.prisma.jobRequisition.update({
      where: { id },
      data: {
        ...data,
        updatedById,
        updatedAt: new Date()
      },
      include: {
        department: true,
        position: true,
        requestingManager: {
          select: { id: true, firstName: true, lastName: true, email: true }
        },
        approvalWorkflow: {
          include: {
            steps: {
              include: {
                approver: {
                  select: { id: true, firstName: true, lastName: true }
                }
              },
              orderBy: { level: 'asc' }
            }
          }
        }
      }
    });
  }

  async getJobRequisitions(query: JobRequisitionQuery) {
    const {
      departmentId,
      requestingManagerId,
      status,
      employmentType,
      urgency,
      page,
      limit,
      search,
      sortBy,
      sortOrder
    } = query;

    const where: any = {};
    
    if (departmentId) where.departmentId = departmentId;
    if (requestingManagerId) where.requestingManagerId = requestingManagerId;
    if (status) where.status = status;
    if (employmentType) where.employmentType = employmentType;
    if (urgency) where.urgency = urgency;
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { requisitionNumber: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [requisitions, total] = await Promise.all([
      this.prisma.jobRequisition.findMany({
        where,
        include: {
          department: true,
          requestingManager: {
            select: { id: true, firstName: true, lastName: true }
          },
          jobPostings: {
            select: { id: true, isActive: true, createdAt: true }
          },
          _count: {
            select: { applications: true }
          }
        },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit
      }),
      this.prisma.jobRequisition.count({ where })
    ]);

    return {
      requisitions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getJobRequisitionById(id: string) {
    return this.prisma.jobRequisition.findUnique({
      where: { id },
      include: {
        department: true,
        position: true,
        requestingManager: {
          select: { id: true, firstName: true, lastName: true, email: true }
        },
        approvalWorkflow: {
          include: {
            steps: {
              include: {
                approver: {
                  select: { id: true, firstName: true, lastName: true }
                }
              },
              orderBy: { level: 'asc' }
            }
          }
        },
        jobPostings: true,
        applications: {
          include: {
            candidate: {
              select: { id: true, firstName: true, lastName: true, email: true }
            }
          }
        }
      }
    });
  }

  async approveJobRequisition(id: string, approverId: string, comments?: string) {
    // Check if user is authorized to approve at current level
    const workflow = await this.prisma.approvalWorkflow.findFirst({
      where: { 
        jobRequisitionId: id,
        status: 'active'
      },
      include: {
        steps: {
          where: { status: 'pending' },
          orderBy: { level: 'asc' },
          take: 1
        }
      }
    });

    if (!workflow || !workflow.steps[0] || workflow.steps[0].approverId !== approverId) {
      throw new Error('Not authorized to approve at this level');
    }

    // Update the approval step
    await this.prisma.approvalStep.update({
      where: { id: workflow.steps[0].id },
      data: {
        status: 'approved',
        actionDate: new Date(),
        comments
      }
    });

    // Check if there are more approval levels
    const nextStep = await this.prisma.approvalStep.findFirst({
      where: {
        workflowId: workflow.id,
        level: { gt: workflow.steps[0].level },
        status: 'pending'
      },
      orderBy: { level: 'asc' }
    });

    // If no more steps, approve the requisition
    if (!nextStep) {
      await Promise.all([
        this.prisma.jobRequisition.update({
          where: { id },
          data: { 
            status: 'approved',
            approvedAt: new Date(),
            approvedById: approverId
          }
        }),
        this.prisma.approvalWorkflow.update({
          where: { id: workflow.id },
          data: { 
            status: 'completed',
            completedAt: new Date()
          }
        })
      ]);
    }

    return this.getJobRequisitionById(id);
  }

  // ============================================================================
  // JOB POSTINGS
  // ============================================================================

  async createJobPosting(data: CreateJobPosting, createdById: string) {
    // Validate requisition exists and is approved
    const requisition = await this.prisma.jobRequisition.findUnique({
      where: { id: data.requisitionId }
    });

    if (!requisition) {
      throw new Error('Job requisition not found');
    }

    if (requisition.status !== 'approved') {
      throw new Error('Cannot create posting for non-approved requisition');
    }

    const posting = await this.prisma.jobPosting.create({
      data: {
        ...data,
        createdById,
        postingNumber: await this.generatePostingNumber(),
        slug: this.generateSlug(data.title)
      },
      include: {
        requisition: {
          include: {
            department: true,
            requestingManager: {
              select: { id: true, firstName: true, lastName: true }
            }
          }
        }
      }
    });

    // Update requisition status
    await this.prisma.jobRequisition.update({
      where: { id: data.requisitionId },
      data: { status: 'published' }
    });

    return posting;
  }

  async updateJobPosting(id: string, data: UpdateJobPosting, updatedById: string) {
    return this.prisma.jobPosting.update({
      where: { id },
      data: {
        ...data,
        updatedById,
        updatedAt: new Date(),
        slug: data.title ? this.generateSlug(data.title) : undefined
      },
      include: {
        requisition: {
          include: {
            department: true
          }
        },
        applications: {
          select: { id: true, stage: true, createdAt: true }
        }
      }
    });
  }

  async getActiveJobPostings(location?: string, department?: string) {
    const where: any = { 
      isActive: true,
      applicationDeadline: {
        OR: [
          { gt: new Date() },
          { equals: null }
        ]
      }
    };

    if (location) {
      where.OR = [
        { location: { contains: location, mode: 'insensitive' } },
        { isRemote: true }
      ];
    }

    if (department) {
      where.requisition = {
        department: {
          name: { contains: department, mode: 'insensitive' }
        }
      };
    }

    return this.prisma.jobPosting.findMany({
      where,
      include: {
        requisition: {
          include: {
            department: {
              select: { id: true, name: true }
            }
          }
        },
        _count: {
          select: { applications: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getJobPostingBySlug(slug: string) {
    return this.prisma.jobPosting.findUnique({
      where: { slug },
      include: {
        requisition: {
          include: {
            department: {
              select: { id: true, name: true }
            }
          }
        }
      }
    });
  }

  // ============================================================================
  // CANDIDATES
  // ============================================================================

  async createCandidate(data: CreateCandidate) {
    // Check if candidate already exists by email
    const existingCandidate = await this.prisma.candidate.findUnique({
      where: { email: data.email }
    });

    if (existingCandidate) {
      return existingCandidate;
    }

    return this.prisma.candidate.create({
      data: {
        ...data,
        candidateNumber: await this.generateCandidateNumber()
      }
    });
  }

  async updateCandidate(id: string, data: UpdateCandidate) {
    return this.prisma.candidate.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date()
      },
      include: {
        applications: {
          include: {
            jobPosting: {
              select: { id: true, title: true, location: true }
            }
          }
        }
      }
    });
  }

  async searchCandidates(query: CandidateQuery) {
    const {
      search,
      skills,
      experienceLevel,
      source,
      location,
      availabilityDate,
      page,
      limit,
      sortBy,
      sortOrder
    } = query;

    const where: any = {};

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { currentTitle: { contains: search, mode: 'insensitive' } },
        { currentCompany: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (skills && skills.length > 0) {
      where.skills = {
        hassome: skills
      };
    }

    if (experienceLevel) where.experienceLevel = experienceLevel;
    if (source) where.source = source;
    if (location) where.location = { contains: location, mode: 'insensitive' };
    if (availabilityDate) where.availabilityDate = { lte: availabilityDate };

    const [candidates, total] = await Promise.all([
      this.prisma.candidate.findMany({
        where,
        include: {
          applications: {
            include: {
              jobPosting: {
                select: { id: true, title: true }
              }
            },
            orderBy: { appliedAt: 'desc' },
            take: 3
          },
          _count: {
            select: { applications: true }
          }
        },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit
      }),
      this.prisma.candidate.count({ where })
    ]);

    return {
      candidates,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  // ============================================================================
  // APPLICATIONS
  // ============================================================================

  async createApplication(data: CreateApplication) {
    // Check for duplicate application
    const existingApplication = await this.prisma.application.findFirst({
      where: {
        candidateId: data.candidateId,
        jobPostingId: data.jobPostingId
      }
    });

    if (existingApplication) {
      throw new Error('Candidate has already applied for this position');
    }

    return this.prisma.application.create({
      data: {
        ...data,
        stage: 'applied',
        applicationNumber: await this.generateApplicationNumber()
      },
      include: {
        candidate: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            currentTitle: true,
            yearsOfExperience: true
          }
        },
        jobPosting: {
          select: {
            id: true,
            title: true,
            location: true,
            employmentType: true
          }
        }
      }
    });
  }

  async updateApplicationStage(data: UpdateApplicationStage, updatedById: string) {
    const application = await this.prisma.application.update({
      where: { id: data.applicationId },
      data: {
        stage: data.stage,
        updatedById,
        updatedAt: new Date()
      }
    });

    // Create stage history entry
    await this.prisma.applicationStageHistory.create({
      data: {
        applicationId: data.applicationId,
        stage: data.stage,
        notes: data.notes,
        rejectionReason: data.rejectionReason,
        feedback: data.feedback,
        changedById: updatedById
      }
    });

    return application;
  }

  async getApplications(query: ApplicationQuery) {
    const {
      jobPostingId,
      candidateId,
      stage,
      appliedAfter,
      appliedBefore,
      page,
      limit,
      sortBy,
      sortOrder
    } = query;

    const where: any = {};
    
    if (jobPostingId) where.jobPostingId = jobPostingId;
    if (candidateId) where.candidateId = candidateId;
    if (stage) where.stage = stage;
    
    if (appliedAfter || appliedBefore) {
      where.appliedAt = {};
      if (appliedAfter) where.appliedAt.gte = appliedAfter;
      if (appliedBefore) where.appliedAt.lte = appliedBefore;
    }

    const [applications, total] = await Promise.all([
      this.prisma.application.findMany({
        where,
        include: {
          candidate: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              currentTitle: true,
              yearsOfExperience: true,
              resumeUrl: true
            }
          },
          jobPosting: {
            select: {
              id: true,
              title: true,
              location: true,
              employmentType: true
            }
          },
          interviews: {
            select: {
              id: true,
              scheduledDate: true,
              type: true,
              status: true
            },
            orderBy: { scheduledDate: 'desc' }
          },
          offers: {
            select: {
              id: true,
              status: true,
              createdAt: true
            },
            orderBy: { createdAt: 'desc' }
          }
        },
        orderBy: sortBy === 'candidateName' 
          ? { candidate: { lastName: sortOrder } }
          : { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit
      }),
      this.prisma.application.count({ where })
    ]);

    return {
      applications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async bulkUpdateApplications(data: BulkUpdateApplications, updatedById: string) {
    const { applicationIds, updates } = data;

    // Update applications
    const updatedApplications = await this.prisma.application.updateMany({
      where: { id: { in: applicationIds } },
      data: {
        ...updates,
        updatedById,
        updatedAt: new Date()
      }
    });

    // Create stage history entries if stage was updated
    if (updates.stage) {
      const historyEntries = applicationIds.map(id => ({
        applicationId: id,
        stage: updates.stage!,
        notes: updates.notes,
        rejectionReason: updates.rejectionReason,
        changedById: updatedById
      }));

      await this.prisma.applicationStageHistory.createMany({
        data: historyEntries
      });
    }

    return updatedApplications;
  }

  // ============================================================================
  // INTERVIEWS
  // ============================================================================

  async scheduleInterview(data: CreateInterview, scheduledById: string) {
    const interview = await this.prisma.interview.create({
      data: {
        ...data,
        scheduledById,
        status: 'scheduled'
      },
      include: {
        application: {
          include: {
            candidate: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true
              }
            },
            jobPosting: {
              select: {
                id: true,
                title: true
              }
            }
          }
        },
        interviewers: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    // TODO: Send calendar invites and notifications
    
    return interview;
  }

  async updateInterview(id: string, data: UpdateInterview, updatedById: string) {
    return this.prisma.interview.update({
      where: { id },
      data: {
        ...data,
        updatedById,
        updatedAt: new Date()
      },
      include: {
        application: {
          include: {
            candidate: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        },
        interviewers: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        feedback: {
          include: {
            interviewer: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            }
          }
        }
      }
    });
  }

  async submitInterviewFeedback(data: InterviewFeedback) {
    return this.prisma.interviewFeedback.create({
      data,
      include: {
        interviewer: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        },
        interview: {
          include: {
            application: {
              include: {
                candidate: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true
                  }
                }
              }
            }
          }
        }
      }
    });
  }

  async getInterviews(query: InterviewQuery) {
    const {
      interviewerId,
      applicationId,
      scheduledAfter,
      scheduledBefore,
      status,
      type,
      page,
      limit,
      sortBy,
      sortOrder
    } = query;

    const where: any = {};
    
    if (interviewerId) {
      where.interviewers = {
        some: { id: interviewerId }
      };
    }
    if (applicationId) where.applicationId = applicationId;
    if (status) where.status = status;
    if (type) where.type = type;
    
    if (scheduledAfter || scheduledBefore) {
      where.scheduledDate = {};
      if (scheduledAfter) where.scheduledDate.gte = scheduledAfter;
      if (scheduledBefore) where.scheduledDate.lte = scheduledBefore;
    }

    const [interviews, total] = await Promise.all([
      this.prisma.interview.findMany({
        where,
        include: {
          application: {
            include: {
              candidate: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true
                }
              },
              jobPosting: {
                select: {
                  id: true,
                  title: true
                }
              }
            }
          },
          interviewers: {
            select: {
              id: true,
              firstName: true,
              lastName: true
            }
          },
          feedback: {
            select: {
              id: true,
              overallRating: true,
              recommendation: true
            }
          }
        },
        orderBy: sortBy === 'candidateName'
          ? { application: { candidate: { lastName: sortOrder } } }
          : { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit
      }),
      this.prisma.interview.count({ where })
    ]);

    return {
      interviews,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  // ============================================================================
  // OFFERS
  // ============================================================================

  async createOffer(data: CreateOffer, createdById: string) {
    const offer = await this.prisma.offer.create({
      data: {
        ...data,
        createdById,
        status: 'draft',
        offerNumber: await this.generateOfferNumber()
      },
      include: {
        application: {
          include: {
            candidate: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            },
            jobPosting: {
              select: {
                id: true,
                title: true
              }
            }
          }
        },
        approvers: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    // Create approval workflow if required
    if (data.approverIds.length > 0) {
      await this.createOfferApprovalWorkflow(offer.id, data.approverIds);
    }

    return offer;
  }

  async updateOffer(id: string, data: UpdateOffer, updatedById: string) {
    return this.prisma.offer.update({
      where: { id },
      data: {
        ...data,
        updatedById,
        updatedAt: new Date()
      },
      include: {
        application: {
          include: {
            candidate: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        },
        approvalWorkflow: {
          include: {
            steps: {
              include: {
                approver: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true
                  }
                }
              }
            }
          }
        }
      }
    });
  }

  // ============================================================================
  // ANALYTICS & REPORTING
  // ============================================================================

  async getRecruitmentAnalytics(query: RecruitmentAnalyticsQuery) {
    const { startDate, endDate, departmentId, jobPostingId, metrics, groupBy } = query;

    const baseWhere: any = {};
    if (startDate) baseWhere.createdAt = { gte: startDate };
    if (endDate) {
      baseWhere.createdAt = baseWhere.createdAt 
        ? { ...baseWhere.createdAt, lte: endDate }
        : { lte: endDate };
    }

    const results: any = {};

    // Applications metrics
    if (!metrics || metrics.includes('applications_count')) {
      results.applicationsCount = await this.prisma.application.count({
        where: {
          ...baseWhere,
          ...(jobPostingId && { jobPostingId }),
          ...(departmentId && {
            jobPosting: {
              requisition: { departmentId }
            }
          })
        }
      });
    }

    // Candidates metrics  
    if (!metrics || metrics.includes('candidates_count')) {
      results.candidatesCount = await this.prisma.candidate.count({
        where: baseWhere
      });
    }

    // Interview metrics
    if (!metrics || metrics.includes('interviews_count')) {
      results.interviewsCount = await this.prisma.interview.count({
        where: {
          ...baseWhere,
          scheduledDate: baseWhere.createdAt
        }
      });
    }

    // Hires metrics
    if (!metrics || metrics.includes('hires_count')) {
      results.hiresCount = await this.prisma.application.count({
        where: {
          ...baseWhere,
          stage: 'hired'
        }
      });
    }

    // Conversion rates
    if (!metrics || metrics.includes('conversion_rates')) {
      const stages = ['applied', 'screening', 'phone_interview', 'technical_interview', 'onsite_interview', 'final_interview', 'hired'];
      
      results.conversionRates = {};
      for (let i = 0; i < stages.length - 1; i++) {
        const currentStage = stages[i];
        const nextStage = stages[i + 1];
        
        const [currentCount, nextCount] = await Promise.all([
          this.prisma.application.count({
            where: {
              ...baseWhere,
              stage: { in: stages.slice(i) }
            }
          }),
          this.prisma.application.count({
            where: {
              ...baseWhere,
              stage: { in: stages.slice(i + 1) }
            }
          })
        ]);
        
        results.conversionRates[`${currentStage}_to_${nextStage}`] = 
          currentCount > 0 ? (nextCount / currentCount) * 100 : 0;
      }
    }

    return results;
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  private async generateRequisitionNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.prisma.jobRequisition.count({
      where: {
        createdAt: {
          gte: new Date(`${year}-01-01`),
          lt: new Date(`${year + 1}-01-01`)
        }
      }
    });
    return `REQ-${year}-${(count + 1).toString().padStart(4, '0')}`;
  }

  private async generatePostingNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.prisma.jobPosting.count({
      where: {
        createdAt: {
          gte: new Date(`${year}-01-01`),
          lt: new Date(`${year + 1}-01-01`)
        }
      }
    });
    return `POST-${year}-${(count + 1).toString().padStart(4, '0')}`;
  }

  private async generateCandidateNumber(): Promise<string> {
    const count = await this.prisma.candidate.count();
    return `CAND-${(count + 1).toString().padStart(6, '0')}`;
  }

  private async generateApplicationNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.prisma.application.count({
      where: {
        appliedAt: {
          gte: new Date(`${year}-01-01`),
          lt: new Date(`${year + 1}-01-01`)
        }
      }
    });
    return `APP-${year}-${(count + 1).toString().padStart(4, '0')}`;
  }

  private async generateOfferNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.prisma.offer.count({
      where: {
        createdAt: {
          gte: new Date(`${year}-01-01`),
          lt: new Date(`${year + 1}-01-01`)
        }
      }
    });
    return `OFF-${year}-${(count + 1).toString().padStart(4, '0')}`;
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  private async createRequisitionApprovalWorkflow(requisitionId: string, managerId: string) {
    // Create basic approval workflow - in real implementation, this would be more sophisticated
    const workflow = await this.prisma.approvalWorkflow.create({
      data: {
        jobRequisitionId: requisitionId,
        status: 'active'
      }
    });

    // Add manager approval step
    await this.prisma.approvalStep.create({
      data: {
        workflowId: workflow.id,
        approverId: managerId,
        level: 1,
        status: 'pending',
        required: true
      }
    });

    return workflow;
  }

  private async createOfferApprovalWorkflow(offerId: string, approverIds: string[]) {
    const workflow = await this.prisma.approvalWorkflow.create({
      data: {
        offerId,
        status: 'active'
      }
    });

    // Add approval steps for each approver
    const steps = approverIds.map((approverId, index) => ({
      workflowId: workflow.id,
      approverId,
      level: index + 1,
      status: 'pending' as const,
      required: true
    }));

    await this.prisma.approvalStep.createMany({
      data: steps
    });

    return workflow;
  }
}