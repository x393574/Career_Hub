import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  Copy, 
  Play, 
  Square, 
  Clock, 
  RotateCcw,
  Zap,
  AlertCircle
} from 'lucide-react';
import { AxTrendResponse } from '../types/manufacturing';

export const AxTrendBrief: React.FC = () => {
  const [targetCompany, setTargetCompany] = useState<string>('현대자동차 / 삼성전자 DS');
  const [industrySector, setIndustrySector] = useState<string>('자동차 조립 / 반도체 팹');
  const [projectSummary, setProjectSummary] = useState<string>('회전 모터 진동 FFT 주파수 분석 및 1D-CNN 결함 분류 파이프라인');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const pitchRef = useRef<HTMLDivElement>(null);

  const [trendData, setTrendData] = useState<AxTrendResponse>({
    industry_trends: [
      {
        trend_name: '자율제조 AX (Autonomous Manufacturing & Industrial AI Agent)',
        core_content: '단순 모니터링 대시보드를 넘어, 설비 센서 이상 감지 시 작업자 개입 없이 PLC 제어 파라미터를 역보정하는 폐루프(Closed-loop) APC 체계로 진화.',
        plant_application: '공정 산포(Cpk) 극대화 및 미세 공정 드리프트 실시간 자동 보정'
      },
      {
        trend_name: '시계열 예지보전 4.0 (PdM - ISO 13374 표준 기반)',
        core_content: '진동, 모터 전류(MCSA), 온도를 결합한 다변량 센서 융합과 잔여 유효 수명(RUL, Remaining Useful Life) 예측을 통한 사전 계획 정비.',
        plant_application: '핵심 회전체/베어링 돌발 셧다운 제로화 및 설비종합효율(OEE) 15% 개선'
      },
      {
        trend_name: '디지털 트윈 & 가상 시운전 (Virtual Commissioning)',
        core_content: '물리적 라인을 실제 설치하기 전 3D 가상 환경(Siemens Process Simulate 등)에서 가상 PLC 래더 로직과 로봇 기구학 동작, 물류 병목을 100% 사전 검증.',
        plant_application: '신규 차종/신제품 라인 램프업(Ramp-up) 기간 30~50% 획기적 단축'
      }
    ],
    one_minute_pitch: {
      title: '설비 센서 파이프라인과 Takt Time 이해도를 결합한 1분 자기소개',
      script: '안녕하십니까, 귀사의 스마트팩토리 생산기술 직무에 지원한 엔지니어 OOO입니다. 저는 학부 캡스톤 프로젝트에서 1kHz로 수집되는 원시 진동 센서의 전기적 노이즈를 버터워스 필터로 정제하고, 512-point FFT 주파수 변환을 거쳐 18ms의 초저지연으로 베어링 이상을 실시간 판별하는 엣지 파이프라인을 구축했습니다. 특히 소프트웨어 모델링에 그치지 않고, 공장 현장의 설비 회전 주기(33ms)를 충족시키기 위해 링 버퍼 기반의 비동기 큐잉 구조를 설계했습니다. 입사 후 귀사 첨단 제조 라인의 센서 데이터를 실시간 안정화하여, 설비 돌발 셧다운을 사전에 차단하고 직행율(FTY)을 극대화하는 융합형 제조 엔지니어가 되겠습니다.',
      highlight_keywords: ['18ms 초저지연', 'FFT 주파수 변환', '링 버퍼 비동기 큐', '직행율(FTY) 극대화'],
      delivery_tips: '첫 문장에서 두괄식으로 수치화된 지연시간(18ms)과 주파수 변환 기술을 명확히 발음하고, 마지막 문장에서 지원하는 라인의 설비 셧다운 방지와 FTY를 힘찬 어조로 연결하십시오.'
    }
  });

  const [copied, setCopied] = useState<boolean>(false);
  const [timerSeconds, setTimerSeconds] = useState<number>(60);
  const [timerActive, setTimerActive] = useState<boolean>(false);

  useEffect(() => {
    if (!timerActive) return;
    const interval = setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev <= 1) {
          setTimerActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timerActive]);

  const handleGenerate = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/gemini/ax-trend-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetCompany,
          industrySector,
          projectSummary,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '스피치 대본 생성에 실패했습니다.');
      if (!data || !data.one_minute_pitch) {
        throw new Error('유효한 트렌드/스피치 데이터를 받지 못했습니다.');
      }
      setTrendData(data);
      const now = new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setStatusMsg(`"${targetCompany} (${industrySector})" 및 내 프로젝트 반영 1분 스피치 업데이트 완료 (${now})`);
      setTimeout(() => {
        pitchRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || '트렌드 및 스피치 생성 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const copyScript = () => {
    if (!trendData?.one_minute_pitch?.script) return;
    navigator.clipboard.writeText(trendData.one_minute_pitch.script);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                MODULE 6
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                산업 AX 트렌드 브리프 &amp; 1분 맞춤 실전 스피치
              </h2>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed max-w-3xl">
              아래에 목표 기업, 산업 분야/라인, 내 프로젝트 핵심 기술을 입력하고 <strong>1분 스피치 대본 업데이트</strong> 버튼을 누르면, 해당 산업의 AX 트렌드 3가지와 내 경험을 엮은 맞춤형 1분 스피치 대본이 즉시 생성됩니다.
            </p>
          </div>
        </div>

        {/* Inputs */}
        <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-600">대상 기업</label>
            <input
              type="text"
              value={targetCompany}
              onChange={(e) => setTargetCompany(e.target.value)}
              placeholder="예: LG에너지솔루션, 포스코, SK하이닉스"
              className="w-full mt-1 p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs sm:text-sm focus:outline-none focus:bg-white focus:border-blue-600 transition"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600">산업 분야 / 목표 라인</label>
            <input
              type="text"
              value={industrySector}
              onChange={(e) => setIndustrySector(e.target.value)}
              placeholder="예: 이차전지 전극 코팅, 열간 압연"
              className="w-full mt-1 p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs sm:text-sm focus:outline-none focus:bg-white focus:border-blue-600 transition"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600">내 프로젝트 핵심 기술</label>
            <input
              type="text"
              value={projectSummary}
              onChange={(e) => setProjectSummary(e.target.value)}
              placeholder="예: YOLOv8 표면 스크래치 비전 검출"
              className="w-full mt-1 p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs sm:text-sm focus:outline-none focus:bg-white focus:border-blue-600 transition"
            />
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={handleGenerate}
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm disabled:opacity-50 transition flex items-center gap-1.5 shadow-xs"
          >
            {loading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>내 입력사항 반영 트렌드 &amp; 스피치 생성 중...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>1분 스피치 대본 업데이트</span>
              </>
            )}
          </button>
        </div>

        {errorMsg && (
          <div className="mt-3 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs sm:text-sm text-rose-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {statusMsg && !errorMsg && (
          <div className="mt-3 px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{statusMsg}</span>
          </div>
        )}
      </div>

      {/* 3 Major AX Trend Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {trendData.industry_trends?.map((trend, idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                  0{idx + 1}
                </span>
                <h3 className="text-sm font-bold text-slate-900">
                  {trend.trend_name}
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                {trend.core_content}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 text-xs text-emerald-800 flex items-start gap-1.5">
              <Zap className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-emerald-900">공장 기대 효과: </span>
                <span>{trend.plant_application}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tailored 1-Minute Elevator Pitch Speech Section */}
      {trendData.one_minute_pitch && (
        <div ref={pitchRef} className="bg-white rounded-2xl border border-blue-200 p-6 sm:p-7 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <span className="text-xs font-semibold text-blue-700 uppercase">
                1-Minute Technical Elevator Pitch
              </span>
              <h3 className="text-lg font-bold text-slate-900 mt-1">
                {trendData.one_minute_pitch.title}
              </h3>
            </div>

            <div className="flex items-center gap-2">
              {/* Practice Timer */}
              <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
                <Clock className="w-4 h-4 text-slate-600" />
                <span className="font-mono text-xs font-bold text-slate-800 tabular-nums">
                  {timerSeconds}초 발화 연습
                </span>
                <button
                  type="button"
                  onClick={() => setTimerActive(!timerActive)}
                  className="p-1 hover:text-blue-600 text-slate-600"
                >
                  {timerActive ? <Square className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                </button>
                <button
                  type="button"
                  onClick={() => { setTimerActive(false); setTimerSeconds(60); }}
                  className="p-1 hover:text-slate-900 text-slate-500"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
              </div>

              {/* Copy Button */}
              <button
                type="button"
                onClick={copyScript}
                className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition flex items-center gap-1.5 shadow-xs"
              >
                {copied ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                    <span>복사 완료!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>대본 복사</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Script Content */}
          <div className="bg-slate-50 p-5 sm:p-6 rounded-xl border border-slate-200 text-slate-900 text-sm sm:text-base leading-relaxed font-sans">
            "{trendData.one_minute_pitch.script}"
          </div>

          {/* Keywords & Delivery Tips */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5">
              <span className="text-xs font-bold text-slate-800 uppercase">
                핵심 전달 키워드 (Highlight Keywords)
              </span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {trendData.one_minute_pitch.highlight_keywords?.map((kw, i) => (
                  <span
                    key={i}
                    className="text-xs px-2.5 py-1 rounded-md bg-blue-100 text-blue-900 font-medium"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
              <span className="text-xs font-bold text-slate-800 uppercase">
                실전 전달 팁 (Delivery Coaching)
              </span>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                {trendData.one_minute_pitch.delivery_tips}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
