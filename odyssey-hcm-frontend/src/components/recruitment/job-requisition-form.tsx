import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Send, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Department {
  id: string;
  name: string;
}

interface Position {
  id: string;
  title: string;
  level: string;
}

interface JobRequisitionFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
  initialData?: any;
}

export const JobRequisitionForm: React.FC<JobRequisitionFormProps> = ({
  onSubmit,
  onCancel,
  initialData
}) => {
  const [formData, setFormData] = useState({
    title: '',
    departmentId: '',
    positionId: '',
    employmentType: 'full_time',
    location: '',
    description: '',
    requirements: '',
    responsibilities: '',
    skillsRequired: [] as string[],
    skillsPreferred: [] as string[],
    experienceLevel: 'mid',
    salaryRangeMin: '',
    salaryRangeMax: '',
    currency: 'USD',
    benefits: [] as string[],
    headcountJustification: '',
    urgency: 'medium',
    targetStartDate: '',
    budgetApproved: false,
    approvalRequired: true,
    isRemoteAllowed: false,
    travelRequirement: 0,
    securityClearance: ''
  });

  const [departments, setDepartments] = useState<Department[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [benefitInput, setBenefitInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchDepartments();
    fetchPositions();
    
    if (initialData) {
      setFormData({
        ...initialData,
        skillsRequired: initialData.skillsRequired || [],
        skillsPreferred: initialData.skillsPreferred || [],
        benefits: initialData.benefits || []
      });
    }
  }, [initialData]);

  const fetchDepartments = async () => {
    try {
      const response = await fetch('/api/departments');
      const data = await response.json();
      
      if (data.success) {
        setDepartments(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch departments:', error);
    }
  };

  const fetchPositions = async () => {
    try {
      const response = await fetch('/api/positions');
      const data = await response.json();
      
      if (data.success) {
        setPositions(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch positions:', error);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const addSkill = (type: 'required' | 'preferred') => {
    if (!skillInput.trim()) return;
    
    const field = type === 'required' ? 'skillsRequired' : 'skillsPreferred';
    const currentSkills = formData[field];
    
    if (!currentSkills.includes(skillInput.trim())) {
      handleInputChange(field, [...currentSkills, skillInput.trim()]);
    }
    
    setSkillInput('');
  };

  const removeSkill = (type: 'required' | 'preferred', skill: string) => {
    const field = type === 'required' ? 'skillsRequired' : 'skillsPreferred';
    const currentSkills = formData[field];
    
    handleInputChange(field, currentSkills.filter(s => s !== skill));
  };

  const addBenefit = () => {
    if (!benefitInput.trim()) return;
    
    if (!formData.benefits.includes(benefitInput.trim())) {
      handleInputChange('benefits', [...formData.benefits, benefitInput.trim()]);
    }
    
    setBenefitInput('');
  };

  const removeBenefit = (benefit: string) => {
    handleInputChange('benefits', formData.benefits.filter(b => b !== benefit));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Job title is required';
    }

    if (!formData.departmentId) {
      newErrors.departmentId = 'Department is required';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }

    if (formData.description.length < 50) {
      newErrors.description = 'Job description must be at least 50 characters';
    }

    if (formData.requirements.length < 20) {
      newErrors.requirements = 'Requirements must be at least 20 characters';
    }

    if (formData.responsibilities.length < 20) {
      newErrors.responsibilities = 'Responsibilities must be at least 20 characters';
    }

    if (formData.skillsRequired.length === 0) {
      newErrors.skillsRequired = 'At least one required skill must be specified';
    }

    if (formData.headcountJustification.length < 10) {
      newErrors.headcountJustification = 'Justification is required';
    }

    if (formData.salaryRangeMin && formData.salaryRangeMax) {
      if (Number(formData.salaryRangeMin) >= Number(formData.salaryRangeMax)) {
        newErrors.salaryRangeMax = 'Maximum salary must be higher than minimum';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (isDraft: boolean = false) => {
    if (!isDraft && !validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const submitData = {
        ...formData,
        salaryRangeMin: formData.salaryRangeMin ? Number(formData.salaryRangeMin) : undefined,
        salaryRangeMax: formData.salaryRangeMax ? Number(formData.salaryRangeMax) : undefined,
        travelRequirement: Number(formData.travelRequirement),
        targetStartDate: formData.targetStartDate ? new Date(formData.targetStartDate).toISOString() : undefined,
        status: isDraft ? 'draft' : 'pending_approval'
      };

      await onSubmit(submitData);
    } catch (error) {
      console.error('Failed to submit requisition:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Button variant="outline" size="sm" onClick={onCancel} className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Requisitions
            </Button>
            
            <h1 className="text-3xl font-bold text-gray-900">
              {initialData ? 'Edit Job Requisition' : 'Create New Job Requisition'}
            </h1>
            <p className="text-gray-600">
              Provide detailed information about the position you'd like to fill.
            </p>
          </div>

          <form className="space-y-8">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Job Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="e.g., Senior Software Engineer"
                    />
                    {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="department">Department *</Label>
                    <Select value={formData.departmentId} onValueChange={(value) => handleInputChange('departmentId', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept.id} value={dept.id}>
                            {dept.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.departmentId && <p className="text-sm text-red-500">{errors.departmentId}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="employmentType">Employment Type</Label>
                    <Select value={formData.employmentType} onValueChange={(value) => handleInputChange('employmentType', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full_time">Full Time</SelectItem>
                        <SelectItem value="part_time">Part Time</SelectItem>
                        <SelectItem value="contract">Contract</SelectItem>
                        <SelectItem value="internship">Internship</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="experienceLevel">Experience Level</Label>
                    <Select value={formData.experienceLevel} onValueChange={(value) => handleInputChange('experienceLevel', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="entry">Entry Level</SelectItem>
                        <SelectItem value="mid">Mid Level</SelectItem>
                        <SelectItem value="senior">Senior Level</SelectItem>
                        <SelectItem value="lead">Lead Level</SelectItem>
                        <SelectItem value="executive">Executive Level</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="urgency">Urgency</Label>
                    <Select value={formData.urgency} onValueChange={(value) => handleInputChange('urgency', value)}>
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="e.g., San Francisco, CA or Remote"
                  />
                  {errors.location && <p className="text-sm text-red-500">{errors.location}</p>}
                </div>

                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isRemoteAllowed"
                      checked={formData.isRemoteAllowed}
                      onCheckedChange={(checked) => handleInputChange('isRemoteAllowed', checked)}
                    />
                    <Label htmlFor="isRemoteAllowed">Remote work allowed</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="budgetApproved"
                      checked={formData.budgetApproved}
                      onCheckedChange={(checked) => handleInputChange('budgetApproved', checked)}
                    />
                    <Label htmlFor="budgetApproved">Budget approved</Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Job Description */}
            <Card>
              <CardHeader>
                <CardTitle>Job Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="description">Job Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Provide a detailed description of the role and what the candidate will be doing..."
                    rows={6}
                  />
                  <p className="text-sm text-gray-500">{formData.description.length}/50 minimum characters</p>
                  {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="responsibilities">Key Responsibilities *</Label>
                  <Textarea
                    id="responsibilities"
                    value={formData.responsibilities}
                    onChange={(e) => handleInputChange('responsibilities', e.target.value)}
                    placeholder="List the main responsibilities and duties of this position..."
                    rows={4}
                  />
                  {errors.responsibilities && <p className="text-sm text-red-500">{errors.responsibilities}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="requirements">Requirements *</Label>
                  <Textarea
                    id="requirements"
                    value={formData.requirements}
                    onChange={(e) => handleInputChange('requirements', e.target.value)}
                    placeholder="Specify education, experience, and other requirements..."
                    rows={4}
                  />
                  {errors.requirements && <p className="text-sm text-red-500">{errors.requirements}</p>}
                </div>
              </CardContent>
            </Card>

            {/* Skills */}
            <Card>
              <CardHeader>
                <CardTitle>Skills & Qualifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label>Required Skills *</Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        placeholder="Add a required skill..."
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill('required'))}
                      />
                      <Button type="button" onClick={() => addSkill('required')}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.skillsRequired.map((skill, index) => (
                        <Badge key={index} variant="default" className="cursor-pointer" onClick={() => removeSkill('required', skill)}>
                          {skill}
                          <X className="h-3 w-3 ml-1" />
                        </Badge>
                      ))}
                    </div>
                    {errors.skillsRequired && <p className="text-sm text-red-500">{errors.skillsRequired}</p>}
                  </div>

                  <div>
                    <Label>Preferred Skills</Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        placeholder="Add a preferred skill..."
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill('preferred'))}
                      />
                      <Button type="button" onClick={() => addSkill('preferred')}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.skillsPreferred.map((skill, index) => (
                        <Badge key={index} variant="outline" className="cursor-pointer" onClick={() => removeSkill('preferred', skill)}>
                          {skill}
                          <X className="h-3 w-3 ml-1" />
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Compensation */}
            <Card>
              <CardHeader>
                <CardTitle>Compensation & Benefits</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="salaryRangeMin">Minimum Salary</Label>
                    <Input
                      id="salaryRangeMin"
                      type="number"
                      value={formData.salaryRangeMin}
                      onChange={(e) => handleInputChange('salaryRangeMin', e.target.value)}
                      placeholder="e.g., 80000"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="salaryRangeMax">Maximum Salary</Label>
                    <Input
                      id="salaryRangeMax"
                      type="number"
                      value={formData.salaryRangeMax}
                      onChange={(e) => handleInputChange('salaryRangeMax', e.target.value)}
                      placeholder="e.g., 120000"
                    />
                    {errors.salaryRangeMax && <p className="text-sm text-red-500">{errors.salaryRangeMax}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select value={formData.currency} onValueChange={(value) => handleInputChange('currency', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                        <SelectItem value="CAD">CAD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Benefits</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      value={benefitInput}
                      onChange={(e) => setBenefitInput(e.target.value)}
                      placeholder="Add a benefit..."
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addBenefit())}
                    />
                    <Button type="button" onClick={addBenefit}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.benefits.map((benefit, index) => (
                      <Badge key={index} variant="outline" className="cursor-pointer" onClick={() => removeBenefit(benefit)}>
                        {benefit}
                        <X className="h-3 w-3 ml-1" />
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Additional Information */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="headcountJustification">Headcount Justification *</Label>
                  <Textarea
                    id="headcountJustification"
                    value={formData.headcountJustification}
                    onChange={(e) => handleInputChange('headcountJustification', e.target.value)}
                    placeholder="Explain why this position is needed and how it supports business objectives..."
                    rows={3}
                  />
                  {errors.headcountJustification && <p className="text-sm text-red-500">{errors.headcountJustification}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="targetStartDate">Target Start Date</Label>
                    <Input
                      id="targetStartDate"
                      type="date"
                      value={formData.targetStartDate}
                      onChange={(e) => handleInputChange('targetStartDate', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="travelRequirement">Travel Requirement (%)</Label>
                    <Input
                      id="travelRequirement"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.travelRequirement}
                      onChange={(e) => handleInputChange('travelRequirement', e.target.value)}
                      placeholder="e.g., 25"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="securityClearance">Security Clearance Required</Label>
                  <Input
                    id="securityClearance"
                    value={formData.securityClearance}
                    onChange={(e) => handleInputChange('securityClearance', e.target.value)}
                    placeholder="e.g., Secret, Top Secret (leave blank if none)"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pb-8">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleSubmit(true)}
                disabled={isSubmitting}
              >
                <Save className="h-4 w-4 mr-2" />
                Save as Draft
              </Button>
              <Button
                type="button"
                onClick={() => handleSubmit(false)}
                disabled={isSubmitting}
              >
                <Send className="h-4 w-4 mr-2" />
                {isSubmitting ? 'Submitting...' : 'Submit for Approval'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};