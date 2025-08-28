import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, Plus, Search, Filter, Users, Calendar, 
  FileText, CheckCircle, Clock, AlertCircle, TrendingUp, Target 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface RecruitmentStats {
  activeRequisitions: number;
  activePostings: number;
  recentApplications: number;
  pendingInterviews: number;
  pendingOffers: number;
}

interface JobRequisition {
  id: string;
  title: string;
  department: {
    name: string;
  };
  requestingManager: {
    firstName: string;
    lastName: string;
  };
  status: string;
  urgency: string;
  createdAt: string;
  _count: {
    applications: number;
  };
}

interface Application {
  id: string;
  stage: string;
  appliedAt: string;
  candidate: {
    firstName: string;
    lastName: string;
    email: string;
    currentTitle?: string;
  };
  jobPosting: {
    title: string;
    location: string;
  };
}

interface Interview {
  id: string;
  scheduledDate: string;
  type: string;
  status: string;
  application: {
    candidate: {
      firstName: string;
      lastName: string;
    };
    jobPosting: {
      title: string;
    };
  };
}

export const RecruitmentManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<RecruitmentStats>({
    activeRequisitions: 0,
    activePostings: 0,
    recentApplications: 0,
    pendingInterviews: 0,
    pendingOffers: 0
  });
  const [requisitions, setRequisitions] = useState<JobRequisition[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch dashboard stats
      const statsResponse = await fetch('/api/recruitment/dashboard');
      const statsData = await statsResponse.json();
      
      if (statsData.success) {
        setStats(statsData.data);
      }

      // Fetch recent requisitions
      const requisitionsResponse = await fetch('/api/recruitment/requisitions?limit=5');
      const requisitionsData = await requisitionsResponse.json();
      
      if (requisitionsData.success) {
        setRequisitions(requisitionsData.data);
      }

      // Fetch recent applications  
      const applicationsResponse = await fetch('/api/recruitment/applications?limit=10');
      const applicationsData = await applicationsResponse.json();
      
      if (applicationsData.success) {
        setApplications(applicationsData.data);
      }

      // Fetch upcoming interviews
      const interviewsResponse = await fetch('/api/recruitment/interviews?status=scheduled&limit=5');
      const interviewsData = await interviewsResponse.json();
      
      if (interviewsData.success) {
        setInterviews(interviewsData.data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'hired':
        return 'bg-green-100 text-green-800';
      case 'offer_sent':
      case 'offer_pending':
        return 'bg-blue-100 text-blue-800';
      case 'final_interview':
      case 'onsite_interview':
        return 'bg-purple-100 text-purple-800';
      case 'technical_interview':
      case 'phone_interview':
        return 'bg-orange-100 text-orange-800';
      case 'screening':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
      case 'withdrawn':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatStage = (stage: string) => {
    return stage.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" asChild>
                <Link to="/dashboard">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Link>
              </Button>
              
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Target className="h-6 w-6 text-blue-600" />
                  Recruitment & ATS
                </h1>
                <p className="text-sm text-gray-600">Manage your talent pipeline from application to hire</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                New Requisition
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="requisitions">Requisitions</TabsTrigger>
              <TabsTrigger value="postings">Job Postings</TabsTrigger>
              <TabsTrigger value="candidates">Candidates</TabsTrigger>
              <TabsTrigger value="applications">Applications</TabsTrigger>
              <TabsTrigger value="interviews">Interviews</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Active Requisitions</p>
                        <p className="text-3xl font-bold text-gray-900">{stats.activeRequisitions}</p>
                      </div>
                      <FileText className="h-8 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Live Job Postings</p>
                        <p className="text-3xl font-bold text-gray-900">{stats.activePostings}</p>
                      </div>
                      <Target className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">New Applications</p>
                        <p className="text-3xl font-bold text-gray-900">{stats.recentApplications}</p>
                        <p className="text-sm text-green-600">Last 30 days</p>
                      </div>
                      <Users className="h-8 w-8 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Pending Interviews</p>
                        <p className="text-3xl font-bold text-gray-900">{stats.pendingInterviews}</p>
                      </div>
                      <Calendar className="h-8 w-8 text-orange-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Pending Offers</p>
                        <p className="text-3xl font-bold text-gray-900">{stats.pendingOffers}</p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-indigo-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Requisitions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      Recent Job Requisitions
                      <Button variant="outline" size="sm" asChild>
                        <Link to="/recruitment?tab=requisitions">View All</Link>
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {requisitions.map((requisition) => (
                        <div key={requisition.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900">{requisition.title}</h3>
                            <p className="text-sm text-gray-600">
                              {requisition.department.name} • {requisition.requestingManager.firstName} {requisition.requestingManager.lastName}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(requisition.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getUrgencyColor(requisition.urgency)}>
                              {requisition.urgency}
                            </Badge>
                            <span className="text-sm text-gray-500">
                              {requisition._count.applications} applications
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Applications */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      Recent Applications
                      <Button variant="outline" size="sm" asChild>
                        <Link to="/recruitment?tab=applications">View All</Link>
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {applications.slice(0, 5).map((application) => (
                        <div key={application.id} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback>
                              {application.candidate.firstName[0]}{application.candidate.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900">
                              {application.candidate.firstName} {application.candidate.lastName}
                            </h3>
                            <p className="text-sm text-gray-600">{application.jobPosting.title}</p>
                            <p className="text-xs text-gray-500">
                              Applied {new Date(application.appliedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge className={getStageColor(application.stage)}>
                            {formatStage(application.stage)}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Upcoming Interviews */}
              {interviews.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      Upcoming Interviews
                      <Button variant="outline" size="sm" asChild>
                        <Link to="/recruitment?tab=interviews">View All</Link>
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {interviews.map((interview) => (
                        <div key={interview.id} className="p-4 border border-gray-200 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <Badge variant="outline" className="capitalize">
                              {interview.type.replace('_', ' ')}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {new Date(interview.scheduledDate).toLocaleDateString()}
                            </span>
                          </div>
                          <h3 className="font-medium text-gray-900 mb-1">
                            {interview.application.candidate.firstName} {interview.application.candidate.lastName}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">
                            {interview.application.jobPosting.title}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(interview.scheduledDate).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Requisitions Tab */}
            <TabsContent value="requisitions" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <CardTitle>Job Requisitions</CardTitle>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Search className="h-4 w-4 text-gray-400" />
                        <Input placeholder="Search requisitions..." className="w-64" />
                      </div>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        New Requisition
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 text-gray-500">
                    <Target className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium mb-2">Job Requisitions</h3>
                    <p className="mb-4">This is where job requisitions would be displayed and managed.</p>
                    <p className="text-sm">The full implementation would include requisition creation, approval workflows, and status tracking.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Job Postings Tab */}
            <TabsContent value="postings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Job Postings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium mb-2">Job Postings Management</h3>
                    <p className="mb-4">Manage active job postings and career page content.</p>
                    <p className="text-sm">Features would include posting creation, multi-platform publishing, and application tracking.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Candidates Tab */}
            <TabsContent value="candidates" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Candidate Database</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium mb-2">Candidate Management</h3>
                    <p className="mb-4">Search, filter, and manage your candidate database.</p>
                    <p className="text-sm">Advanced search by skills, experience, location, and availability.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Applications Tab */}
            <TabsContent value="applications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Application Pipeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 text-gray-500">
                    <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium mb-2">Application Management</h3>
                    <p className="mb-4">Track candidates through your recruitment pipeline.</p>
                    <p className="text-sm">Kanban-style board with drag-and-drop stage management and bulk actions.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Interviews Tab */}
            <TabsContent value="interviews" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Interview Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 text-gray-500">
                    <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium mb-2">Interview Scheduling</h3>
                    <p className="mb-4">Schedule interviews and collect structured feedback.</p>
                    <p className="text-sm">Calendar integration, automated reminders, and feedback collection forms.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};