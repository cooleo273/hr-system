import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, User, Mail, Phone, MapPin, Calendar, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export const EmployeeProfile: React.FC = () => {
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
            
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src="/api/placeholder/150/150" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              
              <div>
                <h1 className="text-3xl font-bold text-gray-900">John Doe</h1>
                <p className="text-lg text-gray-600">Senior Software Engineer</p>
                <Badge variant="secondary" className="mt-1">Active</Badge>
              </div>
            </div>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Personal Information */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">john.doe@company.com</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">+1 (555) 123-4567</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">San Francisco, CA</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">Joined March 15, 2022</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Building className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">Engineering Department</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Details and Actions */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Employee Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Employee ID</label>
                      <p className="text-sm text-gray-900">EMP-001234</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Department</label>
                      <p className="text-sm text-gray-900">Engineering</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Position</label>
                      <p className="text-sm text-gray-900">Senior Software Engineer</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Manager</label>
                      <p className="text-sm text-gray-900">Jane Smith</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    <Button size="sm">Edit Profile</Button>
                    <Button size="sm" variant="outline">View Documents</Button>
                    <Button size="sm" variant="outline">Performance Review</Button>
                    <Button size="sm" variant="outline" asChild>
                      <Link to="/leave">Leave History</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    This is a placeholder for the employee profile component. In the full implementation, 
                    this would show detailed employee information, employment history, documents, 
                    performance data, and administrative actions.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};