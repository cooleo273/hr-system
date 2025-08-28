import React, { useState, useEffect } from 'react';
import { Calendar, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Alert, AlertDescription } from '../ui/alert';

interface LeavePolicy {
  id: string;
  name: string;
  balanceAvailable: number;
  minimumNotice: number;
  requiresApproval: boolean;
  allowNegativeBalance: boolean;
}

interface LeaveRequestFormProps {
  employeeId: string;
  onSubmit: (request: any) => void;
  onCancel: () => void;
}

export const LeaveRequestForm: React.FC<LeaveRequestFormProps> = ({
  employeeId,
  onSubmit,
  onCancel
}) => {
  const [policies, setPolicies] = useState<LeavePolicy[]>([]);
  const [selectedPolicy, setSelectedPolicy] = useState<LeavePolicy | null>(null);
  const [formData, setFormData] = useState({
    policyId: '',
    startDate: '',
    endDate: '',
    startTime: 'full_day',
    endTime: 'full_day',
    reason: '',
    emergencyContact: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [calculatedDays, setCalculatedDays] = useState(0);

  useEffect(() => {
    fetchLeavePolicies();
  }, []);

  useEffect(() => {
    if (formData.startDate && formData.endDate) {
      calculateDays();
    }
  }, [formData.startDate, formData.endDate, formData.startTime, formData.endTime]);

  const fetchLeavePolicies = async () => {
    try {
      const response = await fetch(`/api/leave/balances/${employeeId}`);
      const data = await response.json();
      
      if (data.success) {
        const policiesWithBalance = data.data.map((balance: any) => ({
          id: balance.policy.id,
          name: balance.policy.name,
          balanceAvailable: balance.currentBalance,
          minimumNotice: balance.policy.minimumNoticeHours,
          requiresApproval: balance.policy.requiresApproval,
          allowNegativeBalance: balance.policy.allowNegativeBalance
        }));
        setPolicies(policiesWithBalance);
      }
    } catch (error) {
      console.error('Failed to fetch leave policies:', error);
    }
  };

  const calculateDays = () => {
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    
    if (start > end) {
      setCalculatedDays(0);
      return;
    }

    const diffTime = Math.abs(end.getTime() - start.getTime());
    let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    // Adjust for partial days
    if (formData.startTime === 'half_day' && formData.endTime === 'half_day') {
      if (diffDays === 1) {
        diffDays = 0.5;
      } else {
        diffDays -= 0.5;
      }
    } else if (formData.startTime === 'half_day' || formData.endTime === 'half_day') {
      diffDays -= 0.5;
    }

    setCalculatedDays(diffDays);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.policyId) {
      newErrors.policyId = 'Please select a leave type';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    }

    if (formData.startDate && formData.endDate && new Date(formData.startDate) > new Date(formData.endDate)) {
      newErrors.endDate = 'End date must be after start date';
    }

    if (!formData.reason.trim()) {
      newErrors.reason = 'Reason is required';
    }

    // Check minimum notice period
    if (selectedPolicy && formData.startDate) {
      const startDate = new Date(formData.startDate);
      const now = new Date();
      const hoursNotice = (startDate.getTime() - now.getTime()) / (1000 * 60 * 60);
      
      if (hoursNotice < selectedPolicy.minimumNotice) {
        newErrors.startDate = `Minimum ${selectedPolicy.minimumNotice} hours notice required`;
      }
    }

    // Check available balance
    if (selectedPolicy && calculatedDays > 0) {
      if (!selectedPolicy.allowNegativeBalance && calculatedDays > selectedPolicy.balanceAvailable) {
        newErrors.general = `Insufficient leave balance. Available: ${selectedPolicy.balanceAvailable} days, Requested: ${calculatedDays} days`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const requestData = {
        employeeId,
        policyId: formData.policyId,
        startDate: formData.startDate,
        endDate: formData.endDate,
        startTime: formData.startTime,
        endTime: formData.endTime,
        reason: formData.reason,
        emergencyContact: formData.emergencyContact || undefined,
        daysRequested: calculatedDays
      };

      await onSubmit(requestData);
    } catch (error) {
      setErrors({ general: 'Failed to submit leave request. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePolicyChange = (policyId: string) => {
    const policy = policies.find(p => p.id === policyId);
    setSelectedPolicy(policy || null);
    setFormData(prev => ({ ...prev, policyId }));
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Submit Leave Request
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {errors.general && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errors.general}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="policyId">Leave Type *</Label>
            <Select value={formData.policyId} onValueChange={handlePolicyChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select leave type" />
              </SelectTrigger>
              <SelectContent>
                {policies.map((policy) => (
                  <SelectItem key={policy.id} value={policy.id}>
                    {policy.name} ({policy.balanceAvailable} days available)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.policyId && <p className="text-sm text-red-500">{errors.policyId}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                type="date"
                min={today}
                value={formData.startDate}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
              />
              {errors.startDate && <p className="text-sm text-red-500">{errors.startDate}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date *</Label>
              <Input
                id="endDate"
                type="date"
                min={formData.startDate || today}
                value={formData.endDate}
                onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
              />
              {errors.endDate && <p className="text-sm text-red-500">{errors.endDate}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time</Label>
              <Select 
                value={formData.startTime} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, startTime: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full_day">Full Day</SelectItem>
                  <SelectItem value="half_day">Half Day</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="endTime">End Time</Label>
              <Select 
                value={formData.endTime} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, endTime: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full_day">Full Day</SelectItem>
                  <SelectItem value="half_day">Half Day</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {calculatedDays > 0 && (
            <Alert>
              <Clock className="h-4 w-4" />
              <AlertDescription>
                Total days requested: <strong>{calculatedDays}</strong>
                {selectedPolicy && (
                  <span className="ml-2">
                    (Balance after request: {selectedPolicy.balanceAvailable - calculatedDays} days)
                  </span>
                )}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="reason">Reason *</Label>
            <Textarea
              id="reason"
              placeholder="Please provide a reason for your leave request..."
              value={formData.reason}
              onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
              rows={3}
            />
            {errors.reason && <p className="text-sm text-red-500">{errors.reason}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="emergencyContact">Emergency Contact (Optional)</Label>
            <Input
              id="emergencyContact"
              placeholder="Contact information during leave"
              value={formData.emergencyContact}
              onChange={(e) => setFormData(prev => ({ ...prev, emergencyContact: e.target.value }))}
            />
          </div>

          {selectedPolicy && (
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <h4 className="font-medium">Leave Policy Information</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p>• Minimum notice required: {selectedPolicy.minimumNotice} hours</p>
                <p>• Requires approval: {selectedPolicy.requiresApproval ? 'Yes' : 'No'}</p>
                <p>• Available balance: {selectedPolicy.balanceAvailable} days</p>
                {selectedPolicy.allowNegativeBalance && (
                  <p>• Negative balance allowed</p>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Request'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};