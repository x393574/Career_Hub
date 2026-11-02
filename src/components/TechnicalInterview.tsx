import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Play, 
  Square, 
  RotateCcw, 
  ShieldAlert, 
  BookOpen, 
  Award
} from 'lucide-react';
import { InterviewQuestionItem, MockInterviewEval } from '../types/manufacturing';

interface TechnicalInterviewProps {
  initialCompany?: string;
  initialRole?: string;
}

export const TechnicalInterview: React.FC<TechnicalInterviewProps> = ({ 
  initialCompany = '삼성전자 DS / 현대자동차 생산기술',
  initialRole = '제조DX / 생산기술 / 스마트팩토리 엔지니어'
}) => {
  const [targetCompany, setTargetCompany] = useState<string>(initialCompany);
  const [targetRole, setTargetRole] = useState<string>(initialRole);
  const [techStack, setTechStack] = useState<string>('Python, C#, OPC-UA, PyTorch, Edge IPC, PLC 연동');
  const [projectBrief, setProjectBrief] = useState<string>('진동 가속도 센서 FFT 변환 및 1D-CNN 베어링 결함 분류 파이프라인');
  const [loadingQuestions, setLoadingQuestions] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const evalResultRef = useRef<HTMLDivElement>(null);

  // Questions State
  const [questions, setQuestions] = useState<InterviewQuestionItem[]>([
    {
      tier: 'Tier 1 (설비 데이터/인프라)',
      topic: 'PLC-PC 산업용 프로토콜 및 데이터 버퍼링',
      question: 'PLC와 Edge IPC 간 OPC-UA/Modbus 통신 시 현장 전자기 노이즈나 일시적 통신 단절이 발생할 경우, 실시간 센서 데이터 유실을 방지하고 시계열 정합성을 보장하기 위해 버퍼링과 재연결 로직을 어떻게 설계하겠습니까?',
      intent: 'Level 1~2 OT/IT 통신 인프라 이해도 및 현장 네트워크 단절 시 장애 복구 설계 역량 평가',
      key_keywords: ['Ring Buffer / Circular Queue', 'Heartbeat & Keep-Alive', 'Time Synchronization (NTP/PTP)']
    },
    {
      tier: 'Tier 2 (모델링 및 현장 적용)',
      topic: '비대칭 비용 매트릭스와 셧다운 방지 임계치 설계',
      question: '공장에서는 오탐(False Positive)으로 인해 멀쩡한 라인이 멈추는 셧다운 비용과 미탐(False Negative)으로 불량이 후공정으로 유출되는 비용이 비대칭적입니다. 모델의 Decision Threshold를 설정할 때 생산성과 품질 리스크 간의 Trade-off를 공학적으로 어떻게 계산하고 적용하겠습니까?',
      intent: '비즈니스 및 공장 생산 비용 함수와 연계된 실전 임계치 설계 및 F-beta 가중치 이해도 평가',
      key_keywords: ['Cost-Sensitive Learning', 'Precision-Recall Curve (PR-AUC)', 'F-beta Score (Beta 가중치)']
    },
    {
      tier: 'Tier 3 (BEI 프로젝트 압박)',
      topic: '현장 물리 제약 및 추론 Takt Time 병목',
      question: '지원자가 설계한 모델이나 파이프라인의 엔드투엔드 처리 시간이 현장 설비의 Takt Time(예: 0.8초당 1개 부품 통과)보다 길어질 경우, 하드웨어 스펙을 무작정 올리는 것 외에 모델 경량화나 파이프라인 구조 변경을 통해 어떻게 지연시간을 단축할 것입니까?',
      intent: 'Edge 배포 최적화, TensorRT/ONNX 양자화, 비동기 큐잉(Async Pipeline) 설계 역량 평가',
      key_keywords: ['TensorRT / INT8 Quantization', 'Multi-threading / Async Queue', 'Takt Time vs Inference Latency']
    }
  ]);

  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const activeQuestion = questions[selectedIndex];

  // Mock Interview Simulator State
  const [answerText, setAnswerText] = useState<string>('');
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [timerSeconds, setTimerSeconds] = useState<number>(90);
  const [timerActive, setTimerActive] = useState<boolean>(false);
  const timerRef = useRef<any>(null);

  // Evaluation State
  const [evaluating, setEvaluating] = useState<boolean>(false);
  const [evalResult, setEvalResult] = useState<MockInterviewEval | null>(null);

  // Web Speech API
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    setTargetCompany(initialCompany);
    setTargetRole(initialRole);
  }, [initialCompany, initialRole]);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'ko-KR';

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        setAnswerText((prev) => prev ? `${prev} ${transcript}` : transcript);
      };

      recognition.onerror = (e: any) => {
        console.warn('Speech recognition error:', e);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  // Timer logic
  useEffect(() => {
    if (timerActive) {
      timerRef.current = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setTimerActive(false);
            if (isRecording && recognitionRef.current) {
              recognitionRef.current.stop();
              setIsRecording(false);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [timerActive, isRecording]);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      setErrorMsg('현재 브라우저에서 실시간 음성 인식을 지원하지 않습니다. 아래 입력창에 텍스트로 직접 답변을 작성해주세요.');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
        if (!timerActive) {
          setTimerActive(true);
        }
      } catch (err) {
        console.warn(err);
      }
    }
  };

  const handleResetTimer = () => {
    setTimerActive(false);
    setTimerSeconds(90);
    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleGenerateQuestions = async () => {
    setLoadingQuestions(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/gemini/interview-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetCompany,
          targetRole,
          techStack,
          projectBrief,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '면접 문항 생성에 실패했습니다.');
      if (data.questions && Array.isArray(data.questions) && data.questions.length > 0) {
        setQuestions(data.questions);
        setSelectedIndex(0);
        setEvalResult(null);
        setAnswerText('');
        const now = new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setStatusMsg(`"${targetCompany} - ${targetRole}" 맞춤 3계층 기술 면접 문항 도출 완료 (${now})`);
      } else {
        throw new Error('면접 문항 데이터를 생성하지 못했습니다. 다시 시도해주세요.');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || '면접 문항 생성 중 오류가 발생했습니다.');
    } finally {
      setLoadingQuestions(false);
    }
  };

  const handleEvaluateAnswer = async () => {
    if (!answerText.trim() || !activeQuestion) {
      setErrorMsg('채점할 면접 답변을 입력해주세요.');
      return;
    }
    setEvaluating(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/gemini/mock-interview-eval', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: activeQuestion.question,
          candidateAnswer: answerText,
          tier: activeQuestion.tier,
          keyKeywords: activeQuestion.key_keywords,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '답변 채점에 실패했습니다.');
      setEvalResult(data);
      const now = new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setStatusMsg(`작성하신 답변에 대한 수석 면접관 정밀 채점 완료 (${now})`);
      setTimeout(() => {
        evalResultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || '답변 평가 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setEvaluating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                MODULE 5
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                도메인 융합형 기술 면접 &amp; 실전 모의면접 시뮬레이터
              </h2>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed max-w-3xl">
              아래에 본인의 <strong>대상 기업, 지원 직무, 기술 스택, 프로젝트 요약</strong>을 입력하고 <strong>새 면접 문항 도출</strong>을 누르면, 내 이력과 목표 공정을 결합한 3계층 압박 면접 문항이 생성됩니다.
            </p>
          </div>
        </div>

        {/* Target Profile Controls */}
        <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-600">대상 기업 / 사업장</label>
            <input
              type="text"
              value={targetCompany}
              onChange={(e) => setTargetCompany(e.target.value)}
              placeholder="예: 삼성전자 평택 P3, 현대차 울산"
              className="w-full mt-1 p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs sm:text-sm focus:outline-none focus:bg-white focus:border-blue-600 transition"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600">지원 직무</label>
            <input
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="예: 제조DX / 스마트팩토리 / 공정제어"
              className="w-full mt-1 p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs sm:text-sm focus:outline-none focus:bg-white focus:border-blue-600 transition"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600">보유 기술 스택</label>
            <input
              type="text"
              value={techStack}
              onChange={(e) => setTechStack(e.target.value)}
              placeholder="예: Python, PLC, OPC-UA, YOLOv8"
              className="w-full mt-1 p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs sm:text-sm focus:outline-none focus:bg-white focus:border-blue-600 transition"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600">내 프로젝트 핵심 요약</label>
            <input
              type="text"
              value={projectBrief}
              onChange={(e) => setProjectBrief(e.target.value)}
              placeholder="예: 모터 진동 FFT 베어링 이상 탐지"
              className="w-full mt-1 p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs sm:text-sm focus:outline-none focus:bg-white focus:border-blue-600 transition"
            />
          </div>
        </div>

        <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            💡 입력한 기업 공정과 내 프로젝트 기술을 결합하여 Tier 1(인프라) · Tier 2(모델링/임계치) · Tier 3(BEI 압박) 질문을 생성합니다.
          </div>
          <button
            type="button"
            onClick={handleGenerateQuestions}
            disabled={loadingQuestions}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm disabled:opacity-50 transition flex items-center justify-center gap-1.5 shadow-xs shrink-0"
          >
            {loadingQuestions ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>맞춤 면접 문항 생성 중...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-white" />
                <span>새 면접 문항 도출</span>
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

      {/* 3 Tier Questions Selector Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {questions.map((q, idx) => {
          const isSelected = selectedIndex === idx;
          return (
            <div
              key={idx}
              onClick={() => {
                setSelectedIndex(idx);
                setEvalResult(null);
                setAnswerText('');
              }}
              className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-blue-50/70 border-blue-500 shadow-xs ring-1 ring-blue-500'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-md ${
                    idx === 0 
                      ? 'bg-sky-100 text-sky-800' 
                      : idx === 1 
                      ? 'bg-amber-100 text-amber-800' 
                      : 'bg-rose-100 text-rose-800'
                  }`}>
                    {q.tier}
                  </span>
                  {isSelected && <span className="text-xs text-blue-700 font-bold">선택됨 ✓</span>}
                </div>
                <h4 className="text-sm font-bold text-slate-900 line-clamp-3 leading-snug">
                  {q.question}
                </h4>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200/80 space-y-2">
                <p className="text-xs text-slate-500 line-clamp-1 italic">
                  💡 평가 의도: {q.intent}
                </p>
                <div className="flex flex-wrap gap-1">
                  {q.key_keywords.map((kw, i) => (
                    <span key={i} className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Mock Interview Session Card */}
      {activeQuestion && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-5">
          {/* Question Header & Mandatory Keywords */}
          <div className="space-y-3 pb-4 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
                실전 모의 면접 질의 ({activeQuestion.tier})
              </span>
              <span className="text-xs text-slate-500 font-medium">
                권장 답변 시간: <strong className="text-slate-800">60초 ~ 90초</strong>
              </span>
            </div>

            <h3 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
              "{activeQuestion.question}"
            </h3>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-700">
                <BookOpen className="w-4 h-4 text-blue-600 shrink-0" />
                <span>면접관 평가 의도: <strong className="font-semibold text-slate-900">{activeQuestion.intent}</strong></span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                <span className="text-xs font-bold text-slate-700">필수 키워드:</span>
                <div className="flex flex-wrap gap-1">
                  {activeQuestion.key_keywords.map((kw, i) => (
                    <span key={i} className="text-xs px-2.5 py-0.5 rounded-md bg-blue-100 text-blue-800 font-medium">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Answer Box with Timer and Voice STT */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {/* Voice Record Button */}
                <button
                  type="button"
                  onClick={toggleRecording}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center gap-2 ${
                    isRecording
                      ? 'bg-rose-600 text-white animate-pulse shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200'
                  }`}
                >
                  {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-rose-600" />}
                  <span>{isRecording ? '음성 녹음 중지' : '실시간 음성 답변 (STT)'}</span>
                </button>

                {/* Timer Controls */}
                <div className="flex items-center gap-2 bg-slate-100 px-3.5 py-1.5 rounded-xl border border-slate-200">
                  <Clock className="w-4 h-4 text-slate-600" />
                  <span className={`font-mono text-sm font-bold tabular-nums ${
                    timerSeconds <= 15 ? 'text-rose-600 animate-pulse' : 'text-slate-800'
                  }`}>
                    {Math.floor(timerSeconds / 60)}:{(timerSeconds % 60).toString().padStart(2, '0')}
                  </span>
                  <button
                    type="button"
                    onClick={() => setTimerActive(!timerActive)}
                    className="p-1 hover:text-blue-600 text-slate-600"
                    title={timerActive ? '일시 정지' : '타이머 시작'}
                  >
                    {timerActive ? <Square className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    type="button"
                    onClick={handleResetTimer}
                    className="p-1 hover:text-slate-900 text-slate-500"
                    title="타이머 리셋"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Sample Answer auto-fill helper */}
              <button
                type="button"
                onClick={() => setAnswerText(
                  `해당 질문(${activeQuestion.topic || activeQuestion.tier})에 대해 답변드리겠습니다. 저는 현장에서 ${activeQuestion.key_keywords.join(', ')} 기법을 결합하여 문제를 해결하겠습니다. 먼저 실시간 데이터 수집 및 추론 과정에서 발생할 수 있는 지연을 방지하기 위해 비동기 버퍼링 구조를 적용하고, 공정 Takt Time 및 오탐/미탐 비용 제약을 만족하도록 임계치를 최적화하여 라인 가동률(OEE)과 직행율(FTY)을 동시에 확보하겠습니다.`
                )}
                className="text-xs text-blue-700 hover:text-blue-900 underline font-medium"
              >
                현재 질문용 예시 답변 자동 채우기
              </button>
            </div>

            <textarea
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
              rows={5}
              placeholder="마이크 버튼을 눌러 실제 면접처럼 말하거나, 구두로 발언할 답변을 작성한 뒤 채점 버튼을 누르세요..."
              className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs sm:text-sm font-sans leading-relaxed focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition"
            />

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleEvaluateAnswer}
                disabled={evaluating || !answerText.trim()}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm disabled:opacity-50 transition flex items-center gap-2 shadow-xs"
              >
                {evaluating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>내 답변 내용 정밀 채점 중...</span>
                  </>
                ) : (
                  <>
                    <Award className="w-4 h-4" />
                    <span>수석 면접관 실전 채점 및 피드백 받기</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Evaluation Results Box */}
          {evalResult && (
            <div ref={evalResultRef} className="bg-slate-50 rounded-2xl border border-blue-200 p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="px-4 py-2 rounded-xl bg-blue-600 text-white font-extrabold text-xl shadow-xs tabular-nums">
                    {evalResult.score}점
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-500 uppercase">합격 판정</span>
                    <h4 className="text-base font-bold text-slate-900">{evalResult.verdict}</h4>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-500 block">필수 키워드 검증</span>
                  <span className="text-xs font-bold text-blue-700">
                    {evalResult.used_keywords?.length || 0}개 반영 / {evalResult.missed_keywords?.length || 0}개 보완 권장
                  </span>
                </div>
              </div>

              {/* Strengths and Weaknesses */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-1.5 shadow-xs">
                  <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    답변의 강점 (우수한 엔지니어링 논리)
                  </span>
                  <ul className="space-y-1.5 text-xs sm:text-sm text-slate-700">
                    {evalResult.strengths?.map((s, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-emerald-600 font-bold">•</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-1.5 shadow-xs">
                  <span className="text-xs font-bold text-rose-800 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                    현장 관점의 아쉬운 논리적 빈틈
                  </span>
                  <ul className="space-y-1.5 text-xs sm:text-sm text-slate-700">
                    {evalResult.weaknesses?.map((w, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-rose-600 font-bold">•</span>
                        <span>{w}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Missed Keywords Warning */}
              {evalResult.missed_keywords && evalResult.missed_keywords.length > 0 && (
                <div className="bg-rose-50 p-3.5 rounded-xl border border-rose-200 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                  <span className="text-xs sm:text-sm text-rose-950">
                    <strong>누락된 핵심 키워드:</strong> {evalResult.missed_keywords.join(', ')} — 답변 시 이 키워드들을 직접 언급해야 전문성을 인정받습니다.
                  </span>
                </div>
              )}

              {/* Architect Critique */}
              <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 space-y-1 shadow-xs">
                <span className="text-xs font-bold text-slate-900 uppercase">
                  수석 면접관의 뼈때리는 현장 피드백
                </span>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  "{evalResult.architect_critique}"
                </p>
              </div>

              {/* Exemplary Model Answer */}
              <div className="bg-emerald-50/60 p-4 sm:p-5 rounded-xl border border-emerald-200 space-y-2">
                <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  합격을 부르는 1분 모범 구두 답변 (Model Oral Answer)
                </span>
                <p className="text-xs sm:text-sm text-slate-900 leading-relaxed font-sans bg-white p-4 rounded-lg border border-emerald-200 shadow-xs">
                  "{evalResult.model_answer}"
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
