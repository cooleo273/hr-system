import React, { useState, useEffect } from 'react';
import { Clock, Calendar, User, MessageSquare, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';

interface LeaveRequest {
  id: string;
  employee: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    position: string;
    department: string;
    avatar?: string;
  };
  policy: {
    id: string;
    name: string;
    allowNegativeBalance: boolean;
  };
  startDate: string;
  endDate: string;
  startTime: 'full_day' | 'half_day';
  endTime: 'full_day' | 'half_day';
  daysRequested: number;
  reason: string;
  emergencyContact?: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  currentBalance: number;
  balanceAfterRequest: number;
  approvalHistory: {
    id: string;
    approverId: string;
    approverName: string;
    action: 'approved' | 'rejected' | 'pending';
    comments?: string;
    actionDate: string;
    level: number;
  }[];
  workflowStep: {
    level: number;
    approverId: string;
    approverName: string;
    required: boolean;
  };
}

interface LeaveApprovalDetailProps {
  requestId: string;
  onApprovalComplete: () => void;
  onClose: () => void;
}

export const LeaveApprovalDetail: React.FC<LeaveApprovalDetailProps> = ({
  requestId,
  onApprovalComplete,
  onClose
}) => {
  const [request, setRequest] = useState<LeaveRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [comments, setComments] = useState('');
  const [showCommentField, setShowCommentField] = useState(false);
  const [pendingAction, setPendingAction] = useState<'approve' | 'reject' | null>(null);

  useEffect(() => {
    fetchRequestDetails();
  }, [requestId]);

  const fetchRequestDetails = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/leave/requests/${requestId}`);
      const data = await response.json();

      if (data.success) {
        setRequest(data.data);
      } else {
        console.error('Failed to fetch request details:', data.error);
      }
    } catch (error) {
      console.error('Failed to fetch request details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprovalAction = async (action: 'approve' | 'reject') => {
    if (!request) return;

    setProcessing(true);
    try {
      const response = await fetch(`/api/leave/requests/${requestId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          comments: comments.trim() || undefined
        })
      });

      const data = await response.json();

      if (data.success) {
        await fetchRequestDetails(); // Refresh the data
        onApprovalComplete();
        setComments('');
        setShowCommentField(false);
        setPendingAction(null);
      } else {
        console.error('Failed to process approval:', data.error);
      }
    } catch (error) {
      console.error('Failed to process approval:', error);
    } finally {
      setProcessing(false);
    }
  };

  const initiateAction = (action: 'approve' | 'reject') => {
    setPendingAction(action);
    setShowCommentField(true);
  };

  const confirmAction = () => {
    if (pendingAction) {
      handleApprovalAction(pendingAction);
    }
  };

  const cancelAction = () => {
    setPendingAction(null);
    setShowCommentField(false);
    setComments('');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getBalanceWarning = () => {
    if (!request) return null;

    if (request.balanceAfterRequest < 0 && !request.policy.allowNegativeBalance) {
      return {
        type: 'error',
        message: 'This request would result in a negative balance, which is not allowed by the leave policy.'
      };
    }

    if (request.balanceAfterRequest < 0) {
      return {
        type: 'warning',
        message: `This request will result in a negative balance of ${Math.abs(request.balanceAfterRequest)} days.`
      };
    }

    if (request.balanceAfterRequest < 5) {
      return {
        type: 'info',
        message: `Employee will have ${request.balanceAfterRequest} days remaining after this request.`
      };
    }

    return null;
  };

  if (loading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </CardContent>
      </Card>
    );
  }

  if (!request) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">Request Not Found</h3>
            <p className="text-gray-500">The leave request could not be loaded.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const balanceWarning = getBalanceWarning();
  const canApprove = request.status === 'pending' && 
                    request.workflowStep && 
                    request.workflowStep.required;

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Leave Request Review
          </CardTitle>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Employee Information */}
        <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
          <Avatar className="h-16 w-16">
            <AvatarImage src={request.employee.avatar} />
            <AvatarFallback>
              {request.employee.firstName[0]}{request.employee.lastName[0]}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <h3 className="text-lg font-semibold">
              {request.employee.firstName} {request.employee.lastName}
            </h3>
            <p className="text-gray-600">{request.employee.position}</p>
            <p className="text-gray-600">{request.employee.department}</p>
            <p className="text-sm text-gray-500">{request.employee.email}</p>
          </div>
          
          <div className="text-right">
            <Badge className={getStatusColor(request.status)}>
              {request.status.toUpperCase()}
            </Badge>
            <p className="text-sm text-gray-500 mt-2">
              Submitted: {formatDateTime(request.submittedAt)}
            </p>
          </div>
        </div>

        {/* Leave Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Leave Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">Leave Type</Label>
                <p className="text-sm">{request.policy.name}</p>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-700">Duration</Label>
                <p className="text-sm">
                  <strong>{request.daysRequested}</strong> day{request.daysRequested !== 1 ? 's' : ''}
                </p>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-700">Start Date</Label>
                <p className="text-sm">
                  {formatDate(request.startDate)}
                  {request.startTime === 'half_day' && <span className="text-gray-500"> (Half Day)</span>}
                </p>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-700">End Date</Label>
                <p className="text-sm">
                  {formatDate(request.endDate)}
                  {request.endTime === 'half_day' && <span className="text-gray-500"> (Half Day)</span>}
                </p>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-700">Reason</Label>
                <p className="text-sm bg-white p-3 rounded border">{request.reason}</p>
              </div>
              
              {request.emergencyContact && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">Emergency Contact</Label>
                  <p className="text-sm">{request.emergencyContact}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Balance Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">Current Balance</Label>
                <p className="text-sm">
                  <strong>{request.currentBalance}</strong> days
                </p>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-700">Days Requested</Label>
                <p className="text-sm">
                  <strong>{request.daysRequested}</strong> days
                </p>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-700">Balance After Request</Label>
                <p className={`text-sm font-medium ${
                  request.balanceAfterRequest < 0 ? 'text-red-600' : 'text-green-600'
                }`}>
                  <strong>{request.balanceAfterRequest}</strong> days
                </p>
              </div>

              {balanceWarning && (
                <Alert variant={balanceWarning.type === 'error' ? 'destructive' : 'default'}>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{balanceWarning.message}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Approval History */}
        {request.approvalHistory.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Approval History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {request.approvalHistory.map((approval, index) => (
                  <div key={approval.id} className="flex items-start gap-3 pb-4 border-b last:border-b-0">
                    <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center
                      ${approval.action === 'approved' ? 'bg-green-100' : 
                        approval.action === 'rejected' ? 'bg-red-100' : 'bg-yellow-100'}
                    `}>
                      {approval.action === 'approved' ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : approval.action === 'rejected' ? (
                        <XCircle className="h-4 w-4 text-red-600" />
                      ) : (
                        <Clock className="h-4 w-4 text-yellow-600" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{approval.approverName}</p>
                        <p className="text-sm text-gray-500">
                          Level {approval.level} • {formatDateTime(approval.actionDate)}
                        </p>
                      </div>
                      
                      <p className="text-sm text-gray-600 capitalize">
                        {approval.action} this request
                      </p>
                      
                      {approval.comments && (
                        <p className="text-sm bg-gray-50 p-2 rounded mt-2">
                          "{approval.comments}"
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Section */}
        {canApprove && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Take Action</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!showCommentField ? (
                <div className="flex gap-3">
                  <Button 
                    onClick={() => initiateAction('approve')}
                    disabled={processing || (balanceWarning?.type === 'error')}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve Request
                  </Button>
                  
                  <Button 
                    variant="destructive" 
                    onClick={() => initiateAction('reject')}
                    disabled={processing}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject Request
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="comments">
                      Comments {pendingAction === 'reject' ? '(Required for rejection)' : '(Optional)'}
                    </Label>
                    <Textarea
                      id="comments"
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                      placeholder={`Add comments for this ${pendingAction}...`}
                      rows={3}
                    />
                  </div>
                  
                  <div className="flex gap-3">
                    <Button 
                      onClick={confirmAction}
                      disabled={processing || (pendingAction === 'reject' && !comments.trim())}
                      className={pendingAction === 'approve' ? 'bg-green-600 hover:bg-green-700' : ''}
                      variant={pendingAction === 'approve' ? 'default' : 'destructive'}
                    >
                      {processing ? 'Processing...' : `Confirm ${pendingAction?.charAt(0).toUpperCase()}${pendingAction?.slice(1)}`}
                    </Button>
                    
                    <Button variant="outline" onClick={cancelAction} disabled={processing}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {balanceWarning?.type === 'error' && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Cannot approve this request due to insufficient leave balance.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
};