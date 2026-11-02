import React, { useState, useRef } from 'react';
import { 
  Factory, 
  Search, 
  Sparkles, 
  Copy, 
  CheckCircle2, 
  Wrench, 
  Radio, 
  AlertTriangle, 
  Layers, 
  ChevronRight,
  BookmarkCheck,
  AlertCircle
} from 'lucide-react';
import { CompanyProcessProfile } from '../types/manufacturing';
import { PRESET_COMPANIES } from '../data/presetCompanies';

interface CompanyExplorerProps {
  onSelectCompanyForInterview?: (companyName: string) => void;
}

export const CompanyExplorer: React.FC<CompanyExplorerProps> = ({ onSelectCompanyForInterview }) => {
  const [inputCompany, setInputCompany] = useState<string>('삼성전자 평택캠퍼스 P3 파운드리');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [lastAnalyzedInfo, setLastAnalyzedInfo] = useState<string | null>(null);
  const [profile, setProfile] = useState<CompanyProcessProfile>(PRESET_COMPANIES['삼성전자 평택캠퍼스 P3 파운드리']);
  const [copiedPitch, setCopiedPitch] = useState<boolean>(false);
  const [selectedStepIndex, setSelectedStepIndex] = useState<number>(0);
  const resultRef = useRef<HTMLDivElement>(null);

  const handleSelectPreset = (presetName: string) => {
    setInputCompany(presetName);
    setErrorMsg(null);
    if (PRESET_COMPANIES[presetName]) {
      setProfile(PRESET_COMPANIES[presetName]);
      setSelectedStepIndex(0);
      setLastAnalyzedInfo(`프리셋 로드됨: ${presetName}`);
    }
  };

  const handleAnalyzeCompany = async (targetName: string) => {
    const trimmed = targetName.trim();
    if (!trimmed) {
      setErrorMsg('분석할 기업명 또는 사업부/공장명을 입력해주세요.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/gemini/company-explorer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyName: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '공정 역공학 분석에 실패했습니다.');
      if (!data || !Array.isArray(data.pipeline_steps) || data.pipeline_steps.length === 0) {
        throw new Error('유효한 공정 파이프라인 데이터를 받지 못했습니다. 다시 시도해주세요.');
      }
      setProfile(data);
      setSelectedStepIndex(0);
      const now = new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setLastAnalyzedInfo(`AI 맞춤 역공학 완료: "${trimmed}" (${now})`);
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'AI 공정 분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const copyPitch = () => {
    if (!profile?.interview_pitch_template) return;
    navigator.clipboard.writeText(profile.interview_pitch_template);
    setCopiedPitch(true);
    setTimeout(() => setCopiedPitch(false), 2000);
  };

  const isDiscrete = profile?.manufacturing_type?.includes('이산');

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                MODULE 1
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                기업별 제조 공정 흐름 역공학
              </h2>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed max-w-3xl">
              목표 기업(또는 사업부/공장/라인)을 직접 입력하고 <strong>공정 역공학 분석</strong> 버튼을 누르면, AI가 해당 기업의 주력 공정 단계, 수집 센서·OT 데이터, 고질적 병목(Pain Points)과 DX 과제를 실시간 역공학합니다.
            </p>
          </div>
        </div>

        {/* Preset Company Quick Buttons */}
        <div className="mt-5 pt-4 border-t border-slate-100 space-y-2">
          <div className="text-xs font-semibold text-slate-500">대표 사업장 빠른 프리셋 보기 (또는 아래 검색창에 원하는 기업/사업부 직접 입력):</div>
          <div className="flex flex-wrap gap-2">
            {Object.keys(PRESET_COMPANIES).map((name) => {
              const isSelected = inputCompany === name;
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => handleSelectPreset(name)}
                  className={`text-xs px-3.5 py-2 rounded-xl border transition-all ${
                    isSelected
                      ? 'bg-blue-50 border-blue-300 text-blue-800 font-semibold shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                  }`}
                >
                  {name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Search Bar */}
        <div className="mt-4 flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={inputCompany}
              onChange={(e) => setInputCompany(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !loading && handleAnalyzeCompany(inputCompany)}
              placeholder="분석할 기업명·사업부·공장 입력 (예: SK하이닉스 이천 M16, 한화에어로스페이스 창원, LG화학 여수 NCC...)"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition"
            />
          </div>
          <button
            type="button"
            onClick={() => handleAnalyzeCompany(inputCompany)}
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm disabled:opacity-50 transition flex items-center justify-center gap-2 shadow-xs shrink-0"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>AI 공정 역공학 분석 중...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>공정 역공학 분석</span>
              </>
            )}
          </button>
        </div>

        {/* Status / Error Feedback */}
        {errorMsg && (
          <div className="mt-3 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs sm:text-sm text-rose-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {lastAnalyzedInfo && !errorMsg && (
          <div className="mt-3 px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{lastAnalyzedInfo}</span>
          </div>
        )}
      </div>

      {/* Main Profile Result */}
      {profile && (
        <div ref={resultRef} className="space-y-6">
          {/* Company Profile Summary Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <h3 className="text-2xl font-bold text-slate-900">{profile.company_name}</h3>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      isDiscrete
                        ? 'bg-sky-50 text-sky-800 border border-sky-200'
                        : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    }`}
                  >
                    {profile.manufacturing_type}
                  </span>
                </div>
                <p className="text-sm text-slate-600 font-medium mt-1 flex items-center gap-1.5">
                  <Factory className="w-4 h-4 text-blue-600" />
                  <span>대표 사업장: {profile.main_site}</span>
                </p>
              </div>

              {onSelectCompanyForInterview && (
                <button
                  type="button"
                  onClick={() => onSelectCompanyForInterview(profile.company_name)}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-2 transition self-start lg:self-auto shadow-xs"
                >
                  <span>이 공정으로 기술면접 질문 도출</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>

            {profile.site_overview && (
              <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                {profile.site_overview}
              </p>
            )}

            {/* Purdue Level Breakdown Grid */}
            {profile.purdue_level_breakdown && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="text-xs font-bold text-sky-700">Level 0~1 (설비/센서)</span>
                  <p className="text-xs text-slate-700 mt-1 leading-relaxed">{profile.purdue_level_breakdown.level0_1}</p>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="text-xs font-bold text-amber-700">Level 2 (SCADA/IPC)</span>
                  <p className="text-xs text-slate-700 mt-1 leading-relaxed">{profile.purdue_level_breakdown.level2}</p>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="text-xs font-bold text-emerald-700">Level 3 (MES/QMS)</span>
                  <p className="text-xs text-slate-700 mt-1 leading-relaxed">{profile.purdue_level_breakdown.level3}</p>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="text-xs font-bold text-purple-700">Level 4 (전사 ERP/Lake)</span>
                  <p className="text-xs text-slate-700 mt-1 leading-relaxed">{profile.purdue_level_breakdown.level4}</p>
                </div>
              </div>
            )}
          </div>

          {/* End-to-End Pipeline Step-by-Step Flow */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div>
                <h4 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-blue-600" />
                  엔드투엔드 공정 파이프라인 (Step-by-Step)
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  각 공정 단계를 클릭하면 설비 물리 변화, 센서/OT 통신, 고질적 Pain Point가 펼쳐집니다.
                </p>
              </div>
              <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-lg">
                총 {profile.pipeline_steps.length}개 핵심 공정
              </span>
            </div>

            {/* Stepper Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
              {profile.pipeline_steps.map((step, idx) => {
                const isSelected = selectedStepIndex === idx;
                return (
                  <button
                    key={step.step || idx}
                    type="button"
                    onClick={() => setSelectedStepIndex(idx)}
                    className={`text-left p-3.5 rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-blue-50 border-blue-500 shadow-xs ring-1 ring-blue-500'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        isSelected ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'
                      }`}>
                        STEP 0{step.step || idx + 1}
                      </span>
                    </div>
                    <p className={`text-xs font-bold line-clamp-1 ${isSelected ? 'text-blue-900' : 'text-slate-800'}`}>
                      {step.process_name}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Selected Step Detailed Diagnostic Box */}
            {profile.pipeline_steps[selectedStepIndex] && (
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 sm:p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                      {profile.pipeline_steps[selectedStepIndex].step || selectedStepIndex + 1}
                    </span>
                    <h5 className="text-base font-bold text-slate-900">
                      {profile.pipeline_steps[selectedStepIndex].process_name}
                    </h5>
                  </div>
                  <span className="text-xs font-semibold text-blue-700 bg-blue-100/60 px-3 py-1 rounded-full border border-blue-200">
                    현장 데이터 연동 심층 분석
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Equipment & Physics */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2 shadow-xs">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                      <Wrench className="w-4 h-4 text-slate-600" />
                      <span>주요 설비 및 물리적 상태 변화</span>
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed">
                      {profile.pipeline_steps[selectedStepIndex].equipment}
                    </p>
                  </div>

                  {/* OT Sensors & Telemetry */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2 shadow-xs">
                    <div className="flex items-center gap-2 text-xs font-bold text-blue-900">
                      <Radio className="w-4 h-4 text-blue-600" />
                      <span>수집 센서 및 OT 통신 데이터</span>
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed font-mono">
                      {profile.pipeline_steps[selectedStepIndex].ot_data}
                    </p>
                  </div>

                  {/* Pain Points */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2 shadow-xs">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      <span>품질/설비 고질적 병목 (Pain Points)</span>
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed">
                      {profile.pipeline_steps[selectedStepIndex].pain_points}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Actual DX/AX Corporate Initiatives */}
          {profile.actual_dx_initiatives && profile.actual_dx_initiatives.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-4">
              <h4 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                실제 도입 및 PoC 진행 중인 제조DX/AX 과제
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {profile.actual_dx_initiatives.map((dx, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-50 rounded-xl p-4 sm:p-5 border border-slate-200 space-y-2.5"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <h5 className="text-sm font-bold text-slate-900">{dx.title}</h5>
                    </div>
                    <div className="text-xs text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200 font-mono">
                      <span className="text-blue-700 font-semibold">Tech:</span> {dx.tech_stack}
                    </div>
                    <p className="text-xs text-emerald-700 font-medium flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{dx.expected_effect}</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Interview Pitch Speech Template */}
          <div className="bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-slate-50 rounded-2xl border border-blue-200 p-6 sm:p-7 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <BookmarkCheck className="w-5 h-5 text-blue-600" />
                <h4 className="text-base font-bold text-slate-900">
                  면접관 맞춤형 공정 이해도 1분 어필 발언 템플릿
                </h4>
              </div>
              <button
                type="button"
                onClick={copyPitch}
                className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-xs self-start sm:self-auto"
              >
                {copiedPitch ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                    <span>복사 완료!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>발언문 복사</span>
                  </>
                )}
              </button>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-xl border border-blue-200 text-slate-800 text-sm leading-relaxed font-sans shadow-xs">
              "{profile.interview_pitch_template}"
            </div>

            <p className="text-xs text-slate-600">
              💡 <strong className="text-blue-800">면접관 시선 코칭:</strong> 단순 IT 기술만 나열하는 지원자와 달리, 
              해당 기업의 특정 단위 공정명과 센서 데이터(예: 진동, 로드셀, OES)를 직접 언급하면 면접관에게 
              "공장 현장을 실제로 알고 온 준비된 엔지니어"라는 강렬한 확신을 줍니다.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
