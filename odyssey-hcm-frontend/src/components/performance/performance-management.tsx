import React, { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Target, 
  Users, 
  MessageSquare, 
  TrendingUp, 
  Award,
  Calendar,
  Plus,
  Filter,
  BarChart3,
  CheckCircle,
  Clock,
  AlertCircle,
  Star
} from 'lucide-react';

interface PerformanceMetrics {
  totalReviews: number;
  completedReviews: number;
  activeGoals: number;
  completedGoals: number;
  feedbackCount: number;
  averageRating: number;
}

interface PerformanceReview {
  id: string;
  employee: {
    firstName: string;
    lastName: string;
    position: string;
    department: string;
  };
  reviewType: string;
  status: string;
  overallRating?: number;
  reviewPeriodEnd: string;
  selfAssessmentDeadline?: string;
  managerReviewDeadline?: string;
}

interface Goal {
  id: string;
  title: string;
  description?: string;
  employee: {
    firstName: string;
    lastName: string;
  };
  category: string;
  status: string;
  priority: string;
  progressPercentage: number;
  targetDate: string;
  keyResults?: Array<{
    title: string;
    currentValue: number;
    targetValue: number;
    unit?: string;
  }>;
}

interface Feedback {
  id: string;
  fromEmployee: {
    firstName: string;
    lastName: string;
  };
  toEmployee: {
    firstName: string;
    lastName: string;
  };
  feedbackType: string;
  subject: string;
  content: string;
  isAnonymous: boolean;
  createdAt: string;
}

export default function PerformanceManagement() {
  const [activeTab, setActiveTab] = useState('overview');
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [reviews, setReviews] = useState<PerformanceReview[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch performance metrics
      const metricsData = await apiClient.performance.analytics.performance();
      
      // Fetch recent reviews
      const reviewsData = await apiClient.performance.reviews.list({ limit: 10 });
      
      // Fetch active goals
      const goalsData = await apiClient.performance.goals.list({ status: 'active', limit: 10 });
      
      // Fetch recent feedback
      const feedbackData = await apiClient.performance.feedback.list({ limit: 10 });

      setMetrics({
        totalReviews: metricsData.total_reviews || 0,
        completedReviews: metricsData.completed_reviews || 0,
        activeGoals: goalsData.pagination?.total || 0,
        completedGoals: 0, // Will be calculated from goals data
        feedbackCount: feedbackData.pagination?.total || 0,
        averageRating: metricsData.average_rating || 0
      });
      
      setReviews(reviewsData.reviews || []);
      setGoals(goalsData.goals || []);
      setFeedback(feedbackData.feedback || []);
    } catch (error) {
      console.error('Error fetching performance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'completed': 'bg-green-100 text-green-800',
      'in_progress': 'bg-blue-100 text-blue-800',
      'pending_manager': 'bg-yellow-100 text-yellow-800',
      'pending_employee': 'bg-orange-100 text-orange-800',
      'draft': 'bg-gray-100 text-gray-800',
      'active': 'bg-blue-100 text-blue-800',
      'cancelled': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      'critical': 'bg-red-100 text-red-800',
      'high': 'bg-orange-100 text-orange-800',
      'medium': 'bg-yellow-100 text-yellow-800',
      'low': 'bg-green-100 text-green-800'
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Performance Management</h1>
          <p className="text-gray-600 mt-1">Track reviews, goals, feedback, and talent development</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Review
          </Button>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance Reviews</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.completedReviews}</div>
            <p className="text-xs text-muted-foreground">
              of {metrics?.totalReviews} total reviews
            </p>
            <Progress 
              value={metrics?.totalReviews ? (metrics.completedReviews / metrics.totalReviews) * 100 : 0} 
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Goals</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.activeGoals}</div>
            <p className="text-xs text-muted-foreground">
              {metrics?.completedGoals} completed this quarter
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Feedback Exchanges</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.feedbackCount}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.averageRating ? metrics.averageRating.toFixed(1) : '0.0'}
            </div>
            <p className="text-xs text-muted-foreground">
              out of 5.0 stars
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
          <TabsTrigger value="succession">Succession</TabsTrigger>
          <TabsTrigger value="competencies">Competencies</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Performance Reviews */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="h-5 w-5 mr-2" />
                  Recent Performance Reviews
                </CardTitle>
                <CardDescription>Latest review activities requiring attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reviews.slice(0, 5).map((review) => (
                    <div key={review.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarFallback>
                            {review.employee.firstName[0]}{review.employee.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">
                            {review.employee.firstName} {review.employee.lastName}
                          </p>
                          <p className="text-xs text-gray-600">{review.employee.position}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={getStatusColor(review.status)}>
                          {review.status.replace('_', ' ')}
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">
                          {review.reviewType}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Active Goals */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2" />
                  Active Goals
                </CardTitle>
                <CardDescription>Goals requiring attention or nearing deadlines</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {goals.slice(0, 5).map((goal) => (
                    <div key={goal.id} className="p-3 border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{goal.title}</p>
                          <p className="text-xs text-gray-600">
                            {goal.employee.firstName} {goal.employee.lastName}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getPriorityColor(goal.priority)}>
                            {goal.priority}
                          </Badge>
                          <Badge className={getStatusColor(goal.status)}>
                            {goal.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <Progress value={goal.progressPercentage} className="flex-1 mr-3" />
                        <span className="text-sm font-medium">{goal.progressPercentage}%</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Due: {formatDate(goal.targetDate)}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Feedback */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="h-5 w-5 mr-2" />
                Recent Feedback
              </CardTitle>
              <CardDescription>Latest feedback exchanges across the organization</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {feedback.slice(0, 6).map((item) => (
                  <div key={item.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                    <Avatar>
                      <AvatarFallback>
                        {item.isAnonymous ? '?' : `${item.fromEmployee.firstName[0]}${item.fromEmployee.lastName[0]}`}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm">
                          {item.isAnonymous ? 'Anonymous' : `${item.fromEmployee.firstName} ${item.fromEmployee.lastName}`}
                          {' → '}
                          {item.toEmployee.firstName} {item.toEmployee.lastName}
                        </p>
                        <Badge variant="outline">{item.feedbackType}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{item.subject}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDate(item.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews">
          <Card>
            <CardHeader>
              <CardTitle>Performance Reviews</CardTitle>
              <CardDescription>Manage performance review cycles and evaluations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-6">
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">All Reviews</Button>
                  <Button variant="outline" size="sm">Pending</Button>
                  <Button variant="outline" size="sm">Completed</Button>
                </div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Review Cycle
                </Button>
              </div>
              
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarFallback>
                            {review.employee.firstName[0]}{review.employee.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {review.employee.firstName} {review.employee.lastName}
                          </p>
                          <p className="text-sm text-gray-600">
                            {review.employee.position} • {review.employee.department}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={getStatusColor(review.status)}>
                          {review.status.replace('_', ' ')}
                        </Badge>
                        {review.overallRating && (
                          <p className="text-sm mt-1">
                            Rating: {review.overallRating}/5
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Review Type</p>
                        <p className="font-medium">{review.reviewType}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Review Period</p>
                        <p className="font-medium">{formatDate(review.reviewPeriodEnd)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Next Deadline</p>
                        <p className="font-medium">
                          {review.selfAssessmentDeadline 
                            ? formatDate(review.selfAssessmentDeadline)
                            : review.managerReviewDeadline 
                            ? formatDate(review.managerReviewDeadline)
                            : 'No deadline'
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="goals">
          <Card>
            <CardHeader>
              <CardTitle>Goals & OKRs</CardTitle>
              <CardDescription>Manage organizational and individual goals</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-6">
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">All Goals</Button>
                  <Button variant="outline" size="sm">Company</Button>
                  <Button variant="outline" size="sm">Department</Button>
                  <Button variant="outline" size="sm">Individual</Button>
                </div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Goal
                </Button>
              </div>
              
              <div className="space-y-4">
                {goals.map((goal) => (
                  <div key={goal.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-medium">{goal.title}</h3>
                        {goal.description && (
                          <p className="text-sm text-gray-600 mt-1">{goal.description}</p>
                        )}
                        <p className="text-sm text-gray-500 mt-1">
                          Owner: {goal.employee.firstName} {goal.employee.lastName}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getPriorityColor(goal.priority)}>
                          {goal.priority}
                        </Badge>
                        <Badge className={getStatusColor(goal.status)}>
                          {goal.status}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-600">Progress</span>
                        <span className="text-sm font-medium">{goal.progressPercentage}%</span>
                      </div>
                      <Progress value={goal.progressPercentage} />
                    </div>
                    
                    {goal.keyResults && goal.keyResults.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-700">Key Results</p>
                        {goal.keyResults.map((kr, index) => (
                          <div key={index} className="text-sm p-2 bg-gray-50 rounded">
                            <div className="flex justify-between items-center">
                              <span>{kr.title}</span>
                              <span className="font-medium">
                                {kr.currentValue}/{kr.targetValue} {kr.unit}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between mt-3 pt-3 border-t">
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>Category: {goal.category}</span>
                        <span>Due: {formatDate(goal.targetDate)}</span>
                      </div>
                      <Button variant="outline" size="sm">View Details</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="feedback">
          <Card>
            <CardHeader>
              <CardTitle>Feedback & Coaching</CardTitle>
              <CardDescription>Continuous feedback and development conversations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-6">
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">All Feedback</Button>
                  <Button variant="outline" size="sm">Given</Button>
                  <Button variant="outline" size="sm">Received</Button>
                  <Button variant="outline" size="sm">Requests</Button>
                </div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Give Feedback
                </Button>
              </div>
              
              <div className="space-y-4">
                {feedback.map((item) => (
                  <div key={item.id} className="border rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <Avatar>
                        <AvatarFallback>
                          {item.isAnonymous ? '?' : `${item.fromEmployee.firstName[0]}${item.fromEmployee.lastName[0]}`}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="font-medium">
                              {item.isAnonymous ? 'Anonymous Feedback' : `${item.fromEmployee.firstName} ${item.fromEmployee.lastName}`}
                              {' → '}
                              {item.toEmployee.firstName} {item.toEmployee.lastName}
                            </p>
                            <p className="text-sm text-gray-600">{item.subject}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">{item.feedbackType}</Badge>
                            <span className="text-sm text-gray-500">
                              {formatDate(item.createdAt)}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-700">{item.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="succession">
          <Card>
            <CardHeader>
              <CardTitle>Succession Planning</CardTitle>
              <CardDescription>Identify and develop future leaders</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Succession Planning</h3>
                <p className="text-gray-600 mb-6">
                  Build your succession planning module to identify and develop high-potential talent.
                </p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Succession Plan
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="competencies">
          <Card>
            <CardHeader>
              <CardTitle>Competency Framework</CardTitle>
              <CardDescription>Define and assess organizational competencies</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Competency Management</h3>
                <p className="text-gray-600 mb-6">
                  Create competency frameworks and track employee skill development.
                </p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Competency
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}