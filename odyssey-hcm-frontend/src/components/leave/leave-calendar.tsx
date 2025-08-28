import React, { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Users, Filter, Download } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

interface LeaveEvent {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeAvatar?: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  status: 'pending' | 'approved' | 'rejected';
  isHalfDay?: boolean;
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  leaves: LeaveEvent[];
}

interface LeaveCalendarProps {
  departmentId?: string;
  managerId?: string;
  showMyTeamOnly?: boolean;
}

export const LeaveCalendar: React.FC<LeaveCalendarProps> = ({
  departmentId,
  managerId,
  showMyTeamOnly = false
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [leaves, setLeaves] = useState<LeaveEvent[]>([]);
  const [selectedLeaveTypes, setSelectedLeaveTypes] = useState<string[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [loading, setLoading] = useState(true);

  const leaveTypeColors = {
    'Annual Leave': 'bg-blue-100 text-blue-800 border-blue-200',
    'Sick Leave': 'bg-red-100 text-red-800 border-red-200',
    'Personal Leave': 'bg-green-100 text-green-800 border-green-200',
    'Maternity Leave': 'bg-purple-100 text-purple-800 border-purple-200',
    'Emergency Leave': 'bg-orange-100 text-orange-800 border-orange-200'
  };

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800'
  };

  useEffect(() => {
    fetchLeaves();
  }, [currentDate, departmentId, managerId]);

  useEffect(() => {
    generateCalendarDays();
  }, [currentDate, leaves, selectedLeaveTypes, selectedStatus]);

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      
      const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      params.append('startDate', startDate.toISOString().split('T')[0]);
      params.append('endDate', endDate.toISOString().split('T')[0]);
      
      if (departmentId) params.append('departmentId', departmentId);
      if (managerId) params.append('managerId', managerId);
      if (showMyTeamOnly) params.append('teamOnly', 'true');

      const response = await fetch(`/api/leave/calendar?${params}`);
      const data = await response.json();

      if (data.success) {
        setLeaves(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch leave calendar:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    const endDate = new Date(lastDay);
    
    // Start from Sunday of the week containing the first day
    startDate.setDate(startDate.getDate() - startDate.getDay());
    
    // End on Saturday of the week containing the last day
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));
    
    const days: CalendarDay[] = [];
    const currentDay = new Date(startDate);
    const today = new Date();
    
    while (currentDay <= endDate) {
      const dayLeaves = getFilteredLeavesForDate(currentDay);
      
      days.push({
        date: new Date(currentDay),
        isCurrentMonth: currentDay.getMonth() === month,
        isToday: currentDay.toDateString() === today.toDateString(),
        leaves: dayLeaves
      });
      
      currentDay.setDate(currentDay.getDate() + 1);
    }
    
    setCalendarDays(days);
  };

  const getFilteredLeavesForDate = (date: Date): LeaveEvent[] => {
    return leaves.filter(leave => {
      const leaveStart = new Date(leave.startDate);
      const leaveEnd = new Date(leave.endDate);
      const checkDate = new Date(date);
      
      // Check if date falls within leave period
      const isInPeriod = checkDate >= leaveStart && checkDate <= leaveEnd;
      
      if (!isInPeriod) return false;
      
      // Apply filters
      if (selectedLeaveTypes.length > 0 && !selectedLeaveTypes.includes(leave.leaveType)) {
        return false;
      }
      
      if (selectedStatus !== 'all' && leave.status !== selectedStatus) {
        return false;
      }
      
      return true;
    });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const exportCalendar = async () => {
    try {
      const params = new URLSearchParams();
      const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      params.append('startDate', startDate.toISOString().split('T')[0]);
      params.append('endDate', endDate.toISOString().split('T')[0]);
      params.append('format', 'csv');
      
      if (departmentId) params.append('departmentId', departmentId);
      if (managerId) params.append('managerId', managerId);

      const response = await fetch(`/api/leave/calendar/export?${params}`);
      const blob = await response.blob();
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `leave-calendar-${currentDate.getFullYear()}-${currentDate.getMonth() + 1}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to export calendar:', error);
    }
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const uniqueLeaveTypes = Array.from(new Set(leaves.map(leave => leave.leaveType)));

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Team Leave Calendar
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={exportCalendar}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm" onClick={goToToday}>
              Today
            </Button>
          </div>
        </div>
        
        {/* Calendar Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h3 className="text-lg font-semibold min-w-[200px] text-center">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h3>
            <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Filters */}
          <div className="flex items-center gap-2">
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            
            {uniqueLeaveTypes.length > 0 && (
              <Select 
                value={selectedLeaveTypes[0] || 'all'} 
                onValueChange={(value) => setSelectedLeaveTypes(value === 'all' ? [] : [value])}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Leave Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {uniqueLeaveTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-1">
            {/* Week day headers */}
            {weekDays.map(day => (
              <div key={day} className="p-2 text-sm font-medium text-gray-500 text-center">
                {day}
              </div>
            ))}
            
            {/* Calendar days */}
            {calendarDays.map((day, index) => (
              <div
                key={index}
                className={`
                  min-h-[100px] p-1 border border-gray-200 
                  ${day.isCurrentMonth ? 'bg-white' : 'bg-gray-50'}
                  ${day.isToday ? 'bg-blue-50 border-blue-300' : ''}
                `}
              >
                <div className={`
                  text-sm font-medium mb-1
                  ${day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}
                  ${day.isToday ? 'text-blue-600' : ''}
                `}>
                  {day.date.getDate()}
                </div>
                
                <div className="space-y-1">
                  {day.leaves.slice(0, 3).map((leave, leaveIndex) => (
                    <div
                      key={leaveIndex}
                      className={`
                        text-xs p-1 rounded border
                        ${leaveTypeColors[leave.leaveType] || 'bg-gray-100 text-gray-800 border-gray-200'}
                        cursor-pointer hover:opacity-80 transition-opacity
                      `}
                      title={`${leave.employeeName} - ${leave.leaveType} (${leave.status})`}
                    >
                      <div className="flex items-center gap-1">
                        <Avatar className="h-4 w-4">
                          <AvatarImage src={leave.employeeAvatar} />
                          <AvatarFallback className="text-[8px]">
                            {leave.employeeName.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <span className="truncate flex-1">
                          {leave.employeeName.split(' ')[0]}
                        </span>
                        {leave.isHalfDay && (
                          <span className="text-[8px]">½</span>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="truncate">{leave.leaveType}</span>
                        <Badge 
                          variant="secondary" 
                          className={`text-[8px] px-1 ${statusColors[leave.status]}`}
                        >
                          {leave.status[0].toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  
                  {day.leaves.length > 3 && (
                    <div className="text-xs text-gray-500 p-1">
                      +{day.leaves.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Legend */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium mb-2">Legend</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {Object.entries(leaveTypeColors).map(([type, classes]) => (
              <div key={type} className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded border ${classes}`}></div>
                <span className="text-xs">{type}</span>
              </div>
            ))}
          </div>
          
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-1">
              <span className="text-xs">½</span>
              <span className="text-xs text-gray-600">Half Day</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">P</Badge>
              <span className="text-xs text-gray-600">Pending</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">A</Badge>
              <span className="text-xs text-gray-600">Approved</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs bg-red-100 text-red-800">R</Badge>
              <span className="text-xs text-gray-600">Rejected</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};