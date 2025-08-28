import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, Search, Filter, MoreHorizontal, Mail, Phone, 
  Calendar, FileText, User, Star, MapPin, Briefcase, Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Candidate {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  currentTitle?: string;
  currentCompany?: string;
  location?: string;
  yearsOfExperience?: number;
  skills: string[];
  resumeUrl?: string;
  linkedInUrl?: string;
}

interface Application {
  id: string;
  stage: string;
  appliedAt: string;
  candidate: Candidate;
  jobPosting: {
    id: string;
    title: string;
    location: string;
    employmentType: string;
  };
  interviews: {
    id: string;
    scheduledDate: string;
    type: string;
    status: string;
  }[];
  offers: {
    id: string;
    status: string;
    createdAt: string;
  }[];
}

const stages = [
  { id: 'applied', name: 'Applied', color: 'bg-blue-100 text-blue-800' },
  { id: 'screening', name: 'Screening', color: 'bg-yellow-100 text-yellow-800' },
  { id: 'phone_interview', name: 'Phone Screen', color: 'bg-orange-100 text-orange-800' },
  { id: 'technical_interview', name: 'Technical', color: 'bg-purple-100 text-purple-800' },
  { id: 'onsite_interview', name: 'Onsite', color: 'bg-indigo-100 text-indigo-800' },
  { id: 'final_interview', name: 'Final', color: 'bg-pink-100 text-pink-800' },
  { id: 'offer_pending', name: 'Offer Prep', color: 'bg-teal-100 text-teal-800' },
  { id: 'offer_sent', name: 'Offer Sent', color: 'bg-green-100 text-green-800' },
  { id: 'hired', name: 'Hired', color: 'bg-green-100 text-green-800 border-green-300' },
  { id: 'rejected', name: 'Rejected', color: 'bg-red-100 text-red-800' }
];

export const ApplicationPipeline: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJobPosting, setSelectedJobPosting] = useState<string>('all');
  const [selectedStage, setSelectedStage] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');

  useEffect(() => {
    fetchApplications();
  }, []);

  useEffect(() => {
    filterApplications();
  }, [applications, searchTerm, selectedJobPosting, selectedStage]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/recruitment/applications?limit=100');
      const data = await response.json();
      
      if (data.success) {
        setApplications(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterApplications = () => {
    let filtered = applications;

    if (searchTerm) {
      filtered = filtered.filter(app => 
        app.candidate.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.candidate.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.jobPosting.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedJobPosting !== 'all') {
      filtered = filtered.filter(app => app.jobPosting.id === selectedJobPosting);
    }

    if (selectedStage !== 'all') {
      filtered = filtered.filter(app => app.stage === selectedStage);
    }

    setFilteredApplications(filtered);
  };

  const updateApplicationStage = async (applicationId: string, newStage: string) => {
    try {
      const response = await fetch(`/api/recruitment/applications/${applicationId}/stage`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          stage: newStage,
          notes: `Moved to ${newStage.replace('_', ' ')} stage`
        })
      });

      if (response.ok) {
        // Update local state
        setApplications(prev => 
          prev.map(app => 
            app.id === applicationId 
              ? { ...app, stage: newStage }
              : app
          )
        );
      }
    } catch (error) {
      console.error('Failed to update application stage:', error);
    }
  };

  const getStageApplications = (stage: string) => {
    return filteredApplications.filter(app => app.stage === stage);
  };

  const renderApplicationCard = (application: Application) => {
    const candidate = application.candidate;
    const job = application.jobPosting;
    
    return (
      <div key={application.id} className="bg-white border border-gray-200 rounded-lg p-4 mb-3 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={candidate.resumeUrl} />
              <AvatarFallback>
                {candidate.firstName[0]}{candidate.lastName[0]}
              </AvatarFallback>
            </Avatar>
            
            <div>
              <h3 className="font-medium text-gray-900">
                {candidate.firstName} {candidate.lastName}
              </h3>
              <p className="text-sm text-gray-600">{candidate.currentTitle}</p>
              {candidate.currentCompany && (
                <p className="text-xs text-gray-500">{candidate.currentCompany}</p>
              )}
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Eye className="h-4 w-4 mr-2" />
                View Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Interview
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Mail className="h-4 w-4 mr-2" />
                Send Email
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-600">
            <Briefcase className="h-3 w-3 mr-1" />
            <span>{job.title}</span>
          </div>
          
          {candidate.location && (
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="h-3 w-3 mr-1" />
              <span>{candidate.location}</span>
            </div>
          )}
          
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="h-3 w-3 mr-1" />
            <span>Applied {new Date(application.appliedAt).toLocaleDateString()}</span>
          </div>
        </div>
        
        {candidate.skills.length > 0 && (
          <div className="mt-3">
            <div className="flex flex-wrap gap-1">
              {candidate.skills.slice(0, 3).map((skill, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {skill}
                </Badge>
              ))}
              {candidate.skills.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{candidate.skills.length - 3}
                </Badge>
              )}
            </div>
          </div>
        )}
        
        {application.interviews.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <Calendar className="h-3 w-3 text-gray-400" />
              <span className="text-xs text-gray-600">
                {application.interviews.length} interview{application.interviews.length !== 1 ? 's' : ''} scheduled
              </span>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderKanbanView = () => (
    <div className="grid grid-cols-1 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {stages.slice(0, -1).map((stage) => {
        const stageApplications = getStageApplications(stage.id);
        
        return (
          <div key={stage.id} className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-gray-900">{stage.name}</h3>
              <Badge className={`${stage.color} text-xs`}>
                {stageApplications.length}
              </Badge>
            </div>
            
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {stageApplications.map(renderApplicationCard)}
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderListView = () => (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="grid grid-cols-12 gap-4 p-4 bg-gray-50 font-medium text-sm text-gray-700 border-b">
        <div className="col-span-3">Candidate</div>
        <div className="col-span-2">Position</div>
        <div className="col-span-2">Stage</div>
        <div className="col-span-2">Applied</div>
        <div className="col-span-2">Experience</div>
        <div className="col-span-1">Actions</div>
      </div>
      
      <div className="divide-y divide-gray-200">
        {filteredApplications.map((application) => {
          const candidate = application.candidate;
          const job = application.jobPosting;
          const stageInfo = stages.find(s => s.id === application.stage);
          
          return (
            <div key={application.id} className="grid grid-cols-12 gap-4 p-4 hover:bg-gray-50">
              <div className="col-span-3 flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">
                    {candidate.firstName[0]}{candidate.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-gray-900">
                    {candidate.firstName} {candidate.lastName}
                  </p>
                  <p className="text-sm text-gray-600">{candidate.currentTitle}</p>
                </div>
              </div>
              
              <div className="col-span-2">
                <p className="font-medium text-gray-900">{job.title}</p>
                <p className="text-sm text-gray-600">{job.location}</p>
              </div>
              
              <div className="col-span-2">
                <Badge className={stageInfo?.color}>
                  {stageInfo?.name}
                </Badge>
              </div>
              
              <div className="col-span-2">
                <p className="text-sm text-gray-900">
                  {new Date(application.appliedAt).toLocaleDateString()}
                </p>
              </div>
              
              <div className="col-span-2">
                <p className="text-sm text-gray-900">
                  {candidate.yearsOfExperience ? `${candidate.yearsOfExperience} years` : 'N/A'}
                </p>
              </div>
              
              <div className="col-span-1">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>View Details</DropdownMenuItem>
                    <DropdownMenuItem>Schedule Interview</DropdownMenuItem>
                    <DropdownMenuItem>Move Stage</DropdownMenuItem>
                    <DropdownMenuItem>Send Email</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

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
                <Link to="/recruitment">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Recruitment
                </Link>
              </Button>
              
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Application Pipeline</h1>
                <p className="text-sm text-gray-600">Track candidates through your recruitment process</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Tabs value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
                <TabsList>
                  <TabsTrigger value="kanban">Kanban</TabsTrigger>
                  <TabsTrigger value="list">List</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex items-center gap-2 flex-1">
              <Search className="h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search candidates, positions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Select value={selectedStage} onValueChange={setSelectedStage}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All stages" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stages</SelectItem>
                  {stages.map((stage) => (
                    <SelectItem key={stage.id} value={stage.id}>
                      {stage.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                More Filters
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
            {stages.slice(0, -2).map((stage) => {
              const count = getStageApplications(stage.id).length;
              return (
                <Card key={stage.id}>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">{count}</p>
                      <p className="text-sm text-gray-600">{stage.name}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Applications View */}
          {viewMode === 'kanban' ? renderKanbanView() : renderListView()}
          
          {filteredApplications.length === 0 && !loading && (
            <div className="text-center py-12 text-gray-500">
              <User className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium mb-2">No applications found</h3>
              <p>Try adjusting your filters or search terms.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};