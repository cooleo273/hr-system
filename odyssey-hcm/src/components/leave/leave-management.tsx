import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Input } from '../ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { 
  Calendar, 
  Plus, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Filter,
  Download,
  ChevronLeft,
  User,
  MapPin,
  CalendarDays,
  FileText,
  TrendingUp,
  AlertCircle
} from 'lucide-react'

interface LeaveBalance {
  id: string
  leaveType: string
  policyName: string
  entitlement: number
  accrued: number
  used: number
  pending: number
  available: number
  carryover: number
}

interface LeaveRequest {
  id: string
  employee: {
    firstName: string
    lastName: string
    employeeNumber: string
    department: { name: string }
  }
  leaveType: string
  startDate: string
  endDate: string
  totalDays: number
  reason: string
  status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED'
  submittedAt: string
  currentApprovalLevel: number
}

export const LeaveManagement: React.FC = () => {
  const navigate = useNavigate()
  const [balances, setBalances] = useState<LeaveBalance[]>([])
  const [requests, setRequests] = useState<LeaveRequest[]>([])
  const [pendingApprovals, setPendingApprovals] = useState<LeaveRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    fetchLeaveData()
  }, [])

  const fetchLeaveData = async () => {
    try {
      // TODO: Replace with actual API calls
      const mockBalances: LeaveBalance[] = [
        {
          id: '1',
          leaveType: 'ANNUAL',
          policyName: 'Annual Leave',
          entitlement: 25,
          accrued: 25,
          used: 8,
          pending: 3,
          available: 14,
          carryover: 0
        },
        {
          id: '2',
          leaveType: 'SICK',
          policyName: 'Sick Leave',
          entitlement: 10,
          accrued: 10,
          used: 2,
          pending: 0,
          available: 8,
          carryover: 0
        },
        {
          id: '3',
          leaveType: 'PERSONAL',
          policyName: 'Personal Leave',
          entitlement: 5,
          accrued: 5,
          used: 1,
          pending: 0,
          available: 4,
          carryover: 0
        }
      ]

      const mockRequests: LeaveRequest[] = [
        {
          id: '1',
          employee: {
            firstName: 'John',
            lastName: 'Doe',
            employeeNumber: 'EMP-001',
            department: { name: 'Engineering' }
          },
          leaveType: 'ANNUAL',
          startDate: '2024-03-15',
          endDate: '2024-03-18',
          totalDays: 4,
          reason: 'Family vacation',
          status: 'PENDING',
          submittedAt: '2024-02-20T10:00:00Z',
          currentApprovalLevel: 1
        },
        {
          id: '2',
          employee: {
            firstName: 'Jane',
            lastName: 'Smith',
            employeeNumber: 'EMP-002',
            department: { name: 'Marketing' }
          },
          leaveType: 'SICK',
          startDate: '2024-02-25',
          endDate: '2024-02-26',
          totalDays: 2,
          reason: 'Medical appointment',
          status: 'APPROVED',
          submittedAt: '2024-02-23T14:30:00Z',
          currentApprovalLevel: 1
        }
      ]

      setBalances(mockBalances)
      setRequests(mockRequests)
      setPendingApprovals(mockRequests.filter(r => r.status === 'PENDING'))
    } catch (error) {
      console.error('Error fetching leave data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'REJECTED':
        return 'bg-red-100 text-red-800'
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-blue-100 text-blue-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'PENDING':
        return <Clock className="w-4 h-4 text-yellow-600" />
      case 'REJECTED':
        return <XCircle className="w-4 h-4 text-red-600" />
      default:
        return <AlertCircle className="w-4 h-4 text-blue-600" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getLeaveTypeColor = (leaveType: string) => {
    switch (leaveType) {
      case 'ANNUAL':
        return 'text-blue-600'
      case 'SICK':
        return 'text-red-600'
      case 'PERSONAL':
        return 'text-purple-600'
      case 'MATERNITY':
      case 'PATERNITY':
        return 'text-pink-600'
      default:
        return 'text-gray-600'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/dashboard')}
            className="p-2"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Calendar className="w-6 h-6 mr-2" />
              Leave & Attendance
            </h1>
            <p className="text-gray-600">Manage leave requests and view balances</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button size="sm" onClick={() => navigate('/leave/request')}>
            <Plus className="w-4 h-4 mr-2" />
            New Request
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Available Days</p>
                <p className="text-3xl font-bold text-blue-600">
                  {balances.reduce((sum, b) => sum + b.available, 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <CalendarDays className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Used This Year</p>
                <p className="text-3xl font-bold text-green-600">
                  {balances.reduce((sum, b) => sum + b.used, 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Pending Requests</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {requests.filter(r => r.status === 'PENDING').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Pending Approvals</p>
                <p className="text-3xl font-bold text-orange-600">{pendingApprovals.length}</p>
              </div>
              <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="balances">Balances</TabsTrigger>
          <TabsTrigger value="requests">My Requests</TabsTrigger>
          <TabsTrigger value="approvals">Approvals</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Recent Requests */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Leave Requests</CardTitle>
                <Button variant="outline" size="sm" onClick={() => setActiveTab('requests')}>
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {requests.slice(0, 3).map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      {getStatusIcon(request.status)}
                      <div>
                        <h4 className="font-medium">
                          {request.leaveType} Leave
                        </h4>
                        <p className="text-sm text-gray-600">
                          {formatDate(request.startDate)} - {formatDate(request.endDate)} ({request.totalDays} days)
                        </p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(request.status)}>
                      {request.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/leave/request')}>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Plus className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">Request Leave</h3>
                <p className="text-sm text-gray-600">Submit a new leave request</p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/leave/calendar')}>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">Team Calendar</h3>
                <p className="text-sm text-gray-600">View team leave schedule</p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('balances')}>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">View Balances</h3>
                <p className="text-sm text-gray-600">Check your leave balances</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="balances" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Leave Balances - 2024</CardTitle>
              <CardDescription>
                Your current leave entitlements and usage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {balances.map((balance) => (
                  <div key={balance.id} className="border rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className={`font-semibold text-lg ${getLeaveTypeColor(balance.leaveType)}`}>
                        {balance.policyName}
                      </h3>
                      <div className="text-right">
                        <div className="text-2xl font-bold">{balance.available}</div>
                        <div className="text-sm text-gray-600">days available</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-4 text-center">
                      <div>
                        <div className="text-lg font-semibold text-gray-900">{balance.entitlement}</div>
                        <div className="text-xs text-gray-600">Entitlement</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-green-600">{balance.used}</div>
                        <div className="text-xs text-gray-600">Used</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-yellow-600">{balance.pending}</div>
                        <div className="text-xs text-gray-600">Pending</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-blue-600">{balance.carryover}</div>
                        <div className="text-xs text-gray-600">Carryover</div>
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Usage Progress</span>
                        <span>{Math.round((balance.used / balance.entitlement) * 100)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min((balance.used / balance.entitlement) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requests" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>My Leave Requests</CardTitle>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                  </Button>
                  <Button size="sm" onClick={() => navigate('/leave/request')}>
                    <Plus className="w-4 h-4 mr-2" />
                    New Request
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {requests.map((request) => (
                  <div key={request.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {getStatusIcon(request.status)}
                        <div>
                          <h4 className="font-medium">{request.leaveType} Leave</h4>
                          <p className="text-sm text-gray-600">
                            {formatDate(request.startDate)} - {formatDate(request.endDate)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={getStatusColor(request.status)}>
                          {request.status}
                        </Badge>
                        <p className="text-sm text-gray-600 mt-1">
                          {request.totalDays} day{request.totalDays !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 text-sm text-gray-600">
                      <strong>Reason:</strong> {request.reason}
                    </div>
                    <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                      <span>Submitted {formatDate(request.submittedAt)}</span>
                      {request.status === 'PENDING' && (
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">Edit</Button>
                          <Button variant="outline" size="sm" className="text-red-600">Cancel</Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approvals" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pending Approvals</CardTitle>
              <CardDescription>
                Leave requests awaiting your approval
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pendingApprovals.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No pending approvals</h3>
                  <p className="text-gray-600">All leave requests have been processed.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingApprovals.map((request) => (
                    <div key={request.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-gray-600" />
                          </div>
                          <div>
                            <h4 className="font-medium">
                              {request.employee.firstName} {request.employee.lastName}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {request.employee.department.name} • {request.employee.employeeNumber}
                            </p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(request.status)}>
                          Level {request.currentApprovalLevel}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                        <div>
                          <span className="font-medium">Leave Type:</span>
                          <p className={getLeaveTypeColor(request.leaveType)}>{request.leaveType}</p>
                        </div>
                        <div>
                          <span className="font-medium">Duration:</span>
                          <p>{request.totalDays} day{request.totalDays !== 1 ? 's' : ''}</p>
                        </div>
                        <div>
                          <span className="font-medium">Start Date:</span>
                          <p>{formatDate(request.startDate)}</p>
                        </div>
                        <div>
                          <span className="font-medium">End Date:</span>
                          <p>{formatDate(request.endDate)}</p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <span className="font-medium text-sm">Reason:</span>
                        <p className="text-sm text-gray-600 mt-1">{request.reason}</p>
                      </div>

                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" size="sm" className="text-red-600">
                          <XCircle className="w-4 h-4 mr-2" />
                          Reject
                        </Button>
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Approve
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}