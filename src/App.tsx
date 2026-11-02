import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { CompanyExplorer } from './components/CompanyExplorer';
import { JobDiagnosis } from './components/JobDiagnosis';
import { CuratedJobs } from './components/CuratedJobs';
import { BeiProbing } from './components/BeiProbing';
import { TechnicalInterview } from './components/TechnicalInterview';
import { AxTrendBrief } from './components/AxTrendBrief';
import { PurdueKnowledgeBase } from './components/PurdueKnowledgeBase';
import { CuratedJob } from './types/manufacturing';
import { Cpu, ShieldCheck } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('company');
  const [interviewCompany, setInterviewCompany] = useState<string>('삼성전자 평택 파운드리 P3');
  const [interviewRole, setInterviewRole] = useState<string>('스마트팩토리 제조AI / FDC 엔지니어');
  const [selectedJobForDiagnosis, setSelectedJobForDiagnosis] = useState<CuratedJob | null>(null);

  // Handle cross-module routing
  const handleSelectCompanyForInterview = (companyName: string) => {
    setInterviewCompany(companyName);
    setActiveTab('tech_interview');
  };

  const handleSelectJobForDiagnosis = (job: CuratedJob) => {
    setSelectedJobForDiagnosis(job);
    setActiveTab('job_diagnosis');
  };

  const handleSelectJobForInterview = (job: CuratedJob) => {
    setInterviewCompany(job.company);
    setInterviewRole(job.role);
    setActiveTab('tech_interview');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Navigation */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'company' && (
          <CompanyExplorer onSelectCompanyForInterview={handleSelectCompanyForInterview} />
        )}

        {activeTab === 'job_diagnosis' && (
          <JobDiagnosis initialJob={selectedJobForDiagnosis} />
        )}

        {activeTab === 'curated_jobs' && (
          <CuratedJobs 
            onSelectJobForDiagnosis={handleSelectJobForDiagnosis}
            onSelectJobForInterview={handleSelectJobForInterview}
          />
        )}

        {activeTab === 'bei_probing' && (
          <BeiProbing />
        )}

        {activeTab === 'tech_interview' && (
          <TechnicalInterview 
            initialCompany={interviewCompany}
            initialRole={interviewRole}
          />
        )}

        {activeTab === 'ax_trends' && (
          <AxTrendBrief />
        )}

        {activeTab === 'purdue_metrics' && (
          <PurdueKnowledgeBase />
        )}
      </main>

      {/* Industrial Clean Footer */}
      <footer className="mt-16 border-t border-slate-200 bg-white py-8 text-xs text-slate-600 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center">
              <Cpu className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-slate-900">ManuDX Coach</span>
            <span className="text-slate-400">|</span>
            <span className="text-slate-600">시니어 제조DX 아키텍트 &amp; 수석 기술 면접 코칭 시스템</span>
          </div>

          <div className="flex items-center space-x-3 font-medium text-xs text-slate-600">
            <span>Purdue Model L0-L4</span>
            <span className="text-slate-300">·</span>
            <span>OEE / FTY / Takt Time</span>
            <span className="text-slate-300">·</span>
            <span className="text-emerald-700 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Plant Reality Verified
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
