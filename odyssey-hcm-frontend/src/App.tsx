import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LandingPage } from './components/landing-page';
import { Dashboard } from './components/dashboard';
import { LeaveManagement } from './components/leave/leave-management';
import { EmployeeProfile } from './components/hris/employee-profile';
import { OrgChart } from './components/hris/org-chart';
import { OnboardingWorkflow } from './components/hris/onboarding-workflow';
import { RecruitmentManagement } from './components/recruitment/recruitment-management';
import { JobRequisitionForm } from './components/recruitment/job-requisition-form';
import { ApplicationPipeline } from './components/recruitment/application-pipeline';
import PerformanceManagement from './components/performance/performance-management';
import GoalManagement from './components/performance/goal-management';
import PerformanceReviewForm from './components/performance/performance-review-form';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* HRIS Module Routes */}
          <Route path="/hris/employees/:id" element={<EmployeeProfile />} />
          <Route path="/hris/org-chart" element={<OrgChart />} />
          <Route path="/hris/onboarding/:workflowId" element={<OnboardingWorkflow />} />
          
          {/* Leave & Attendance Module Routes */}
          <Route path="/leave" element={<LeaveManagement />} />
          
          {/* Recruitment & ATS Module Routes */}
          <Route path="/recruitment" element={<RecruitmentManagement />} />
          <Route path="/recruitment/requisitions/new" element={<JobRequisitionForm onSubmit={() => {}} onCancel={() => {}} />} />
          <Route path="/recruitment/applications" element={<ApplicationPipeline />} />
          
          {/* Performance Management Module Routes */}
          <Route path="/performance" element={<PerformanceManagement />} />
          <Route path="/performance/goals" element={<GoalManagement />} />
          <Route path="/performance/reviews" element={<PerformanceReviewForm />} />
          
          {/* Future Module Routes */}
          <Route path="/compensation" element={<div className="p-8"><h1 className="text-2xl font-bold">Compensation Module - Coming Soon</h1></div>} />
          <Route path="/learning" element={<div className="p-8"><h1 className="text-2xl font-bold">Learning Module - Coming Soon</h1></div>} />
          <Route path="/analytics" element={<div className="p-8"><h1 className="text-2xl font-bold">Analytics Module - Coming Soon</h1></div>} />
        </Routes>
      </div>
    </Router>
  );
}
