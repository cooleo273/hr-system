import React, { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Award, 
  Plus, 
  Calendar,
  Star,
  Users,
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
  Send,
  Save,
  User
} from 'lucide-react';

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  position: string;
  department: string;
}

interface PerformanceReview {
  id: string;
  employee: Employee;
  reviewer: Employee;
  reviewNumber: string;
  reviewPeriodStart: string;
  reviewPeriodEnd: string;
  reviewType: string;
  status: string;
  overallRating?: number;
  goalsAchievementRating?: number;
  competenciesRating?: number;
  developmentAreas: string[];
  achievements: string[];
  managerComments?: string;
  employeeComments?: string;
  hrComments?: string;
  selfAssessmentDeadline?: string;
  managerReviewDeadline?: string;
  finalMeetingDate?: string;
  nextReviewDate?: string;
}

interface ReviewQuestion {
  id: string;
  questionText: string;
  questionType: 'text' | 'rating' | 'multiple_choice' | 'boolean';
  isRequired: boolean;
  weight: number;
  options?: string[];
  section?: string;
}

interface ReviewResponse {
  questionId: string;
  responseText?: string;
  responseRating?: number;
  responseBoolean?: boolean;
  responseChoice?: string;
}

interface CreateReviewFormData {
  employeeId: string;
  reviewerId: string;
  reviewPeriodStart: string;
  reviewPeriodEnd: string;
  reviewType: string;
  selfAssessmentDeadline: string;
  managerReviewDeadline: string;
  finalMeetingDate?: string;
}

export default function PerformanceReviewForm() {
  const [reviews, setReviews] = useState<PerformanceReview[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [reviewQuestions, setReviewQuestions] = useState<ReviewQuestion[]>([]);
  const [selectedReview, setSelectedReview] = useState<PerformanceReview | null>(null);
  const [responses, setResponses] = useState<ReviewResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  
  const [formData, setFormData] = useState<CreateReviewFormData>({
    employeeId: '',
    reviewerId: '',
    reviewPeriodStart: '',
    reviewPeriodEnd: '',
    reviewType: 'annual',
    selfAssessmentDeadline: '',
    managerReviewDeadline: '',
    finalMeetingDate: ''
  });

  const [reviewFormData, setReviewFormData] = useState({
    overallRating: 0,
    goalsAchievementRating: 0,
    competenciesRating: 0,
    achievements: [''],
    developmentAreas: [''],
    managerComments: '',
    employeeComments: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch performance reviews
      const reviewsData = await apiClient.performance.reviews.list();
      
      // Fetch employees
      const employeesData = await apiClient.employees.list();
      
      setReviews(reviewsData.reviews || []);
      setEmployees(employeesData.employees || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReview = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.performance.reviews.create({
        employee_id: formData.employeeId,
        reviewer_id: formData.reviewerId,
        review_period_start: formData.reviewPeriodStart,
        review_period_end: formData.reviewPeriodEnd,
        review_type: formData.reviewType,
        self_assessment_deadline: formData.selfAssessmentDeadline,
        manager_review_deadline: formData.managerReviewDeadline,
        final_meeting_date: formData.finalMeetingDate || undefined
      });

      setShowCreateDialog(false);
      setFormData({
        employeeId: '',
        reviewerId: '',
        reviewPeriodStart: '',
        reviewPeriodEnd: '',
        reviewType: 'annual',
        selfAssessmentDeadline: '',
        managerReviewDeadline: '',
        finalMeetingDate: ''
      });
      fetchData();
    } catch (error) {
      console.error('Error creating review:', error);
    }
  };

  const handleSaveReview = async () => {
    if (!selectedReview) return;

    try {
      await apiClient.performance.reviews.update(selectedReview.id, {
        overall_rating: reviewFormData.overallRating || undefined,
        goals_achievement_rating: reviewFormData.goalsAchievementRating || undefined,
        competencies_rating: reviewFormData.competenciesRating || undefined,
        achievements: reviewFormData.achievements.filter(a => a.trim() !== ''),
        development_areas: reviewFormData.developmentAreas.filter(d => d.trim() !== ''),
        manager_comments: reviewFormData.managerComments || undefined,
        employee_comments: reviewFormData.employeeComments || undefined,
        status: 'in_progress'
      });

      setShowReviewDialog(false);
      fetchData();
    } catch (error) {
      console.error('Error saving review:', error);
    }
  };

  const handleSubmitReview = async () => {
    if (!selectedReview) return;

    try {
      await apiClient.performance.reviews.update(selectedReview.id, {
        overall_rating: reviewFormData.overallRating,
        goals_achievement_rating: reviewFormData.goalsAchievementRating,
        competencies_rating: reviewFormData.competenciesRating,
        achievements: reviewFormData.achievements.filter(a => a.trim() !== ''),
        development_areas: reviewFormData.developmentAreas.filter(d => d.trim() !== ''),
        manager_comments: reviewFormData.managerComments,
        employee_comments: reviewFormData.employeeComments,
        status: 'completed'
      });

      setShowReviewDialog(false);
      fetchData();
    } catch (error) {
      console.error('Error submitting review:', error);
    }
  };

  const openReviewDialog = (review: PerformanceReview) => {
    setSelectedReview(review);
    setReviewFormData({
      overallRating: review.overallRating || 0,
      goalsAchievementRating: review.goalsAchievementRating || 0,
      competenciesRating: review.competenciesRating || 0,
      achievements: review.achievements.length > 0 ? review.achievements : [''],
      developmentAreas: review.developmentAreas.length > 0 ? review.developmentAreas : [''],
      managerComments: review.managerComments || '',
      employeeComments: review.employeeComments || ''
    });
    setShowReviewDialog(true);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'draft': 'bg-gray-100 text-gray-800',
      'in_progress': 'bg-blue-100 text-blue-800',
      'pending_manager': 'bg-yellow-100 text-yellow-800',
      'pending_employee': 'bg-orange-100 text-orange-800',
      'pending_hr': 'bg-purple-100 text-purple-800',
      'completed': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'in_progress':
      case 'pending_manager':
      case 'pending_employee':
        return <Clock className="h-4 w-4" />;
      case 'draft':
        return <FileText className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const RatingStars = ({ rating, onRatingChange, readonly = false }: { 
    rating: number; 
    onRatingChange?: (rating: number) => void; 
    readonly?: boolean;
  }) => (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={`${
            star <= rating ? 'text-yellow-400' : 'text-gray-300'
          } hover:text-yellow-400 transition-colors ${readonly ? 'cursor-default' : 'cursor-pointer'}`}
          onClick={() => !readonly && onRatingChange && onRatingChange(star)}
          disabled={readonly}
        >
          <Star className="h-5 w-5 fill-current" />
        </button>
      ))}
      <span className="ml-2 text-sm text-gray-600">{rating}/5</span>
    </div>
  );

  const addListItem = (field: 'achievements' | 'developmentAreas') => {
    setReviewFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const updateListItem = (field: 'achievements' | 'developmentAreas', index: number, value: string) => {
    setReviewFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const removeListItem = (field: 'achievements' | 'developmentAreas', index: number) => {
    setReviewFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="h-32 bg-gray-200 rounded-lg"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Performance Reviews</h1>
          <p className="text-gray-600 mt-1">Manage employee performance evaluations and feedback cycles</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Review
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create Performance Review</DialogTitle>
              <DialogDescription>
                Set up a new performance review cycle for an employee.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateReview} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="employeeId">Employee</Label>
                  <Select value={formData.employeeId} onValueChange={(value) => setFormData(prev => ({ ...prev, employeeId: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((employee) => (
                        <SelectItem key={employee.id} value={employee.id}>
                          {employee.firstName} {employee.lastName} - {employee.position}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="reviewType">Review Type</Label>
                  <Select value={formData.reviewType} onValueChange={(value) => setFormData(prev => ({ ...prev, reviewType: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="annual">Annual Review</SelectItem>
                      <SelectItem value="quarterly">Quarterly Review</SelectItem>
                      <SelectItem value="probationary">Probationary Review</SelectItem>
                      <SelectItem value="project_based">Project-Based Review</SelectItem>
                      <SelectItem value="360_degree">360-Degree Review</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="reviewPeriodStart">Review Period Start</Label>
                  <Input
                    id="reviewPeriodStart"
                    type="date"
                    value={formData.reviewPeriodStart}
                    onChange={(e) => setFormData(prev => ({ ...prev, reviewPeriodStart: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="reviewPeriodEnd">Review Period End</Label>
                  <Input
                    id="reviewPeriodEnd"
                    type="date"
                    value={formData.reviewPeriodEnd}
                    onChange={(e) => setFormData(prev => ({ ...prev, reviewPeriodEnd: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="selfAssessmentDeadline">Self-Assessment Deadline</Label>
                  <Input
                    id="selfAssessmentDeadline"
                    type="datetime-local"
                    value={formData.selfAssessmentDeadline}
                    onChange={(e) => setFormData(prev => ({ ...prev, selfAssessmentDeadline: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="managerReviewDeadline">Manager Review Deadline</Label>
                  <Input
                    id="managerReviewDeadline"
                    type="datetime-local"
                    value={formData.managerReviewDeadline}
                    onChange={(e) => setFormData(prev => ({ ...prev, managerReviewDeadline: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="finalMeetingDate">Final Meeting Date (Optional)</Label>
                <Input
                  id="finalMeetingDate"
                  type="datetime-local"
                  value={formData.finalMeetingDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, finalMeetingDate: e.target.value }))}
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Review</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <Card key={review.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarFallback>
                      {review.employee.firstName[0]}{review.employee.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-semibold">
                      {review.employee.firstName} {review.employee.lastName}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {review.employee.position} • {review.employee.department}
                    </p>
                    <p className="text-sm text-gray-500">
                      Review #{review.reviewNumber}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge className={getStatusColor(review.status)}>
                    {getStatusIcon(review.status)}
                    <span className="ml-1">{review.status.replace('_', ' ')}</span>
                  </Badge>
                  <p className="text-sm text-gray-600 mt-1">{review.reviewType}</p>
                  {review.overallRating && (
                    <div className="mt-2">
                      <RatingStars rating={review.overallRating} readonly />
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm mb-4">
                <div>
                  <p className="text-gray-600">Review Period</p>
                  <p className="font-medium">
                    {formatDate(review.reviewPeriodStart)} - {formatDate(review.reviewPeriodEnd)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Reviewer</p>
                  <p className="font-medium">
                    {review.reviewer.firstName} {review.reviewer.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Self-Assessment Due</p>
                  <p className="font-medium">
                    {review.selfAssessmentDeadline 
                      ? formatDate(review.selfAssessmentDeadline)
                      : 'Not set'
                    }
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Manager Review Due</p>
                  <p className="font-medium">
                    {review.managerReviewDeadline 
                      ? formatDate(review.managerReviewDeadline)
                      : 'Not set'
                    }
                  </p>
                </div>
              </div>

              {(review.achievements.length > 0 || review.developmentAreas.length > 0) && (
                <div className="mb-4">
                  {review.achievements.length > 0 && (
                    <div className="mb-3">
                      <p className="text-sm font-medium text-green-700 mb-1">Key Achievements</p>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {review.achievements.slice(0, 2).map((achievement, index) => (
                          <li key={index} className="flex items-start">
                            <CheckCircle className="h-3 w-3 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
                            {achievement}
                          </li>
                        ))}
                        {review.achievements.length > 2 && (
                          <li className="text-xs text-gray-500">
                            +{review.achievements.length - 2} more achievements
                          </li>
                        )}
                      </ul>
                    </div>
                  )}

                  {review.developmentAreas.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-blue-700 mb-1">Development Areas</p>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {review.developmentAreas.slice(0, 2).map((area, index) => (
                          <li key={index} className="flex items-start">
                            <AlertCircle className="h-3 w-3 mr-2 mt-0.5 text-blue-500 flex-shrink-0" />
                            {area}
                          </li>
                        ))}
                        {review.developmentAreas.length > 2 && (
                          <li className="text-xs text-gray-500">
                            +{review.developmentAreas.length - 2} more areas
                          </li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              <Separator className="my-4" />

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  {review.finalMeetingDate && (
                    <span className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      Meeting: {formatDate(review.finalMeetingDate)}
                    </span>
                  )}
                  {review.nextReviewDate && (
                    <span className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      Next: {formatDate(review.nextReviewDate)}
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openReviewDialog(review)}
                  >
                    {review.status === 'completed' ? 'View Review' : 'Complete Review'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Review Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          {selectedReview && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>
                    Performance Review: {selectedReview.employee.firstName} {selectedReview.employee.lastName}
                  </span>
                </DialogTitle>
                <DialogDescription>
                  {selectedReview.reviewType} • {formatDate(selectedReview.reviewPeriodStart)} - {formatDate(selectedReview.reviewPeriodEnd)}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Ratings Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Overall Rating</Label>
                    <RatingStars 
                      rating={reviewFormData.overallRating} 
                      onRatingChange={(rating) => setReviewFormData(prev => ({ ...prev, overallRating: rating }))}
                      readonly={selectedReview.status === 'completed'}
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Goals Achievement</Label>
                    <RatingStars 
                      rating={reviewFormData.goalsAchievementRating} 
                      onRatingChange={(rating) => setReviewFormData(prev => ({ ...prev, goalsAchievementRating: rating }))}
                      readonly={selectedReview.status === 'completed'}
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Competencies</Label>
                    <RatingStars 
                      rating={reviewFormData.competenciesRating} 
                      onRatingChange={(rating) => setReviewFormData(prev => ({ ...prev, competenciesRating: rating }))}
                      readonly={selectedReview.status === 'completed'}
                    />
                  </div>
                </div>

                <Separator />

                {/* Achievements Section */}
                <div>
                  <Label className="text-sm font-medium mb-3 block">Key Achievements</Label>
                  <div className="space-y-2">
                    {reviewFormData.achievements.map((achievement, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Textarea
                          value={achievement}
                          onChange={(e) => updateListItem('achievements', index, e.target.value)}
                          placeholder="Describe a key achievement..."
                          rows={2}
                          disabled={selectedReview.status === 'completed'}
                        />
                        {reviewFormData.achievements.length > 1 && selectedReview.status !== 'completed' && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeListItem('achievements', index)}
                          >
                            ×
                          </Button>
                        )}
                      </div>
                    ))}
                    {selectedReview.status !== 'completed' && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addListItem('achievements')}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Achievement
                      </Button>
                    )}
                  </div>
                </div>

                {/* Development Areas Section */}
                <div>
                  <Label className="text-sm font-medium mb-3 block">Development Areas</Label>
                  <div className="space-y-2">
                    {reviewFormData.developmentAreas.map((area, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Textarea
                          value={area}
                          onChange={(e) => updateListItem('developmentAreas', index, e.target.value)}
                          placeholder="Identify an area for development..."
                          rows={2}
                          disabled={selectedReview.status === 'completed'}
                        />
                        {reviewFormData.developmentAreas.length > 1 && selectedReview.status !== 'completed' && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeListItem('developmentAreas', index)}
                          >
                            ×
                          </Button>
                        )}
                      </div>
                    ))}
                    {selectedReview.status !== 'completed' && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addListItem('developmentAreas')}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Development Area
                      </Button>
                    )}
                  </div>
                </div>

                {/* Comments Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="managerComments" className="text-sm font-medium mb-2 block">
                      Manager Comments
                    </Label>
                    <Textarea
                      id="managerComments"
                      value={reviewFormData.managerComments}
                      onChange={(e) => setReviewFormData(prev => ({ ...prev, managerComments: e.target.value }))}
                      placeholder="Manager's overall comments and feedback..."
                      rows={4}
                      disabled={selectedReview.status === 'completed'}
                    />
                  </div>
                  <div>
                    <Label htmlFor="employeeComments" className="text-sm font-medium mb-2 block">
                      Employee Comments
                    </Label>
                    <Textarea
                      id="employeeComments"
                      value={reviewFormData.employeeComments}
                      onChange={(e) => setReviewFormData(prev => ({ ...prev, employeeComments: e.target.value }))}
                      placeholder="Employee's self-assessment and comments..."
                      rows={4}
                      disabled={selectedReview.status === 'completed'}
                    />
                  </div>
                </div>

                <Separator />

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setShowReviewDialog(false)}>
                    {selectedReview.status === 'completed' ? 'Close' : 'Cancel'}
                  </Button>
                  {selectedReview.status !== 'completed' && (
                    <>
                      <Button type="button" variant="outline" onClick={handleSaveReview}>
                        <Save className="h-4 w-4 mr-2" />
                        Save Draft
                      </Button>
                      <Button onClick={handleSubmitReview}>
                        <Send className="h-4 w-4 mr-2" />
                        Submit Review
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {reviews.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No performance reviews</h3>
            <p className="text-gray-600 mb-6">
              Get started by creating your first performance review cycle.
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Review
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}