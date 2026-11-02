import React from 'react';
import { 
  Cpu, 
  Factory, 
  FileSearch, 
  Briefcase, 
  HelpCircle, 
  Mic, 
  TrendingUp, 
  Layers
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'company', label: '공정 역공학', icon: Factory },
    { id: 'job_diagnosis', label: '공고 역량 진단', icon: FileSearch },
    { id: 'curated_jobs', label: '추천 공고', icon: Briefcase },
    { id: 'bei_probing', label: 'BEI 꼬리질문 & STAR', icon: HelpCircle },
    { id: 'tech_interview', label: '기술면접 & 모의', icon: Mic },
    { id: 'ax_trends', label: 'AX 트렌드 & 스피치', icon: TrendingUp },
    { id: 'purdue_metrics', label: 'Purdue & 공장 지표', icon: Layers },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-8">
          {/* Brand Zone */}
          <div 
            className="flex items-center space-x-3 cursor-pointer shrink-0" 
            onClick={() => setActiveTab('company')}
          >
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg text-slate-900 tracking-tight">
                  ManuDX Coach
                </span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  수석 면접관 코칭
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                제조업 생산기술 · 제조DX/AX · 스마트팩토리 전담 기술 코칭
              </p>
            </div>
          </div>

          {/* Purdue & Protocol Badge */}
          <div className="hidden md:flex items-center gap-3 text-xs text-slate-600 bg-slate-50 px-3.5 py-1.5 rounded-xl border border-slate-200 shrink-0">
            <span className="font-semibold text-slate-900">Purdue Model L0-L4</span>
            <span className="text-slate-300">·</span>
            <span className="text-blue-700 font-medium">OT/IT 통합 검증</span>
            <span className="text-slate-300">·</span>
            <span>Takt Time &amp; FTY</span>
          </div>
        </div>

        {/* Tab Navigation - Clean Segmented Control */}
        <div className="py-2.5 overflow-x-auto scrollbar-none border-t border-slate-100 flex items-center gap-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
