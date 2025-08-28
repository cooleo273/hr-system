import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Clock, AlertCircle, User, FileText, Key, Laptop } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

const mockWorkflow = {
  id: 'WF-001',
  employeeName: 'John Doe',
  position: 'Senior Software Engineer',
  department: 'Engineering',
  startDate: '2024-01-15',
  progress: 65,
  status: 'in_progress'
};

const mockTasks = [
  {
    id: '1',
    title: 'HR Welcome & Introduction',
    description: 'Initial meeting with HR team and company overview',
    assignee: 'HR Team',
    status: 'completed',
    dueDate: '2024-01-15',
    icon: User,
    category: 'HR'
  },
  {
    id: '2',
    title: 'Complete Employment Paperwork',
    description: 'Fill out tax forms, emergency contacts, and company policies',
    assignee: 'Employee',
    status: 'completed',
    dueDate: '2024-01-16',
    icon: FileText,
    category: 'Documentation'
  },
  {
    id: '3',
    title: 'IT Setup & Account Creation',
    description: 'Set up computer, email, and access to company systems',
    assignee: 'IT Team',
    status: 'in_progress',
    dueDate: '2024-01-17',
    icon: Laptop,
    category: 'IT'
  },
  {
    id: '4',
    title: 'Security Badge & Building Access',
    description: 'Obtain security clearance and building access card',
    assignee: 'Security',
    status: 'in_progress',
    dueDate: '2024-01-17',
    icon: Key,
    category: 'Security'
  },
  {
    id: '5',
    title: 'Department Orientation',
    description: 'Meet team members and learn about department processes',
    assignee: 'Manager',
    status: 'pending',
    dueDate: '2024-01-18',
    icon: User,
    category: 'Team'
  },
  {
    id: '6',
    title: 'Benefits Enrollment',
    description: 'Choose health insurance, retirement plans, and other benefits',
    assignee: 'Employee',
    status: 'pending',
    dueDate: '2024-01-22',
    icon: FileText,
    category: 'Benefits'
  }
];

export const OnboardingWorkflow: React.FC = () => {
  const { workflowId } = useParams();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'in_progress':
        return <Clock className="h-5 w-5 text-blue-600" />;
      case 'pending':
        return <AlertCircle className="h-5 w-5 text-gray-400" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Button variant="outline" size="sm" asChild className="mb-4">
              <Link to="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Onboarding Workflow</h1>
                <p className="text-gray-600">Workflow ID: {workflowId || mockWorkflow.id}</p>
              </div>
              
              <Badge className={getStatusColor(mockWorkflow.status)} variant="outline">
                {mockWorkflow.status.replace('_', ' ')} 
              </Badge>
            </div>
          </div>

          {/* Employee Info & Progress */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Employee Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Employee Name</label>
                    <p className="text-lg font-semibold">{mockWorkflow.employeeName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Position</label>
                    <p className="text-sm text-gray-900">{mockWorkflow.position}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Department</label>
                    <p className="text-sm text-gray-900">{mockWorkflow.department}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Start Date</label>
                    <p className="text-sm text-gray-900">
                      {new Date(mockWorkflow.startDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Overall Progress</label>
                    <div className="mt-2">
                      <Progress value={mockWorkflow.progress} className="h-2" />
                      <p className="text-sm text-gray-600 mt-1">{mockWorkflow.progress}% Complete</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 pt-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">
                        {mockTasks.filter(task => task.status === 'completed').length}
                      </p>
                      <p className="text-xs text-gray-600">Completed</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">
                        {mockTasks.filter(task => task.status === 'in_progress').length}
                      </p>
                      <p className="text-xs text-gray-600">In Progress</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-600">
                        {mockTasks.filter(task => task.status === 'pending').length}
                      </p>
                      <p className="text-xs text-gray-600">Pending</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tasks List */}
          <Card>
            <CardHeader>
              <CardTitle>Onboarding Tasks</CardTitle>
              <p className="text-sm text-gray-600">Track progress through each onboarding step</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockTasks.map((task) => {
                  const Icon = task.icon;
                  return (
                    <div 
                      key={task.id} 
                      className={`border rounded-lg p-4 ${
                        task.status === 'completed' ? 'bg-green-50 border-green-200' :
                        task.status === 'in_progress' ? 'bg-blue-50 border-blue-200' :
                        'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 mt-1">
                          {getStatusIcon(task.status)}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-gray-900">{task.title}</h3>
                              <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                              
                              <div className="flex items-center gap-4 mt-2">
                                <div className="flex items-center gap-1">
                                  <Icon className="h-4 w-4 text-gray-400" />
                                  <span className="text-xs text-gray-600">{task.category}</span>
                                </div>
                                <div className="text-xs text-gray-600">
                                  Assigned to: {task.assignee}
                                </div>
                                <div className="text-xs text-gray-600">
                                  Due: {new Date(task.dueDate).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Badge className={getStatusColor(task.status)} variant="outline">
                                {task.status.replace('_', ' ')}
                              </Badge>
                              
                              {task.status === 'in_progress' && (
                                <Button size="sm" variant="outline">
                                  Mark Complete
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="mt-8 flex justify-end gap-3">
            <Button variant="outline">
              Export Timeline
            </Button>
            <Button variant="outline">
              Send Reminder
            </Button>
            <Button>
              Update Workflow
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};