import React, { useState, useRef } from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  Copy, 
  FileText, 
  Mic, 
  RefreshCw, 
  ShieldCheck, 
  Edit3,
  AlertCircle
} from 'lucide-react';
import { SAMPLE_CANDIDATE_EXPERIENCES } from '../data/presetJobs';
import { BeiProbeQuestion, ExperienceSynthesis } from '../types/manufacturing';

export const BeiProbing: React.FC = () => {
  const [rawExperience, setRawExperience] = useState<string>(SAMPLE_CANDIDATE_EXPERIENCES[0].text);
  const [targetCompany, setTargetCompany] = useState<string>('삼성전자 DS / 현대자동차 스마트팩토리');
  const [loadingInitial, setLoadingInitial] = useState<boolean>(false);
  const [loadingResynth, setLoadingResynth] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [statusBanner, setStatusBanner] = useState<string | null>(null);

  const step2Ref = useRef<HTMLDivElement>(null);
  const step3Ref = useRef<HTMLDivElement>(null);

  // Probing State
  const [probingActive, setProbingActive] = useState<boolean>(true);
  const [probeQuestions, setProbeQuestions] = useState<BeiProbeQuestion[]>([
    {
      id: 1,
      category: '개인 기여도 및 독자 설계 검증',
      question: '팀 전체 성과 외에 본인이 직접 설계하고 작성한 핵심 알고리즘이나 센서 데이터 수집 파이프라인 코드는 무엇입니까?',
      reason: '면접관은 팀 버스 탑승 여부와 지원자의 실질적 코딩/아키텍처 설계 깊이를 검증합니다.',
      suggested_placeholder: '예: 저는 ADXL345 센서의 I2C 통신 드라이버 구현 및 SciPy 기반 512-point FFT 주파수 변환 파이프라인, 1D CNN 모델 설계를 전담했습니다.'
    },
    {
      id: 2,
      category: '제조 데이터 실무 특성 검증',
      question: '공장 데이터의 특성인 극심한 불균형(정상 99% 이상), 결측치, 센서 노이즈(전기적 노이즈, 기계적 진동)를 어떻게 처리했습니까?',
      reason: '실제 플랜트 데이터의 거친 노이즈와 희귀 불량 처리 경험을 확인합니다.',
      suggested_placeholder: '예: 고주파 기계 노이즈를 500Hz 대역 버터워스 로우패스 필터로 감쇠시켰고, 정상 95% 대비 결함 5% 불균형은 SMOTE와 Focal Loss로 해결했습니다.'
    },
    {
      id: 3,
      category: '현장 제약조건 및 Takt Time 검증',
      question: '본인 모델/소프트웨어의 추론 및 처리 지연 시간(Latency)은 얼마였으며, 공장의 실시간 제어 요구조건(Takt Time/Cycle Time)을 만족했습니까?',
      reason: '소프트웨어 수준에 머물지 않고 실제 생산 라인 제약(Takt Time)을 인지하는지 검증합니다.',
      suggested_placeholder: '예: 512샘플 윈도우 FFT 변환과 1D CNN 추론까지 라즈베리파이 4 Edge 환경에서 평균 18ms를 기록하여 모터 1회전 주기(33ms) 내 실시간 판정을 만족했습니다.'
    }
  ]);

  const [answers, setAnswers] = useState<Record<number, string>>({
    1: '팀원들은 대시보드 UI를 맡았고, 저는 ADXL345 센서의 I2C 통신 드라이버 구현 및 SciPy 기반 512-point FFT 주파수 변환 파이프라인, 그리고 1D CNN 모델의 레이어 아키텍처를 전담 작성했습니다.',
    2: '초기 수집 시 발생한 고주파 기계 노이즈를 500Hz 대역 버터워스(Butterworth) 로우패스 필터로 감쇠시켰고, 정상 데이터 95% 대비 희귀 결함 5%의 불균형을 극복하기 위해 SMOTE 증강과 Focal Loss 손실 함수를 적용했습니다.',
    3: '단위 512샘플 윈도우의 FFT 변환과 1D CNN 추론까지의 엔드투엔드 처리 지연시간은 라즈베리파이 4 Edge 환경에서 평균 18ms를 기록하여, 대상 모터의 1회전 주기(33ms, 1800 RPM 기준) 내 실시간 분류 조건을 만족했습니다.'
  });

  const [synthesis, setSynthesis] = useState<ExperienceSynthesis | null>({
    project_title: '진동 가속도 주파수 스펙트럼 분석 기반 회전체 베어링 이상 조기 진단 엣지 시스템',
    key_technologies: ['ADXL345 센서', 'Butterworth LPF', 'FFT (Fast Fourier Transform)', '1D-CNN', 'Edge Latency 18ms', 'Focal Loss'],
    applied_points: [
      '지원자의 독자 기여(I2C 수집 드라이버 + 512-point FFT + 1D-CNN 아키텍처 설계) 반영',
      '현장 노이즈 제어(500Hz 버터워스 필터) 및 데이터 불균형 극복(SMOTE + Focal Loss) 반영',
      '모터 회전 주기(33ms) 대비 Edge 추론 지연시간(18ms) 실시간 Takt Time 충족 입증'
    ],
    star_resume: {
      situation: '회전 모터 설비의 베어링 마모는 공장 전체 라인의 돌발 셧다운을 유발하는 고질적 병목이었으나, 기존에는 오퍼레이터의 청음이나 주기적 정기 보전에 의존하여 이상 발생 전 조기 감지가 불가능했음.',
      task: '모터 진동 가속도 센서 데이터를 실시간 수집하여 정상 및 3종 베어링 결함을 1800 RPM 회전 주기(33ms) 이내의 저지연(Latency)으로 실시간 엣지 판정하는 예지보전(PdM) 파이프라인 구축.',
      action: 'I2C 프로토콜을 통해 1kHz로 수집되는 원시 진동 신호의 기계적 고주파 노이즈를 500Hz 버터워스 밴드패스 필터로 정제하고, 512-point FFT 변환을 적용하여 주파수 스펙트로그램 특징을 추출함. 95:5의 심각한 정상/결함 데이터 불균형을 극복하기 위해 Focal Loss 손실 함수를 적용한 1D CNN 아키텍처를 직접 설계 및 엣지 IPC에 포팅함.',
      result: '엣지 컴퓨팅 환경에서 엔드투엔드 추론 지연시간 18ms를 달성하여 설비 Takt Time을 완벽히 충족시켰으며, 베어링 4개 상태에 대해 94% 분류 정확도 및 [정량 수치 입력 필요: 예) 결함 조기 예지 시간 XX시간 확보]의 신뢰도를 입증함.'
    },
    prep_speech: {
      point: '저는 산업용 회전 설비에서 발생하는 진동 시계열 신호를 FFT 주파수 스펙트럼으로 변환하여, 18ms의 초저지연으로 베어링 결함을 실시간 진단하는 엣지 예지보전 파이프라인을 독자 구축했습니다.',
      reason: '시간 영역의 단순 진동 진폭(RMS)만으로는 초기 미세 결함을 구별하기 어려웠기에, 고유 결함 주파수 성분을 분리해내는 주파수 영역(FFT) 변환과 경량 1D CNN 융합 방법론을 채택했습니다.',
      example: '실제 모터 가동 중 전원 노이즈로 인한 이상 신호가 유입되는 문제가 발생했으나, 500Hz 버터워스 필터링 및 링 버퍼 기반의 이동 윈도우 정규화 로직을 직접 구현하여 신호 왜곡을 완전히 제거했습니다.',
      point_summary: '입사 후 귀사 첨단 제조 라인의 핵심 회전 설비(식각 펌프, 압연 롤러)에서 발생하는 센서 데이터를 실시간 정제하여, 돌발 라인 셧다운을 제로화하는 데 즉시 기여하겠습니다.'
    }
  });

  const [criticFeedback, setCriticFeedback] = useState<string>(
    '소프트웨어 코딩 수준을 넘어 설비 회전 주기(33ms)와 추론 지연시간(18ms)의 관계를 명확히 계산하여 공학적 설득력이 대단히 높습니다. 서류 제출 시 [정량 수치] 항목에 실제 검증된 수치를 보완하면 최상위권 평가를 받을 것입니다.'
  );

  const [activeOutputTab, setActiveOutputTab] = useState<'star' | 'prep'>('star');
  const [copiedType, setCopiedType] = useState<string | null>(null);

  const handleSelectSampleMemo = (sampleText: string) => {
    setRawExperience(sampleText);
    setAnswers({});
    setStatusBanner('새 샘플 메모가 선택되었습니다. "BEI 꼬리질문 도출 & STAR 변환" 버튼을 눌러 분석을 실행하세요.');
  };

  // STEP 1 Action: Analyze rawExperience and generate tailored BEI probing questions + initial STAR/PREP
  const handleAnalyzeMemo = async () => {
    if (!rawExperience.trim()) {
      setErrorMsg('STEP 1에 프로젝트 또는 경험 메모를 입력해주세요.');
      return;
    }
    setLoadingInitial(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/gemini/bei-probing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawExperience,
          targetCompany,
          mode: 'initial_probe',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'BEI 꼬리질문 및 초안 변환에 실패했습니다.');

      if (data.bei_probing_questions && Array.isArray(data.bei_probing_questions) && data.bei_probing_questions.length > 0) {
        setProbeQuestions(data.bei_probing_questions);
        const newDefaultAnswers: Record<number, string> = {};
        data.bei_probing_questions.forEach((q: BeiProbeQuestion) => {
          newDefaultAnswers[q.id] = q.suggested_placeholder ? q.suggested_placeholder.replace(/^예:\s*/, '') : '';
        });
        setAnswers(newDefaultAnswers);
      }
      if (data.experience_synthesis) {
        setSynthesis(data.experience_synthesis);
      }
      if (data.critic_feedback) {
        setCriticFeedback(data.critic_feedback);
      }
      setProbingActive(true);
      const now = new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setStatusBanner(`STEP 1 메모 분석 완료 (${now}) — 아래 STEP 2의 꼬리질문 답변을 수정한 뒤 "답변 반영하여 STAR / PREP 재합성"을 눌러보세요!`);
      setTimeout(() => {
        step2Ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'BEI 검증 분석 중 오류가 발생했습니다.');
    } finally {
      setLoadingInitial(false);
    }
  };

  // STEP 2 Action: Resynthesize STAR / PREP reflecting user's answers to BEI probing questions
  const handleResynthesizeWithAnswers = async () => {
    if (!rawExperience.trim()) {
      setErrorMsg('프로젝트 메모가 비어 있습니다.');
      return;
    }
    setLoadingResynth(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/gemini/bei-probing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawExperience,
          targetCompany,
          currentQuestions: probeQuestions,
          answeredProbes: answers,
          mode: 'resynthesize',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'STAR / PREP 재합성에 실패했습니다.');

      if (data.experience_synthesis) {
        setSynthesis(data.experience_synthesis);
      }
      if (data.critic_feedback) {
        setCriticFeedback(data.critic_feedback);
      }
      const now = new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setStatusBanner(`STEP 2 꼬리질문 답변 반영 STAR / PREP 심층 재합성 완료! (${now})`);
      setTimeout(() => {
        step3Ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || '재합성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setLoadingResynth(false);
    }
  };

  const copyContent = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                MODULE 4
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                BEI 심층 꼬리질문 검증 &amp; STAR / PREP 변환기
              </h2>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed max-w-3xl">
              단순 요약이 아닌, 수석 기술 면접관의 <strong>3대 BEI 검증(개인 기여도, 99% 데이터 불균형/노이즈, 현장 Takt Time/Latency)</strong>을 거쳐 
              서류용 <span className="font-semibold text-blue-700">STAR</span> 및 구두면접용 <span className="font-semibold text-emerald-700">PREP</span> 듀얼 포맷으로 완벽 변환합니다.
            </p>
          </div>
        </div>
      </div>

      {/* Global Status / Error */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs sm:text-sm text-rose-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {statusBanner && !errorMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs sm:text-sm font-semibold text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{statusBanner}</span>
        </div>
      )}

      {/* Step 1: Raw Project Input */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-blue-600" />
            <span>STEP 1: 학부 / 부트캠프 / 연구실 프로젝트 거친 메모 입력</span>
          </h3>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-slate-500">샘플 프로젝트 불러오기:</span>
            {SAMPLE_CANDIDATE_EXPERIENCES.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectSampleMemo(sample.text)}
                className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition"
              >
                {sample.title.split(' ')[0]} {sample.title.split(' ')[1]}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <textarea
              value={rawExperience}
              onChange={(e) => setRawExperience(e.target.value)}
              rows={6}
              placeholder="프로젝트 메모, 사용 센서 및 라이브러리, 진행한 과정 등을 자유롭게 적어주세요..."
              className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs sm:text-sm leading-relaxed focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition"
            />
          </div>
          <div className="space-y-3 flex flex-col justify-between">
            <div className="space-y-1.5">
              <label className="text-xs text-slate-600 font-semibold">목표 기업 / 직무 도메인</label>
              <input
                type="text"
                value={targetCompany}
                onChange={(e) => setTargetCompany(e.target.value)}
                placeholder="예: 삼성전자 DS / 현대차 생산기술 / LG엔솔"
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs sm:text-sm focus:outline-none focus:bg-white focus:border-blue-600 transition"
              />
              <p className="text-[11px] text-slate-500 leading-normal pt-1">
                메모와 목표 기업을 입력하고 아래 버튼을 누르면 내 프로젝트에 맞춘 3대 BEI 꼬리질문과 초안이 생성됩니다.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAnalyzeMemo}
              disabled={loadingInitial || loadingResynth || !rawExperience.trim()}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm disabled:opacity-50 transition flex items-center justify-center gap-2 shadow-xs"
            >
              {loadingInitial ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>내 메모 분석 및 꼬리질문 도출 중...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>BEI 꼬리질문 도출 &amp; STAR 변환</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Step 2: Interactive BEI Probing Questionnaire */}
      {probingActive && (
        <div ref={step2Ref} className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 font-bold text-xs flex items-center justify-center border border-blue-200">
                BEI
              </span>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  STEP 2: 수석 면접관의 3대 현장 검증 꼬리질문 (Probing Drill)
                </h3>
                <p className="text-xs text-slate-500">
                  각 질문에 대한 본인의 구체적 답변(수치, 알고리즘, 지연시간 등)을 작성한 뒤 하단 <strong>답변 반영하여 STAR / PREP 재합성</strong> 버튼을 누르세요.
                </p>
              </div>
            </div>
            <span className="text-xs text-blue-700 font-semibold bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200 self-start sm:self-auto shrink-0">
              답변 입력 후 재합성 가능
            </span>
          </div>

          <div className="space-y-4">
            {probeQuestions.map((q) => (
              <div key={q.id} className="bg-slate-50 rounded-xl p-4 sm:p-5 border border-slate-200 space-y-2.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="text-xs font-bold text-blue-800 bg-blue-100/70 px-2.5 py-0.5 rounded-md inline-block">
                    0{q.id}. {q.category}
                  </span>
                  <span className="text-xs text-slate-500 italic">
                    평가 의도: {q.reason}
                  </span>
                </div>

                <p className="text-sm font-bold text-slate-900 leading-snug">
                  {q.question}
                </p>

                <textarea
                  value={answers[q.id] || ''}
                  onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                  rows={2}
                  placeholder={q.suggested_placeholder || '이 꼬리질문에 대한 본인의 구체적 기술/수치 답변을 입력하세요...'}
                  className="w-full p-3 rounded-lg bg-white border border-slate-300 text-slate-800 text-xs sm:text-sm font-sans leading-relaxed focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-100 transition"
                />
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <p className="text-xs text-slate-500">
              💡 위 3개 답변에 적은 구체적인 역할, 전처리 기법, 지연시간(ms/FPS)이 아래 STEP 3의 STAR 자소서와 PREP 면접 대본에 직접 반영됩니다.
            </p>
            <button
              type="button"
              onClick={handleResynthesizeWithAnswers}
              disabled={loadingResynth || loadingInitial}
              className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold disabled:opacity-50 transition flex items-center gap-2 shadow-xs shrink-0"
            >
              {loadingResynth ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>내 꼬리질문 답변 반영하여 재합성 중...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  <span>답변 반영하여 STAR / PREP 재합성</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Synthesis Output (STAR & PREP) */}
      {synthesis && (
        <div ref={step3Ref} className="space-y-5">
          {/* Project Title Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <span className="text-xs font-semibold text-blue-700 uppercase">
                  STEP 3 · 공학적 현장 관점으로 재정의된 프로젝트 결과물
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">
                  {synthesis.project_title}
                </h3>
              </div>

              {/* Format Toggle Buttons */}
              <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200 self-start sm:self-auto shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveOutputTab('star')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                    activeOutputTab === 'star'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>STAR 서류/자소서</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveOutputTab('prep')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                    activeOutputTab === 'prep'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>PREP 1분 구두면접</span>
                </button>
              </div>
            </div>

            {/* Applied Points from User Input / Answers */}
            {synthesis.applied_points && synthesis.applied_points.length > 0 && (
              <div className="bg-blue-50/70 p-4 rounded-xl border border-blue-200 space-y-1.5">
                <span className="text-xs font-bold text-blue-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  내 입력 메모 &amp; 꼬리질문 답변 핵심 반영 내역
                </span>
                <ul className="space-y-1 text-xs text-blue-950">
                  {synthesis.applied_points.map((pt, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-blue-600 font-bold">•</span>
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Tech Tags */}
            {synthesis.key_technologies && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {synthesis.key_technologies.map((t, idx) => (
                  <span
                    key={idx}
                    className="text-xs px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-medium"
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* TAB CONTENT: STAR Format */}
          {activeOutputTab === 'star' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
                <div>
                  <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <span>STAR 포맷 (서류 및 자기소개서 작성용)</span>
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    공장 라인 배경, 물리 제약조건, 정량적 처리 성과로 무장된 엔지니어링 서식입니다.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => copyContent(
                    `[Situation]\n${synthesis.star_resume.situation}\n\n[Task]\n${synthesis.star_resume.task}\n\n[Action]\n${synthesis.star_resume.action}\n\n[Result]\n${synthesis.star_resume.result}`,
                    'star'
                  )}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition flex items-center gap-1.5 self-start sm:self-auto"
                >
                  {copiedType === 'star' ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>복사 완료!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>STAR 전체 복사</span>
                    </>
                  )}
                </button>
              </div>

              <div className="space-y-3">
                {/* Situation */}
                <div className="bg-slate-50 p-4 sm:p-5 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-xs font-bold text-slate-700 block">
                    S · Situation (공정 현장 배경 및 병목 문제)
                  </span>
                  <p className="text-sm text-slate-800 leading-relaxed pt-1">
                    {synthesis.star_resume.situation}
                  </p>
                </div>

                {/* Task */}
                <div className="bg-slate-50 p-4 sm:p-5 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-xs font-bold text-blue-700 block">
                    T · Task (엔지니어링 목표 및 물리 제약조건)
                  </span>
                  <p className="text-sm text-slate-800 leading-relaxed pt-1">
                    {synthesis.star_resume.task}
                  </p>
                </div>

                {/* Action */}
                <div className="bg-slate-50 p-4 sm:p-5 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-xs font-bold text-slate-900 block">
                    A · Action (지원자가 직접 수행한 기술적 액션)
                  </span>
                  <p className="text-sm text-slate-800 leading-relaxed pt-1">
                    {synthesis.star_resume.action}
                  </p>
                </div>

                {/* Result */}
                <div className="bg-slate-50 p-4 sm:p-5 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-xs font-bold text-emerald-800 block">
                    R · Result (정량적 성과 및 지연시간)
                  </span>
                  <p className="text-sm text-slate-800 leading-relaxed pt-1">
                    {synthesis.star_resume.result}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB CONTENT: PREP Format */}
          {activeOutputTab === 'prep' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
                <div>
                  <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Mic className="w-5 h-5 text-emerald-600" />
                    <span>PREP 포맷 (실전 면접 1분 구두 답변용)</span>
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    두괄식 결론(Point)으로 면접관의 집중을 유도하고 공학적 이유와 현장 기여로 마무리합니다.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => copyContent(
                    `[Point - 결론]\n${synthesis.prep_speech.point}\n\n[Reason - 공학적 이유]\n${synthesis.prep_speech.reason}\n\n[Example - 실무 극복 사례]\n${synthesis.prep_speech.example}\n\n[Point - 기여 방안]\n${synthesis.prep_speech.point_summary}`,
                    'prep'
                  )}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition flex items-center gap-1.5 self-start sm:self-auto"
                >
                  {copiedType === 'prep' ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>복사 완료!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>PREP 전체 복사</span>
                    </>
                  )}
                </button>
              </div>

              <div className="space-y-3">
                {/* Point 1 */}
                <div className="bg-slate-50 p-4 sm:p-5 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-xs font-bold text-blue-700 block">
                    P · Point (두괄식 기술적 결론 &amp; 성과 요약)
                  </span>
                  <p className="text-sm text-slate-900 font-semibold leading-relaxed pt-1">
                    "{synthesis.prep_speech.point}"
                  </p>
                </div>

                {/* Reason */}
                <div className="bg-slate-50 p-4 sm:p-5 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-xs font-bold text-slate-700 block">
                    R · Reason (해당 방법론/알고리즘을 채택한 공학적 이유)
                  </span>
                  <p className="text-sm text-slate-800 leading-relaxed pt-1">
                    "{synthesis.prep_speech.reason}"
                  </p>
                </div>

                {/* Example */}
                <div className="bg-slate-50 p-4 sm:p-5 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-xs font-bold text-slate-700 block">
                    E · Example (실제 데이터 처리 중 발생한 예외 상황 극복 사례)
                  </span>
                  <p className="text-sm text-slate-800 leading-relaxed pt-1">
                    "{synthesis.prep_speech.example}"
                  </p>
                </div>

                {/* Point Summary */}
                <div className="bg-slate-50 p-4 sm:p-5 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-xs font-bold text-emerald-800 block">
                    P · Point (공장 라인 생산성/FTY 향상 기여 방안)
                  </span>
                  <p className="text-sm text-slate-900 font-semibold leading-relaxed pt-1">
                    "{synthesis.prep_speech.point_summary}"
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Senior Architect Critique */}
          {criticFeedback && (
            <div className="bg-slate-50 rounded-2xl border border-blue-200 p-5 sm:p-6 shadow-xs space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-800 uppercase">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>수석 기술 면접관의 최종 피드백 &amp; 보완 지침</span>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed">
                {criticFeedback}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
