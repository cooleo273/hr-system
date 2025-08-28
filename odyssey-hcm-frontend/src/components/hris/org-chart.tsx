import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Users, Search, Filter, Maximize } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const mockOrgData = [
  {
    id: '1',
    name: 'Sarah Wilson',
    position: 'CEO',
    department: 'Executive',
    avatar: null,
    directReports: 3,
    level: 0
  },
  {
    id: '2',
    name: 'Michael Johnson',
    position: 'VP Engineering',
    department: 'Engineering',
    avatar: null,
    directReports: 8,
    level: 1
  },
  {
    id: '3',
    name: 'Emily Chen',
    position: 'VP Marketing',
    department: 'Marketing',
    avatar: null,
    directReports: 5,
    level: 1
  },
  {
    id: '4',
    name: 'David Rodriguez',
    position: 'VP Sales',
    department: 'Sales',
    avatar: null,
    directReports: 12,
    level: 1
  }
];

export const OrgChart: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
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
                <h1 className="text-3xl font-bold text-gray-900">Organizational Chart</h1>
                <p className="text-gray-600">Explore your company's organizational structure</p>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-gray-400" />
                  <Input placeholder="Search employees..." className="w-64" />
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
                <Button variant="outline" size="sm">
                  <Maximize className="h-4 w-4 mr-2" />
                  Full Screen
                </Button>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Employees</p>
                    <p className="text-3xl font-bold text-gray-900">1,247</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Departments</p>
                    <p className="text-3xl font-bold text-gray-900">12</p>
                  </div>
                  <Users className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Managers</p>
                    <p className="text-3xl font-bold text-gray-900">89</p>
                  </div>
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Open Positions</p>
                    <p className="text-3xl font-bold text-gray-900">15</p>
                  </div>
                  <Users className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Organizational Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Organization Structure
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* CEO Level */}
                <div className="flex justify-center">
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 w-64">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback>SW</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{mockOrgData[0].name}</h3>
                        <p className="text-sm text-gray-600">{mockOrgData[0].position}</p>
                        <Badge variant="outline" className="mt-1 text-xs">
                          {mockOrgData[0].directReports} direct reports
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                {/* VP Level */}
                <div className="flex justify-center">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl">
                    {mockOrgData.slice(1).map((employee) => (
                      <div key={employee.id} className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback>
                              {employee.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{employee.name}</h3>
                            <p className="text-sm text-gray-600">{employee.position}</p>
                            <p className="text-xs text-gray-500">{employee.department}</p>
                            <Badge variant="outline" className="mt-1 text-xs">
                              {employee.directReports} reports
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Placeholder for expanded view */}
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Interactive Org Chart</h3>
                  <p className="text-gray-600 mb-4">
                    This is a simplified view. The full implementation would include:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-w-2xl mx-auto text-sm text-gray-600">
                    <div>• Expandable/collapsible departments</div>
                    <div>• Employee search and filtering</div>
                    <div>• Drag-and-drop reorganization</div>
                    <div>• Detailed employee popup cards</div>
                    <div>• Export to PDF functionality</div>
                    <div>• Team hierarchy visualization</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Department Breakdown */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Department Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { name: 'Engineering', count: 342, color: 'bg-blue-100 text-blue-800' },
                    { name: 'Sales', count: 156, color: 'bg-green-100 text-green-800' },
                    { name: 'Marketing', count: 89, color: 'bg-purple-100 text-purple-800' },
                    { name: 'Operations', count: 234, color: 'bg-orange-100 text-orange-800' },
                    { name: 'HR', count: 23, color: 'bg-pink-100 text-pink-800' }
                  ].map((dept) => (
                    <div key={dept.name} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{dept.name}</span>
                      <Badge className={dept.color}>{dept.count} employees</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" variant="outline">
                  Add New Employee
                </Button>
                <Button className="w-full" variant="outline">
                  Create Department
                </Button>
                <Button className="w-full" variant="outline">
                  Export Org Chart
                </Button>
                <Button className="w-full" variant="outline" asChild>
                  <Link to="/hris/employees/new">
                    Start Onboarding
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};