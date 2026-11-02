import React, { useState, useEffect, useRef } from 'react';
import { 
  FileSearch, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  Cpu, 
  Sliders, 
  ShieldAlert, 
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { JobAnalysis, CuratedJob } from '../types/manufacturing';
import { PRESET_JD_TEXTS, SAMPLE_CANDIDATE_EXPERIENCES } from '../data/presetJobs';

interface JobDiagnosisProps {
  initialJob?: CuratedJob | null;
}

export const JobDiagnosis: React.FC<JobDiagnosisProps> = ({ initialJob }) => {
  const [jobText, setJobText] = useState<string>(PRESET_JD_TEXTS.samsung_ds);
  const [userExperience, setUserExperience] = useState<string>(SAMPLE_CANDIDATE_EXPERIENCES[0].text);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [lastAnalyzedAt, setLastAnalyzedAt] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<JobAnalysis | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const runDiagnosis = async (jdToAnalyze: string, expToAnalyze: string) => {
    if (!jdToAnalyze.trim()) {
      setErrorMsg('분석할 채용 공고문을 입력해주세요.');
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/gemini/job-diagnosis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobDescription: jdToAnalyze,
          userExperience: expToAnalyze,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '공고 정밀 진단에 실패했습니다.');
      if (!data || !data.match_score) {
        throw new Error('유효한 진단 데이터를 받지 못했습니다. 다시 시도해주세요.');
      }
      setAnalysis(data);
      const now = new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setLastAnalyzedAt(`입력한 공고문 & 보유 이력 기반 AI 정밀 진단 완료 (${now})`);
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || '공고 진단 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialJob) {
      const synthesizedJd = `[${initialJob.company}] ${initialJob.role} (${initialJob.division})\n- 근무지: ${initialJob.location}\n- 공정 유형: ${initialJob.manufacturingType}\n- Purdue 계층: ${initialJob.purdueLevel}\n- 주요 업무: ${initialJob.summary}\n- 현장 Takt Time 제약: ${initialJob.taktTimeContext}\n- 요구 기술 스택: ${initialJob.keySkills.join(', ')}`;
      setJobText(synthesizedJd);
      runDiagnosis(synthesizedJd, userExperience);
    }
  }, [initialJob]);

  const handleDiagnose = () => {
    runDiagnosis(jobText, userExperience);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                MODULE 2
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                공고문 정밀 파싱 &amp; 역량 진단
              </h2>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed max-w-3xl">
              좌측에 채용 공고문, 우측에 본인의 보유 이력/프로젝트 메모를 입력하고 아래 <strong>공고 정밀 분석 &amp; OT/IT 적합도 진단 실행</strong> 버튼을 누르면, 내 입력사항을 1:1 대조하여 적합도 점수와 보완 포인트를 도출합니다.
            </p>
          </div>
        </div>
      </div>

      {/* Input Section Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Job Description Input */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileSearch className="w-4 h-4 text-blue-600" />
              <span>채용 공고문 입력 (JD)</span>
            </h3>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-500">예시 불러오기:</span>
              <button
                type="button"
                onClick={() => setJobText(PRESET_JD_TEXTS.samsung_ds)}
                className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition"
              >
                삼성전자
              </button>
              <button
                type="button"
                onClick={() => setJobText(PRESET_JD_TEXTS.hyundai_smart)}
                className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition"
              >
                현대차
              </button>
              <button
                type="button"
                onClick={() => setJobText(PRESET_JD_TEXTS.lges_battery)}
                className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition"
              >
                LG엔솔
              </button>
            </div>
          </div>
          <textarea
            value={jobText}
            onChange={(e) => setJobText(e.target.value)}
            rows={10}
            placeholder="채용 공고문 전체를 복사하여 붙여넣으세요..."
            className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs sm:text-sm font-sans leading-relaxed focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition"
          />
        </div>

        {/* Right: Candidate Experience Input */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-blue-600" />
              <span>내 보유 이력 / 프로젝트 메모</span>
            </h3>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-500">경험 예시:</span>
              <button
                type="button"
                onClick={() => setUserExperience(SAMPLE_CANDIDATE_EXPERIENCES[0].text)}
                className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition"
              >
                진동 FFT
              </button>
              <button
                type="button"
                onClick={() => setUserExperience(SAMPLE_CANDIDATE_EXPERIENCES[1].text)}
                className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition"
              >
                비전 YOLO
              </button>
              <button
                type="button"
                onClick={() => setUserExperience(SAMPLE_CANDIDATE_EXPERIENCES[2].text)}
                className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition"
              >
                PLC 통신
              </button>
            </div>
          </div>
          <textarea
            value={userExperience}
            onChange={(e) => setUserExperience(e.target.value)}
            rows={10}
            placeholder="본인의 학부 캡스톤, 부트캠프, 연구실 산학 프로젝트 경험을 자유롭게 작성하세요..."
            className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs sm:text-sm font-sans leading-relaxed focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition"
          />
        </div>
      </div>

      {/* Action Button & Status */}
      <div className="flex flex-col items-center gap-3">
        <button
          type="button"
          onClick={handleDiagnose}
          disabled={loading || !jobText.trim()}
          className="px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm disabled:opacity-50 transition flex items-center gap-2.5 shadow-sm"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>내 입력사항 기반으로 공고 &amp; 적합도 정밀 분석 중...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>공고 정밀 분석 &amp; OT/IT 적합도 진단 실행</span>
            </>
          )}
        </button>

        {errorMsg && (
          <div className="w-full max-w-2xl p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs sm:text-sm text-rose-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {lastAnalyzedAt && !errorMsg && (
          <div className="px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{lastAnalyzedAt}</span>
          </div>
        )}
      </div>

      {/* Diagnosis Results */}
      {analysis && (
        <div ref={resultRef} className="space-y-6">
          {/* Top Score Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Overall Score */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase">
                종합 적합도 (Overall)
              </span>
              <div className="my-2 flex items-baseline gap-1.5">
                <span className="text-4xl font-extrabold text-blue-600 tabular-nums">
                  {analysis.match_score.overall}
                </span>
                <span className="text-sm font-semibold text-slate-400">/ 100</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-blue-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(analysis.match_score.overall, 100)}%` }}
                />
              </div>
            </div>

            {/* Essential Requirements Check */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase">
                필수 지원 자격 충족
              </span>
              <div className="my-2 flex items-center gap-2">
                {analysis.match_score.requirement_check ? (
                  <>
                    <CheckCircle2 className="w-7 h-7 text-emerald-600 shrink-0" />
                    <div>
                      <span className="text-lg font-bold text-slate-900">충족 (Pass)</span>
                      <p className="text-xs text-slate-500">기본 지원 자격 패스</p>
                    </div>
                  </>
                ) : (
                  <>
                    <XCircle className="w-7 h-7 text-rose-600 shrink-0" />
                    <div>
                      <span className="text-lg font-bold text-slate-900">미흡 (Deficient)</span>
                      <p className="text-xs text-slate-500">필수 요건 보완 필요</p>
                    </div>
                  </>
                )}
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {analysis.match_score.requirement_comment}
              </p>
            </div>

            {/* Tech Stack Match */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase">
                기술 스택 매칭률
              </span>
              <div className="my-2 flex items-baseline gap-1.5">
                <span className="text-4xl font-extrabold text-slate-900 tabular-nums">
                  {analysis.match_score.tech_stack_score}
                </span>
                <span className="text-sm font-semibold text-slate-400">/ 100</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {analysis.match_score.tech_stack_comment}
              </p>
            </div>

            {/* Manufacturing Domain Fit */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase">
                제조 도메인 적합도 (OT/IT)
              </span>
              <div className="my-2 flex items-baseline gap-1.5">
                <span className="text-4xl font-extrabold text-amber-600 tabular-nums">
                  {analysis.match_score.domain_fit_score}
                </span>
                <span className="text-sm font-semibold text-slate-400">/ 100</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {analysis.match_score.domain_fit_comment}
              </p>
            </div>
          </div>

          {/* Job Profile & Purdue Level Meta Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h4 className="text-xl font-bold text-slate-900">{analysis.target_role}</h4>
                <p className="text-xs text-blue-700 font-semibold mt-1">
                  공정 유형: {analysis.manufacturing_type}
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {analysis.purdue_focus_levels?.map((lvl, idx) => (
                  <span
                    key={idx}
                    className="text-xs px-2.5 py-1 rounded-lg font-medium bg-slate-100 text-slate-700 border border-slate-200"
                  >
                    {lvl}
                  </span>
                ))}
              </div>
            </div>

            {/* Required vs Preferred Skills */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 sm:p-5 rounded-xl border border-slate-200">
                <span className="text-xs font-bold text-rose-700 flex items-center gap-1.5 mb-2.5">
                  <CheckCircle2 className="w-4 h-4 text-rose-600" />
                  필수 지원 자격 요건 (Must-Have)
                </span>
                <ul className="space-y-1.5 text-xs sm:text-sm text-slate-700">
                  {analysis.required_skills.map((s, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-rose-600 font-bold">•</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-slate-50 p-4 sm:p-5 rounded-xl border border-slate-200">
                <span className="text-xs font-bold text-blue-700 flex items-center gap-1.5 mb-2.5">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  우대 사항 및 차별화 요건 (Nice-to-Have)
                </span>
                <ul className="space-y-1.5 text-xs sm:text-sm text-slate-700">
                  {analysis.preferred_skills.map((s, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-blue-600 font-bold">•</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Technical Stack Breakdown Tags */}
            {analysis.technical_stack && (
              <div className="pt-3 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <span className="text-xs font-semibold text-slate-500">Languages</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {analysis.technical_stack.languages?.map((t, i) => (
                      <span key={i} className="text-xs px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-800 font-mono">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-500">AI / Frameworks</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {analysis.technical_stack.frameworks_ai?.map((t, i) => (
                      <span key={i} className="text-xs px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-800 font-mono">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-500">Protocols &amp; DB</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {analysis.technical_stack.protocols_db?.map((t, i) => (
                      <span key={i} className="text-xs px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-800 font-mono">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-500">Automation Tools</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {analysis.technical_stack.automation_tools?.map((t, i) => (
                      <span key={i} className="text-xs px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-mono">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Radar Domain Bars & Critical Gaps */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Domain Competency Bars */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-blue-600" />
                <span>제조 6대 핵심 역량 레이더 진단</span>
              </h4>
              <div className="space-y-3.5">
                {analysis.radar_metrics?.map((metric, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className="text-slate-700 font-medium">{metric.subject}</span>
                      <span className="font-bold text-slate-900 tabular-nums">{metric.score}점</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          metric.score >= 80
                            ? 'bg-emerald-600'
                            : metric.score >= 70
                            ? 'bg-blue-600'
                            : 'bg-amber-500'
                        }`}
                        style={{ width: `${metric.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Critical Gaps & Appeal Points */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4 flex flex-col justify-between">
              {/* Critical Gaps */}
              {analysis.critical_gaps && analysis.critical_gaps.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-rose-700 flex items-center gap-1.5 uppercase">
                    <ShieldAlert className="w-4 h-4 text-rose-600" />
                    <span>수석 면접관 지적: 보완해야 할 치명적 빈틈 (Critical Gaps)</span>
                  </h4>
                  <ul className="space-y-2 bg-rose-50/60 p-4 rounded-xl border border-rose-200 text-xs sm:text-sm text-rose-950">
                    {analysis.critical_gaps.map((gap, i) => (
                      <li key={i} className="flex items-start gap-1.5 leading-relaxed">
                        <span className="text-rose-600 font-bold shrink-0">⚠️</span>
                        <span>{gap}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Appeal Points */}
              {analysis.recommended_appeal_points && analysis.recommended_appeal_points.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <h4 className="text-xs font-bold text-blue-700 flex items-center gap-1.5 uppercase">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                    <span>면접/서류 집중 공략 추천 어필 포인트</span>
                  </h4>
                  <ul className="space-y-2 bg-blue-50/60 p-4 rounded-xl border border-blue-200 text-xs sm:text-sm text-blue-950">
                    {analysis.recommended_appeal_points.map((pt, i) => (
                      <li key={i} className="flex items-start gap-1.5 leading-relaxed">
                        <span className="text-blue-600 font-bold shrink-0">✓</span>
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
