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
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  Target, 
  Plus, 
  Calendar,
  TrendingUp,
  Users,
  AlertCircle,
  CheckCircle,
  Edit,
  Trash2,
  Filter,
  Search,
  BarChart3
} from 'lucide-react';

interface Goal {
  id: string;
  title: string;
  description?: string;
  employee: {
    id: string;
    firstName: string;
    lastName: string;
    position: string;
  };
  manager?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  category: string;
  status: string;
  priority: string;
  progressPercentage: number;
  targetDate: string;
  startDate: string;
  completionDate?: string;
  isStretchGoal: boolean;
  successCriteria: string[];
  tags: string[];
  keyResults?: KeyResult[];
  parentGoal?: {
    id: string;
    title: string;
  };
  childGoals?: Array<{
    id: string;
    title: string;
    progressPercentage: number;
  }>;
}

interface KeyResult {
  id: string;
  title: string;
  description?: string;
  targetValue: number;
  currentValue: number;
  unit?: string;
  isBinary: boolean;
  weight: number;
}

interface CreateGoalFormData {
  title: string;
  description: string;
  employeeId: string;
  managerId?: string;
  parentGoalId?: string;
  category: string;
  priority: string;
  targetDate: string;
  startDate: string;
  isStretchGoal: boolean;
  successCriteria: string[];
  tags: string[];
}

export default function GoalManagement() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);

  const [formData, setFormData] = useState<CreateGoalFormData>({
    title: '',
    description: '',
    employeeId: '',
    managerId: '',
    parentGoalId: '',
    category: 'individual',
    priority: 'medium',
    targetDate: '',
    startDate: new Date().toISOString().split('T')[0],
    isStretchGoal: false,
    successCriteria: [''],
    tags: []
  });

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const data = await apiClient.performance.goals.list({ limit: 50 });
      setGoals(data.goals || []);
    } catch (error) {
      console.error('Error fetching goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.performance.goals.create({
        ...formData,
        success_criteria: formData.successCriteria.filter(criteria => criteria.trim() !== '')
      });

      setShowCreateDialog(false);
      setFormData({
        title: '',
        description: '',
        employeeId: '',
        managerId: '',
        parentGoalId: '',
        category: 'individual',
        priority: 'medium',
        targetDate: '',
        startDate: new Date().toISOString().split('T')[0],
        isStretchGoal: false,
        successCriteria: [''],
        tags: []
      });
      fetchGoals();
    } catch (error) {
      console.error('Error creating goal:', error);
    }
  };

  const updateGoalProgress = async (goalId: string, newProgress: number) => {
    try {
      await apiClient.performance.goals.update(goalId, {
        progress_percentage: newProgress
      });
      
      fetchGoals();
    } catch (error) {
      console.error('Error updating goal progress:', error);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'active': 'bg-blue-100 text-blue-800',
      'completed': 'bg-green-100 text-green-800',
      'on_hold': 'bg-yellow-100 text-yellow-800',
      'cancelled': 'bg-red-100 text-red-800',
      'draft': 'bg-gray-100 text-gray-800'
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

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'company': 'bg-purple-100 text-purple-800',
      'department': 'bg-blue-100 text-blue-800',
      'team': 'bg-cyan-100 text-cyan-800',
      'individual': 'bg-green-100 text-green-800',
      'development': 'bg-orange-100 text-orange-800',
      'performance': 'bg-pink-100 text-pink-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredGoals = goals.filter(goal => {
    const matchesSearch = goal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         goal.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         `${goal.employee.firstName} ${goal.employee.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filterCategory === 'all' || goal.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || goal.status === filterStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const addSuccessCriteria = () => {
    setFormData(prev => ({
      ...prev,
      successCriteria: [...prev.successCriteria, '']
    }));
  };

  const updateSuccessCriteria = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      successCriteria: prev.successCriteria.map((criteria, i) => i === index ? value : criteria)
    }));
  };

  const removeSuccessCriteria = (index: number) => {
    setFormData(prev => ({
      ...prev,
      successCriteria: prev.successCriteria.filter((_, i) => i !== index)
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
          <h1 className="text-3xl font-bold text-gray-900">Goal Management</h1>
          <p className="text-gray-600 mt-1">Set, track, and achieve organizational and individual goals</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Goal
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create New Goal</DialogTitle>
              <DialogDescription>
                Set up a new goal with clear objectives and success criteria.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateGoal} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Goal Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter goal title"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="company">Company</SelectItem>
                      <SelectItem value="department">Department</SelectItem>
                      <SelectItem value="team">Team</SelectItem>
                      <SelectItem value="individual">Individual</SelectItem>
                      <SelectItem value="development">Development</SelectItem>
                      <SelectItem value="performance">Performance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the goal and its purpose"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={formData.priority} onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="targetDate">Target Date</Label>
                  <Input
                    id="targetDate"
                    type="date"
                    value={formData.targetDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, targetDate: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div>
                <Label>Success Criteria</Label>
                <div className="space-y-2">
                  {formData.successCriteria.map((criteria, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Input
                        value={criteria}
                        onChange={(e) => updateSuccessCriteria(index, e.target.value)}
                        placeholder="Define success criteria"
                      />
                      {formData.successCriteria.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeSuccessCriteria(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addSuccessCriteria}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Criteria
                  </Button>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isStretchGoal"
                  checked={formData.isStretchGoal}
                  onChange={(e) => setFormData(prev => ({ ...prev, isStretchGoal: e.target.checked }))}
                />
                <Label htmlFor="isStretchGoal">Mark as stretch goal</Label>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Goal</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                <Input
                  placeholder="Search goals, descriptions, or people..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="company">Company</SelectItem>
                  <SelectItem value="department">Department</SelectItem>
                  <SelectItem value="team">Team</SelectItem>
                  <SelectItem value="individual">Individual</SelectItem>
                  <SelectItem value="development">Development</SelectItem>
                  <SelectItem value="performance">Performance</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="on_hold">On Hold</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Goals List */}
      <div className="space-y-4">
        {filteredGoals.map((goal) => (
          <Card key={goal.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold">{goal.title}</h3>
                    {goal.isStretchGoal && (
                      <Badge variant="outline" className="text-orange-600 border-orange-600">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        Stretch
                      </Badge>
                    )}
                  </div>
                  {goal.description && (
                    <p className="text-gray-600 mb-3">{goal.description}</p>
                  )}
                  <div className="flex items-center space-x-2 mb-3">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs">
                        {goal.employee.firstName[0]}{goal.employee.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-gray-600">
                      {goal.employee.firstName} {goal.employee.lastName}
                    </span>
                    <span className="text-sm text-gray-400">•</span>
                    <span className="text-sm text-gray-600">{goal.employee.position}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getCategoryColor(goal.category)}>
                    {goal.category}
                  </Badge>
                  <Badge className={getPriorityColor(goal.priority)}>
                    {goal.priority}
                  </Badge>
                  <Badge className={getStatusColor(goal.status)}>
                    {goal.status}
                  </Badge>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Progress</span>
                  <span className="text-sm font-medium">{goal.progressPercentage}%</span>
                </div>
                <Progress value={goal.progressPercentage} className="h-2" />
              </div>

              {goal.keyResults && goal.keyResults.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Key Results</h4>
                  <div className="space-y-2">
                    {goal.keyResults.map((kr) => (
                      <div key={kr.id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">{kr.title}</span>
                          <span className="text-sm text-gray-600">
                            {kr.currentValue}/{kr.targetValue} {kr.unit}
                          </span>
                        </div>
                        {kr.description && (
                          <p className="text-xs text-gray-600 mt-1">{kr.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {goal.successCriteria.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Success Criteria</h4>
                  <ul className="space-y-1">
                    {goal.successCriteria.map((criteria, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-center">
                        <CheckCircle className="h-3 w-3 mr-2 text-green-500" />
                        {criteria}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <Separator className="my-4" />

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Due: {formatDate(goal.targetDate)}
                  </span>
                  {goal.parentGoal && (
                    <span className="flex items-center">
                      <Target className="h-4 w-4 mr-1" />
                      Parent: {goal.parentGoal.title}
                    </span>
                  )}
                  {goal.childGoals && goal.childGoals.length > 0 && (
                    <span className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      {goal.childGoals.length} sub-goals
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedGoal(goal);
                      setShowDetailDialog(true);
                    }}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedGoal(goal);
                      setShowDetailDialog(true);
                    }}
                  >
                    View Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredGoals.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No goals found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || filterCategory !== 'all' || filterStatus !== 'all'
                ? 'Try adjusting your search or filters.'
                : 'Get started by creating your first goal.'}
            </p>
            {(!searchTerm && filterCategory === 'all' && filterStatus === 'all') && (
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Goal
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Goal Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="sm:max-w-[700px]">
          {selectedGoal && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  <span>{selectedGoal.title}</span>
                  {selectedGoal.isStretchGoal && (
                    <Badge variant="outline" className="text-orange-600 border-orange-600">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Stretch
                    </Badge>
                  )}
                </DialogTitle>
                <DialogDescription>
                  {selectedGoal.description}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                {/* Goal Details */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="text-gray-600">Owner</Label>
                    <p className="font-medium">
                      {selectedGoal.employee.firstName} {selectedGoal.employee.lastName}
                    </p>
                  </div>
                  <div>
                    <Label className="text-gray-600">Category</Label>
                    <Badge className={getCategoryColor(selectedGoal.category)}>
                      {selectedGoal.category}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-gray-600">Priority</Label>
                    <Badge className={getPriorityColor(selectedGoal.priority)}>
                      {selectedGoal.priority}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-gray-600">Status</Label>
                    <Badge className={getStatusColor(selectedGoal.status)}>
                      {selectedGoal.status}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-gray-600">Start Date</Label>
                    <p className="font-medium">{formatDate(selectedGoal.startDate)}</p>
                  </div>
                  <div>
                    <Label className="text-gray-600">Target Date</Label>
                    <p className="font-medium">{formatDate(selectedGoal.targetDate)}</p>
                  </div>
                </div>

                {/* Progress */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-gray-600">Progress</Label>
                    <span className="text-sm font-medium">{selectedGoal.progressPercentage}%</span>
                  </div>
                  <Progress value={selectedGoal.progressPercentage} className="h-2" />
                </div>

                {/* Success Criteria */}
                {selectedGoal.successCriteria.length > 0 && (
                  <div>
                    <Label className="text-gray-600 mb-2 block">Success Criteria</Label>
                    <ul className="space-y-2">
                      {selectedGoal.successCriteria.map((criteria, index) => (
                        <li key={index} className="flex items-center text-sm">
                          <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                          {criteria}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Key Results */}
                {selectedGoal.keyResults && selectedGoal.keyResults.length > 0 && (
                  <div>
                    <Label className="text-gray-600 mb-2 block">Key Results</Label>
                    <div className="space-y-3">
                      {selectedGoal.keyResults.map((kr) => (
                        <div key={kr.id} className="p-3 border rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium">{kr.title}</span>
                            <span className="text-sm text-gray-600">
                              {kr.currentValue}/{kr.targetValue} {kr.unit}
                            </span>
                          </div>
                          {kr.description && (
                            <p className="text-sm text-gray-600 mb-2">{kr.description}</p>
                          )}
                          <Progress 
                            value={kr.isBinary 
                              ? (kr.currentValue >= kr.targetValue ? 100 : 0)
                              : Math.min((kr.currentValue / kr.targetValue) * 100, 100)
                            } 
                            className="h-1" 
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}