import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, Users, Calendar, Target, TrendingUp, 
  BookOpen, Shield, BarChart3, ArrowRight, CheckCircle 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const modules = [
  {
    id: 'hris',
    name: 'Core HRIS',
    description: 'Employee profiles, organizational charts, and onboarding workflows',
    icon: Users,
    features: ['Employee Management', 'Org Chart', 'Document Management', 'Workflows'],
    status: 'Available',
    href: '/hris/org-chart'
  },
  {
    id: 'leave',
    name: 'Leave & Attendance',
    description: 'Dynamic leave calculation and multi-step approval workflows',
    icon: Calendar,
    features: ['Leave Requests', 'Approval Workflows', 'Team Calendar', 'Balance Tracking'],
    status: 'Available',
    href: '/leave'
  },
  {
    id: 'recruitment',
    name: 'Recruitment & ATS',
    description: 'Job requisitions, applicant tracking, and offer management',
    icon: Target,
    features: ['Job Posting', 'Candidate Pipeline', 'Interview Scheduling', 'Offer Letters'],
    status: 'Coming Soon',
    href: '/recruitment'
  },
  {
    id: 'performance',
    name: 'Performance Management',
    description: 'Reviews, goal setting, feedback, and succession planning',
    icon: TrendingUp,
    features: ['Performance Reviews', 'OKRs', 'Feedback', 'Succession Planning'],
    status: 'Coming Soon',
    href: '/performance'
  },
  {
    id: 'compensation',
    name: 'Compensation & Benefits',
    description: 'Salary planning, total compensation, and benefits administration',
    icon: Building2,
    features: ['Comp Planning', 'Total Comp Statements', 'Benefits Portal', 'Equity Management'],
    status: 'Coming Soon',
    href: '/compensation'
  },
  {
    id: 'learning',
    name: 'Learning & Engagement',
    description: 'LMS, engagement surveys, and continuous learning',
    icon: BookOpen,
    features: ['Course Management', 'Engagement Surveys', 'Skills Tracking', 'Certifications'],
    status: 'Coming Soon',
    href: '/learning'
  },
  {
    id: 'security',
    name: 'Security & Access',
    description: 'RBAC, Azure AD SSO, and platform customization',
    icon: Shield,
    features: ['Role-Based Access', 'SSO Integration', 'Multi-Factor Auth', 'Audit Logs'],
    status: 'Built-in',
    href: '#'
  },
  {
    id: 'analytics',
    name: 'Reporting & Analytics',
    description: 'Custom reports, dashboards, and predictive insights',
    icon: BarChart3,
    features: ['Custom Reports', 'Manager Dashboards', 'Predictive Analytics', 'Data Export'],
    status: 'Coming Soon',
    href: '/analytics'
  }
];

const features = [
  'Single Sign-On with Azure AD',
  'Mobile-First Responsive Design', 
  'Real-time Notifications',
  'RESTful API Access',
  'Advanced Workflow Engine',
  'Multi-language Support',
  'Enterprise Security',
  'Scalable Architecture'
];

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="relative z-10 px-4 py-6">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Odyssey</h1>
              <p className="text-xs text-gray-600">Human Capital Management</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link to="/dashboard">Dashboard</Link>
            </Button>
            <Button asChild>
              <Link to="/dashboard">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-4 py-16 md:py-24">
        <div className="container mx-auto text-center">
          <div className="mx-auto max-w-4xl">
            <Badge variant="secondary" className="mb-6">
              Unified Human Capital Management Platform
            </Badge>
            
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Streamline Your Entire{' '}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Employee Lifecycle
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              From recruitment to retirement, Odyssey automates and optimizes every aspect of human capital management. 
              Empower your teams with self-service capabilities and data-driven insights.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button size="lg" asChild className="text-lg px-8 py-6">
                <Link to="/dashboard">
                  Explore Platform
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-lg px-8 py-6">
                <Link to="/leave">
                  View Demo
                </Link>
              </Button>
            </div>

            {/* Key Features Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
              {features.slice(0, 4).map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Modules Grid */}
      <section className="px-4 py-16 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Complete HCM Solution
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Eight integrated modules covering every aspect of human capital management, 
              from core HR functions to advanced analytics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {modules.map((module) => {
              const Icon = module.icon;
              const isAvailable = module.status === 'Available';
              const isBuiltIn = module.status === 'Built-in';
              
              return (
                <Card 
                  key={module.id} 
                  className={`h-full transition-all duration-200 hover:shadow-lg ${
                    isAvailable ? 'hover:-translate-y-1 cursor-pointer' : 'opacity-75'
                  }`}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${
                        isAvailable 
                          ? 'bg-gradient-to-br from-blue-500 to-indigo-500' 
                          : isBuiltIn
                          ? 'bg-gradient-to-br from-green-500 to-emerald-500'
                          : 'bg-gray-200'
                      }`}>
                        <Icon className={`h-6 w-6 ${
                          isAvailable || isBuiltIn ? 'text-white' : 'text-gray-400'
                        }`} />
                      </div>
                      <Badge 
                        variant={isAvailable ? 'default' : isBuiltIn ? 'secondary' : 'outline'}
                        className={
                          isAvailable 
                            ? 'bg-green-100 text-green-700 hover:bg-green-100' 
                            : isBuiltIn
                            ? 'bg-blue-100 text-blue-700'
                            : ''
                        }
                      >
                        {module.status}
                      </Badge>
                    </div>
                    
                    <CardTitle className="text-lg mb-2">{module.name}</CardTitle>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {module.description}
                    </p>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="space-y-2 mb-4">
                      {module.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2 text-xs text-gray-500">
                          <div className="h-1.5 w-1.5 rounded-full bg-gray-300" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                    
                    {isAvailable && (
                      <Button size="sm" variant="outline" asChild className="w-full">
                        <Link to={module.href}>
                          Explore Module
                          <ArrowRight className="ml-2 h-3 w-3" />
                        </Link>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Additional Features */}
      <section className="px-4 py-16 bg-gray-50">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">
              Enterprise-Ready Features
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3 text-sm text-gray-700">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 py-8 bg-white border-t">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-semibold text-gray-900">Odyssey HCM</span>
          </div>
          <p className="text-sm text-gray-600">
            Unified Human Capital Management Platform - Built with React, TypeScript, and Azure AD
          </p>
        </div>
      </footer>
    </div>
  );
};