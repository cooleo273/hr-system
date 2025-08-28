import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, Calendar, TrendingUp, FileText, Bell, Settings, 
  ChevronRight, BarChart3, Clock, CheckCircle, AlertCircle 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const stats = [
  {
    title: 'Total Employees',
    value: '1,247',
    change: '+12 this month',
    icon: Users,
    positive: true
  },
  {
    title: 'Pending Leave Requests',
    value: '23',
    change: '5 require attention',
    icon: Calendar,
    positive: false
  },
  {
    title: 'Performance Reviews',
    value: '89%',
    change: 'Completion rate',
    icon: TrendingUp,
    positive: true
  },
  {
    title: 'Open Positions',
    value: '15',
    change: '3 new this week',
    icon: FileText,
    positive: true
  }
];

const recentActivity = [
  {
    id: 1,
    type: 'leave_request',
    title: 'New leave request from Sarah Johnson',
    description: 'Annual leave for 5 days starting Dec 15',
    time: '2 hours ago',
    status: 'pending'
  },
  {
    id: 2,
    type: 'employee_joined',
    title: 'Michael Chen joined the Engineering team',
    description: 'Onboarding workflow initiated',
    time: '1 day ago',
    status: 'completed'
  },
  {
    id: 3,
    type: 'performance_review',
    title: 'Q4 Performance review cycle started',
    description: '45 reviews pending completion',
    time: '2 days ago',
    status: 'in_progress'
  },
  {
    id: 4,
    type: 'document_uploaded',
    title: 'Updated employee handbook',
    description: 'Version 2.1 now available',
    time: '3 days ago',
    status: 'completed'
  }
];

const quickActions = [
  {
    title: 'Add New Employee',
    description: 'Create employee profile and start onboarding',
    href: '/hris/employees/new',
    icon: Users
  },
  {
    title: 'Approve Leave Requests',
    description: 'Review and approve pending leave requests',
    href: '/leave',
    icon: Calendar
  },
  {
    title: 'View Org Chart',
    description: 'Explore organizational structure',
    href: '/hris/org-chart',
    icon: BarChart3
  },
  {
    title: 'Generate Reports',
    description: 'Create custom HR analytics reports',
    href: '/analytics',
    icon: FileText
  }
];

export const Dashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-sm text-gray-600">Welcome back! Here's what's happening with your team.</p>
            </div>
            
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button asChild>
                <Link to="/">
                  Back to Landing
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                        <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                        <p className={`text-sm ${
                          stat.positive ? 'text-green-600' : 'text-orange-600'
                        }`}>
                          {stat.change}
                        </p>
                      </div>
                      <div className="h-12 w-12 bg-blue-50 rounded-lg flex items-center justify-center">
                        <Icon className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Quick Actions */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {quickActions.map((action, index) => {
                    const Icon = action.icon;
                    return (
                      <Link
                        key={index}
                        to={action.href}
                        className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                      >
                        <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Icon className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{action.title}</h3>
                          <p className="text-sm text-gray-600">{action.description}</p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                      </Link>
                    );
                  })}
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-b-0">
                        <div className="flex-shrink-0">
                          {activity.status === 'completed' ? (
                            <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            </div>
                          ) : activity.status === 'pending' ? (
                            <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                              <AlertCircle className="h-4 w-4 text-yellow-600" />
                            </div>
                          ) : (
                            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <Clock className="h-4 w-4 text-blue-600" />
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{activity.title}</h3>
                          <p className="text-sm text-gray-600">{activity.description}</p>
                          <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                        </div>
                        
                        <div className="flex-shrink-0">
                          <Badge variant={
                            activity.status === 'completed' ? 'secondary' :
                            activity.status === 'pending' ? 'default' : 'outline'
                          }>
                            {activity.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Module Navigation */}
          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>HCM Modules</CardTitle>
                <p className="text-sm text-gray-600">Access all Odyssey platform modules</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Link
                    to="/hris/org-chart"
                    className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <Users className="h-8 w-8 text-blue-600" />
                    <span className="font-medium">Core HRIS</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-700">Available</Badge>
                  </Link>
                  
                  <Link
                    to="/leave"
                    className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <Calendar className="h-8 w-8 text-blue-600" />
                    <span className="font-medium">Leave & Attendance</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-700">Available</Badge>
                  </Link>
                  
                  <Link
                    to="/recruitment"
                    className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors opacity-60"
                  >
                    <TrendingUp className="h-8 w-8 text-gray-400" />
                    <span className="font-medium">Recruitment</span>
                    <Badge variant="outline">Coming Soon</Badge>
                  </Link>
                  
                  <Link
                    to="/analytics"
                    className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors opacity-60"
                  >
                    <BarChart3 className="h-8 w-8 text-gray-400" />
                    <span className="font-medium">Analytics</span>
                    <Badge variant="outline">Coming Soon</Badge>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};