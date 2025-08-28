// API Client for Odyssey HCM Backend
class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor() {
    this.baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
  }

  setAuthToken(token: string) {
    this.token = token;
  }

  clearAuthToken() {
    this.token = null;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}/api/v1${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  // Health check
  async health() {
    return this.request<{ status: string; timestamp: string; version: string }>('/health');
  }

  // Performance Management API
  performance = {
    // Performance Reviews
    reviews: {
      list: (params?: any) => 
        this.request<{ reviews: any[]; pagination: any }>('/performance/reviews', {
          method: 'GET',
          ...(params && { 
            headers: { 
              'Content-Type': 'application/json' 
            } 
          })
        }),
      
      get: (id: string) => 
        this.request<any>(`/performance/reviews/${id}`),
      
      create: (data: any) => 
        this.request<any>('/performance/reviews', {
          method: 'POST',
          body: JSON.stringify(data),
        }),
      
      update: (id: string, data: any) => 
        this.request<any>(`/performance/reviews/${id}`, {
          method: 'PUT',
          body: JSON.stringify(data),
        }),
      
      bulkAssign: (data: any) => 
        this.request<any>('/performance/reviews/bulk-assign', {
          method: 'POST',
          body: JSON.stringify(data),
        }),
    },

    // Goals Management
    goals: {
      list: (params?: any) => 
        this.request<{ goals: any[]; pagination: any }>('/performance/goals', {
          method: 'GET',
          ...(params && {
            // Convert params to query string if needed
          })
        }),
      
      get: (id: string) => 
        this.request<any>(`/performance/goals/${id}`),
      
      create: (data: any) => 
        this.request<any>('/performance/goals', {
          method: 'POST',
          body: JSON.stringify(data),
        }),
      
      update: (id: string, data: any) => 
        this.request<any>(`/performance/goals/${id}`, {
          method: 'PUT',
          body: JSON.stringify(data),
        }),
      
      bulkUpdate: (data: any) => 
        this.request<any>('/performance/goals/bulk-update', {
          method: 'POST',
          body: JSON.stringify(data),
        }),
      
      progress: {
        create: (goalId: string, data: any) => 
          this.request<any>(`/performance/goals/${goalId}/progress`, {
            method: 'POST',
            body: JSON.stringify(data),
          }),
      }
    },

    // Key Results
    keyResults: {
      create: (goalId: string, data: any) => 
        this.request<any>(`/performance/goals/${goalId}/key-results`, {
          method: 'POST',
          body: JSON.stringify(data),
        }),
      
      update: (id: string, data: any) => 
        this.request<any>(`/performance/key-results/${id}`, {
          method: 'PUT',
          body: JSON.stringify(data),
        }),
    },

    // Feedback
    feedback: {
      list: (params?: any) => 
        this.request<{ feedback: any[]; pagination: any }>('/performance/feedback'),
      
      get: (id: string) => 
        this.request<any>(`/performance/feedback/${id}`),
      
      create: (data: any) => 
        this.request<any>('/performance/feedback', {
          method: 'POST',
          body: JSON.stringify(data),
        }),
      
      update: (id: string, data: any) => 
        this.request<any>(`/performance/feedback/${id}`, {
          method: 'PUT',
          body: JSON.stringify(data),
        }),
    },

    // Feedback Requests
    feedbackRequests: {
      create: (data: any) => 
        this.request<any>('/performance/feedback-requests', {
          method: 'POST',
          body: JSON.stringify(data),
        }),
    },

    // Succession Planning
    successionPlans: {
      list: () => 
        this.request<any[]>('/performance/succession-plans'),
      
      get: (id: string) => 
        this.request<any>(`/performance/succession-plans/${id}`),
      
      create: (data: any) => 
        this.request<any>('/performance/succession-plans', {
          method: 'POST',
          body: JSON.stringify(data),
        }),
      
      candidates: {
        create: (planId: string, data: any) => 
          this.request<any>(`/performance/succession-plans/${planId}/candidates`, {
            method: 'POST',
            body: JSON.stringify(data),
          }),
      }
    },

    // Competencies
    competencies: {
      list: () => 
        this.request<any[]>('/performance/competencies'),
      
      create: (data: any) => 
        this.request<any>('/performance/competencies', {
          method: 'POST',
          body: JSON.stringify(data),
        }),
    },

    // Competency Assessments
    competencyAssessments: {
      list: (employeeId: string) => 
        this.request<any[]>(`/performance/employees/${employeeId}/competency-assessments`),
      
      create: (employeeId: string, data: any) => 
        this.request<any>(`/performance/employees/${employeeId}/competency-assessments`, {
          method: 'POST',
          body: JSON.stringify(data),
        }),
    },

    // Analytics
    analytics: {
      performance: (params?: any) => 
        this.request<any>('/performance/analytics/performance'),
      
      goals: (params?: any) => 
        this.request<any>('/performance/analytics/goals'),
    },

    // Dashboards
    dashboards: {
      manager: (managerId: string) => 
        this.request<any>(`/performance/managers/${managerId}/dashboard`),
      
      employee: (employeeId: string) => 
        this.request<any>(`/performance/employees/${employeeId}/dashboard`),
    }
  };

  // Leave Management API
  leave = {
    requests: {
      list: (params?: any) => 
        this.request<{ requests: any[]; pagination: any }>('/leave/requests'),
      
      get: (id: string) => 
        this.request<any>(`/leave/requests/${id}`),
      
      create: (data: any) => 
        this.request<any>('/leave/requests', {
          method: 'POST',
          body: JSON.stringify(data),
        }),
      
      update: (id: string, data: any) => 
        this.request<any>(`/leave/requests/${id}`, {
          method: 'PUT',
          body: JSON.stringify(data),
        }),
      
      approve: (id: string, data?: any) => 
        this.request<any>(`/leave/requests/${id}/approve`, {
          method: 'POST',
          body: JSON.stringify(data || {}),
        }),
      
      reject: (id: string, data: any) => 
        this.request<any>(`/leave/requests/${id}/reject`, {
          method: 'POST',
          body: JSON.stringify(data),
        }),
    },

    balances: {
      get: (employeeId: string) => 
        this.request<any>(`/leave/balances/${employeeId}`),
    },

    policies: {
      list: () => 
        this.request<any[]>('/leave/policies'),
    },

    calendar: {
      get: (params?: any) => 
        this.request<any>('/leave/calendar'),
    }
  };

  // Recruitment API
  recruitment = {
    requisitions: {
      list: (params?: any) => 
        this.request<{ requisitions: any[]; pagination: any }>('/recruitment/requisitions'),
      
      get: (id: string) => 
        this.request<any>(`/recruitment/requisitions/${id}`),
      
      create: (data: any) => 
        this.request<any>('/recruitment/requisitions', {
          method: 'POST',
          body: JSON.stringify(data),
        }),
      
      update: (id: string, data: any) => 
        this.request<any>(`/recruitment/requisitions/${id}`, {
          method: 'PUT',
          body: JSON.stringify(data),
        }),
    },

    postings: {
      list: (params?: any) => 
        this.request<{ postings: any[]; pagination: any }>('/recruitment/postings'),
      
      get: (id: string) => 
        this.request<any>(`/recruitment/postings/${id}`),
      
      create: (data: any) => 
        this.request<any>('/recruitment/postings', {
          method: 'POST',
          body: JSON.stringify(data),
        }),
    },

    candidates: {
      list: (params?: any) => 
        this.request<{ candidates: any[]; pagination: any }>('/recruitment/candidates'),
      
      get: (id: string) => 
        this.request<any>(`/recruitment/candidates/${id}`),
      
      create: (data: any) => 
        this.request<any>('/recruitment/candidates', {
          method: 'POST',
          body: JSON.stringify(data),
        }),
    },

    applications: {
      list: (params?: any) => 
        this.request<{ applications: any[]; pagination: any }>('/recruitment/applications'),
      
      get: (id: string) => 
        this.request<any>(`/recruitment/applications/${id}`),
      
      update: (id: string, data: any) => 
        this.request<any>(`/recruitment/applications/${id}`, {
          method: 'PUT',
          body: JSON.stringify(data),
        }),
    },

    interviews: {
      list: (params?: any) => 
        this.request<{ interviews: any[]; pagination: any }>('/recruitment/interviews'),
      
      create: (data: any) => 
        this.request<any>('/recruitment/interviews', {
          method: 'POST',
          body: JSON.stringify(data),
        }),
    },

    offers: {
      list: (params?: any) => 
        this.request<{ offers: any[]; pagination: any }>('/recruitment/offers'),
      
      create: (data: any) => 
        this.request<any>('/recruitment/offers', {
          method: 'POST',
          body: JSON.stringify(data),
        }),
    }
  };

  // Employees API (HRIS)
  employees = {
    list: (params?: any) => 
      this.request<{ employees: any[]; pagination: any }>('/employees'),
    
    get: (id: string) => 
      this.request<any>(`/employees/${id}`),
    
    create: (data: any) => 
      this.request<any>('/employees', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    
    update: (id: string, data: any) => 
      this.request<any>(`/employees/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
  };
}

// Create a singleton instance
export const apiClient = new ApiClient();

// Export the class for testing or multiple instances
export { ApiClient };