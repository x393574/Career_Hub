import React, { useState } from 'react';
import { 
  Briefcase, 
  MapPin, 
  Layers, 
  Clock, 
  ArrowRight, 
  Sparkles,
  Search
} from 'lucide-react';
import { CURATED_JOBS } from '../data/presetJobs';
import { CuratedJob } from '../types/manufacturing';

interface CuratedJobsProps {
  onSelectJobForDiagnosis?: (job: CuratedJob) => void;
  onSelectJobForInterview?: (job: CuratedJob) => void;
}

export const CuratedJobs: React.FC<CuratedJobsProps> = ({ 
  onSelectJobForDiagnosis, 
  onSelectJobForInterview 
}) => {
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedSkillFilter, setSelectedSkillFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const skillFilters = [
    { id: 'all', label: '전체 역량' },
    { id: '시계열', label: '시계열 / 센서 PdM' },
    { id: '비전', label: '컴퓨터 비전 결함 검사' },
    { id: 'PLC', label: 'PLC / 산업용 통신' },
    { id: 'Edge', label: 'Edge AI / 경량화' },
    { id: 'SECS', label: 'SECS-GEM / 반도체' }
  ];

  const filteredJobs = CURATED_JOBS.filter((job) => {
    if (selectedType === 'discrete' && !job.manufacturingType.includes('이산')) return false;
    if (selectedType === 'process' && !job.manufacturingType.includes('연속')) return false;

    if (selectedSkillFilter !== 'all') {
      const matchSkill = job.keySkills.some(s => s.toLowerCase().includes(selectedSkillFilter.toLowerCase()));
      if (!matchSkill) return false;
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const inText = job.company.toLowerCase().includes(q) ||
                     job.role.toLowerCase().includes(q) ||
                     job.summary.toLowerCase().includes(q) ||
                     job.keySkills.some(s => s.toLowerCase().includes(q));
      if (!inText) return false;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                MODULE 3
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                제조DX 맞춤 채용 공고 큐레이션
              </h2>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed max-w-3xl">
              지원자의 보유 역량(시계열 센서, 컴퓨터 비전, PLC/SCADA 통신, Edge AI)과 선호 공정에 맞춰 
              국내 대표 제조 대기업의 실제 유사 직무 및 현장 Takt Time 제약조건을 큐레이션합니다.
            </p>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="기업명, 직무명, 기술 키워드 검색 (예: 삼성, PLC, TensorRT...)"
              className="w-full pl-10 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs sm:text-sm focus:outline-none focus:bg-white focus:border-blue-600 transition"
            />
          </div>

          {/* Manufacturing Type Buttons */}
          <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200 shrink-0">
            <button
              onClick={() => setSelectedType('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                selectedType === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              전체 공정
            </button>
            <button
              onClick={() => setSelectedType('discrete')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                selectedType === 'discrete' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              이산 가공·조립
            </button>
            <button
              onClick={() => setSelectedType('process')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                selectedType === 'process' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              연속·배치 공정
            </button>
          </div>
        </div>

        {/* Skill Badges Filter */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {skillFilters.map((sf) => (
            <button
              key={sf.id}
              onClick={() => setSelectedSkillFilter(sf.id)}
              className={`text-xs px-3 py-1.5 rounded-lg border transition ${
                selectedSkillFilter === sf.id
                  ? 'bg-blue-50 border-blue-300 text-blue-800 font-bold shadow-xs'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {sf.label}
            </button>
          ))}
        </div>
      </div>

      {/* Job Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredJobs.map((job) => {
          const isDiscrete = job.manufacturingType.includes('이산');
          return (
            <div
              key={job.id}
              className="bg-white rounded-2xl border border-slate-200 hover:border-blue-400 p-6 shadow-xs flex flex-col justify-between transition-all group"
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-xs font-bold text-blue-700">
                      {job.company}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors mt-0.5">
                      {job.role}
                    </h3>
                  </div>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-semibold shrink-0 ${
                      isDiscrete
                        ? 'bg-sky-50 text-sky-800 border border-sky-200'
                        : 'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}
                  >
                    {isDiscrete ? '이산 조립' : '연속 배치'}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span className="flex items-center gap-1 font-medium text-slate-600">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {job.location}
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1 text-slate-600 font-medium">
                    <Layers className="w-3.5 h-3.5 text-blue-600" />
                    {job.purdueLevel}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                  {job.summary}
                </p>

                {/* Takt Time Context */}
                <div className="bg-amber-50/70 p-3 rounded-xl border border-amber-200 text-xs text-amber-950 flex items-start gap-2">
                  <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-amber-900">현장 Takt Time 제약: </span>
                    <span className="leading-relaxed">{job.taktTimeContext}</span>
                  </div>
                </div>

                {/* Key Skills */}
                <div className="flex flex-wrap gap-1 pt-1">
                  {job.keySkills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-2.5">
                {onSelectJobForDiagnosis && (
                  <button
                    onClick={() => onSelectJobForDiagnosis(job)}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition flex items-center justify-center gap-1"
                  >
                    <span>공고 정밀 진단</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                  </button>
                )}
                {onSelectJobForInterview && (
                  <button
                    onClick={() => onSelectJobForInterview(job)}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition flex items-center justify-center gap-1 shadow-xs"
                  >
                    <span>기술 면접 준비</span>
                    <Sparkles className="w-3.5 h-3.5 text-white" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
