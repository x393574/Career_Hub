import React, { useState } from 'react';
import { 
  Layers, 
  Calculator, 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  Info,
  Cpu
} from 'lucide-react';
import { PURDUE_MODEL_LEVELS, MANUFACTURING_METRICS } from '../data/purdueMetrics';

export const PurdueKnowledgeBase: React.FC = () => {
  const [selectedLevel, setSelectedLevel] = useState<string>('Level 1');
  const [activeCalculator, setActiveCalculator] = useState<'oee' | 'takt' | 'cost'>('oee');

  // OEE Calculator State
  const [availability, setAvailability] = useState<number>(90);
  const [performance, setPerformance] = useState<number>(92);
  const [quality, setQuality] = useState<number>(98);
  const calculatedOEE = ((availability / 100) * (performance / 100) * (quality / 100) * 100).toFixed(1);

  // Takt Time Calculator State
  const [operatingHours, setOperatingHours] = useState<number>(8);
  const [dailyDemand, setDailyDemand] = useState<number>(600);
  const [cycleTime, setCycleTime] = useState<number>(45);
  const availableSeconds = operatingHours * 3600;
  const taktTime = dailyDemand > 0 ? (availableSeconds / dailyDemand).toFixed(1) : '0';
  const taktVsCycle = parseFloat(taktTime) - cycleTime;

  // Asymmetric Cost Calculator
  const [dailyUnits, setDailyUnits] = useState<number>(10000);
  const [falsePositiveRate, setFalsePositiveRate] = useState<number>(0.5);
  const [falseNegativeRate, setFalseNegativeRate] = useState<number>(0.05);
  const [lineStopCostPerIncident, setLineStopCostPerIncident] = useState<number>(500);
  const [defectEscapeCostPerUnit, setDefectEscapeCostPerUnit] = useState<number>(5000);

  const fpCount = Math.round((dailyUnits * falsePositiveRate) / 100);
  const fnCount = Math.round((dailyUnits * falseNegativeRate) / 100);
  const totalFpCost = (fpCount * lineStopCostPerIncident).toLocaleString();
  const totalFnCost = (fnCount * defectEscapeCostPerUnit).toLocaleString();

  const currentLevelInfo = PURDUE_MODEL_LEVELS.find((l) => l.level === selectedLevel) || PURDUE_MODEL_LEVELS[1];

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                ARCHITECTURE GUIDE
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Purdue 모델 &amp; 스마트팩토리 핵심 지표 표준 가이드
              </h2>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed max-w-3xl">
              스마트 제조 현장의 산업 표준인 <strong>Purdue Model (Level 0~4)</strong> 계층 구조와 
              면접관이 반드시 검증하는 <strong>OEE, FTY, Takt Time, 비대칭 비용 매트릭스</strong>를 시뮬레이션하고 체화합니다.
            </p>
          </div>
        </div>
      </div>

      {/* Purdue Model Visual Stack Explorer */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              <span>Purdue Model OT/IT 계층 스택 탐색기</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              각 계층을 클릭하면 설비 장비, 통신 프로토콜, 데이터 특성 및 면접 발언 포인트를 확인할 수 있습니다.
            </p>
          </div>
          <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            ISA-95 / Purdue Reference Model
          </span>
        </div>

        {/* Stack Level Buttons Top-to-Bottom */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-2.5">
          {PURDUE_MODEL_LEVELS.slice().reverse().map((lvl) => {
            const isSelected = selectedLevel === lvl.level;
            return (
              <button
                key={lvl.level}
                onClick={() => setSelectedLevel(lvl.level)}
                className={`p-4 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'bg-blue-50 border-blue-500 shadow-xs ring-1 ring-blue-500'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold ${isSelected ? 'text-blue-700' : 'text-slate-500'}`}>
                    {lvl.level}
                  </span>
                  {isSelected && <span className="w-2 h-2 rounded-full bg-blue-600" />}
                </div>
                <h4 className={`text-xs sm:text-sm font-bold mt-1.5 ${isSelected ? 'text-slate-900' : 'text-slate-700'}`}>
                  {lvl.koreanName.split(' ')[0]}
                </h4>
                <p className="text-xs text-slate-500 font-mono mt-0.5 truncate">
                  {lvl.protocols.slice(0, 2).join(', ')}
                </p>
              </button>
            );
          })}
        </div>

        {/* Detailed Level Diagnostic Display */}
        <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
            <div>
              <span className="text-xs font-bold text-blue-700 uppercase">
                {currentLevelInfo.level} : {currentLevelInfo.name}
              </span>
              <h4 className="text-base font-bold text-slate-900 mt-0.5">
                {currentLevelInfo.koreanName}
              </h4>
            </div>
            <span className="text-xs text-slate-600 bg-white px-3 py-1 rounded-lg border border-slate-200 shadow-xs">
              역할: {currentLevelInfo.roleInSmartFactory}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Devices */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2 shadow-xs">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-blue-600" />
                <span>대표 설비 및 디바이스</span>
              </span>
              <ul className="space-y-1.5 text-xs sm:text-sm text-slate-700">
                {currentLevelInfo.devices.map((d, i) => (
                  <li key={i} className="flex items-center gap-1.5">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Protocols */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2 shadow-xs">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-blue-600" />
                <span>산업용 통신 프로토콜</span>
              </span>
              <div className="flex flex-wrap gap-1">
                {currentLevelInfo.protocols.map((p, i) => (
                  <span key={i} className="text-xs px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-800 font-medium">
                    {p}
                  </span>
                ))}
              </div>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                <strong className="text-slate-800">데이터 특성:</strong> {currentLevelInfo.dataCharacteristics}
              </p>
            </div>

            {/* Interview Strategy Tip */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50/50 p-4 rounded-xl border border-blue-200 space-y-2">
              <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-blue-600" />
                <span>면접관 앞 필승 발언 전략</span>
              </span>
              <p className="text-xs sm:text-sm text-slate-800 leading-relaxed italic">
                "{currentLevelInfo.interviewTip}"
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Manufacturing Metric Calculators */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-blue-600" />
              <span>핵심 공장 운영 지표 실전 시뮬레이터</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              실제 현장 수치를 입력하여 OEE, Takt Time 병목, 오탐/미탐 비대칭 비용을 공학적으로 계산해봅니다.
            </p>
          </div>

          <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200">
            <button
              onClick={() => setActiveCalculator('oee')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeCalculator === 'oee' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              OEE (설비종합효율)
            </button>
            <button
              onClick={() => setActiveCalculator('takt')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeCalculator === 'takt' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Takt vs Cycle Time
            </button>
            <button
              onClick={() => setActiveCalculator('cost')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeCalculator === 'cost' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              비대칭 비용 매트릭스
            </button>
          </div>
        </div>

        {/* Calculator 1: OEE */}
        {activeCalculator === 'oee' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-3.5">
                <span className="text-xs font-bold text-slate-700 uppercase">
                  OEE = 시간가동률(A) × 성능가동률(P) × 양품률(Q)
                </span>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-slate-700">시간가동률 (Availability): 정지 로스(고장/정비) 배제</span>
                    <span className="font-bold text-slate-900">{availability}%</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="100"
                    value={availability}
                    onChange={(e) => setAvailability(Number(e.target.value))}
                    className="w-full accent-blue-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-slate-700">성능가동률 (Performance): 순간 정지/속도 저하 배제</span>
                    <span className="font-bold text-slate-900">{performance}%</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="100"
                    value={performance}
                    onChange={(e) => setPerformance(Number(e.target.value))}
                    className="w-full accent-blue-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-slate-700">양품률 (Quality): 불량품/재작업 배제</span>
                    <span className="font-bold text-slate-900">{quality}%</span>
                  </div>
                  <input
                    type="range"
                    min="70"
                    max="100"
                    value={quality}
                    onChange={(e) => setQuality(Number(e.target.value))}
                    className="w-full accent-blue-600"
                  />
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-5 sm:p-6 rounded-xl border border-slate-200 flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase">최종 OEE 산출 결과</span>
                <div className="my-3 flex items-baseline gap-2">
                  <span className="text-5xl font-extrabold text-blue-600">{calculatedOEE}%</span>
                </div>
                <div className="text-xs sm:text-sm text-slate-700 space-y-2">
                  <p>
                    {parseFloat(calculatedOEE) >= 85 ? (
                      <span className="text-emerald-700 font-bold">🏆 월드클래스 수준 (85% 이상)</span>
                    ) : (
                      <span className="text-amber-700 font-bold">⚠️ 일반 제조 공장 수준 (개선 필요)</span>
                    )}
                  </p>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    💡 <strong>면접 코칭:</strong> "단순히 OEE를 올리겠다"고 하지 말고, 
                    "설비 예지보전(PdM)으로 시간가동률을 3%p 개선하고, 인라인 비전으로 양품률을 1.5%p 견인하여 총 OEE를 XX%까지 끌어올리겠다"고 분해하여 발언하십시오.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Calculator 2: Takt vs Cycle Time */}
        {activeCalculator === 'takt' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-3.5">
                <span className="text-xs font-bold text-slate-700 uppercase">
                  Takt Time = 순 가동 시간 / 고객 일일 주문량
                </span>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-700 font-medium">일일 순 가동 시간 (시간)</label>
                    <input
                      type="number"
                      value={operatingHours}
                      onChange={(e) => setOperatingHours(Number(e.target.value))}
                      className="w-full mt-1 p-2 rounded-lg bg-white border border-slate-300 text-xs sm:text-sm text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-700 font-medium">고객 일일 요구량 (대/개)</label>
                    <input
                      type="number"
                      value={dailyDemand}
                      onChange={(e) => setDailyDemand(Number(e.target.value))}
                      className="w-full mt-1 p-2 rounded-lg bg-white border border-slate-300 text-xs sm:text-sm text-slate-900"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-slate-700">설비 단위 공정 실제 가공 시간 (Cycle Time):</span>
                    <span className="font-bold text-slate-900">{cycleTime}초</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="120"
                    value={cycleTime}
                    onChange={(e) => setCycleTime(Number(e.target.value))}
                    className="w-full mt-1 accent-blue-600"
                  />
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-5 sm:p-6 rounded-xl border border-slate-200 flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase">요구 Takt Time</span>
                <div className="my-2 flex items-baseline gap-1.5">
                  <span className="text-4xl font-extrabold text-slate-900">{taktTime}초</span>
                  <span className="text-xs text-slate-500">/ 개당</span>
                </div>

                <div className="space-y-2 text-xs sm:text-sm">
                  {taktVsCycle >= 0 ? (
                    <div className="text-emerald-700 font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>납기 만족 (여유 버퍼 {taktVsCycle.toFixed(1)}초)</span>
                    </div>
                  ) : (
                    <div className="text-rose-700 font-bold flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                      <span>병목 발생! ({Math.abs(taktVsCycle).toFixed(1)}초 초과 납기 지연)</span>
                    </div>
                  )}
                  <p className="text-xs text-slate-600 leading-relaxed pt-1">
                    💡 <strong>면접 코칭:</strong> "AI 모델의 추론 지연시간이 Cycle Time의 여유 버퍼({Math.max(0, taktVsCycle).toFixed(1)}초)를 
                    침범하지 않도록 TensorRT 경량화를 적용했습니다"라는 멘트는 면접관의 높은 신뢰를 얻습니다.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Calculator 3: Asymmetric Cost Matrix */}
        {activeCalculator === 'cost' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-3.5">
                <span className="text-xs font-bold text-slate-700 uppercase">
                  비대칭 비용 = (오탐 건수 × 셧다운 비용) + (미탐 건수 × 리콜 비용)
                </span>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-700 font-medium">일일 생산량 (Units)</label>
                    <input
                      type="number"
                      value={dailyUnits}
                      onChange={(e) => setDailyUnits(Number(e.target.value))}
                      className="w-full mt-1 p-2 rounded-lg bg-white border border-slate-300 text-xs sm:text-sm text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-700 font-medium">오탐(FP) 발생 시 라인 정지 비용 (만원)</label>
                    <input
                      type="number"
                      value={lineStopCostPerIncident}
                      onChange={(e) => setLineStopCostPerIncident(Number(e.target.value))}
                      className="w-full mt-1 p-2 rounded-lg bg-white border border-slate-300 text-xs sm:text-sm text-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-700 font-medium">오탐률 (False Positive %)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={falsePositiveRate}
                      onChange={(e) => setFalsePositiveRate(Number(e.target.value))}
                      className="w-full mt-1 p-2 rounded-lg bg-white border border-slate-300 text-xs sm:text-sm text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-700 font-medium">미탐(FN) 불량 유출 시 리콜 비용 (만원)</label>
                    <input
                      type="number"
                      value={defectEscapeCostPerUnit}
                      onChange={(e) => setDefectEscapeCostPerUnit(Number(e.target.value))}
                      className="w-full mt-1 p-2 rounded-lg bg-white border border-slate-300 text-xs sm:text-sm text-slate-900"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-5 sm:p-6 rounded-xl border border-slate-200 flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase">예상 일일 비용 리스크</span>
                <div className="my-2 space-y-1.5">
                  <div className="text-xs sm:text-sm text-slate-800">
                    오탐(FP {fpCount}건) 셧다운 손실: <strong className="font-bold text-amber-700">{totalFpCost}만원</strong>
                  </div>
                  <div className="text-xs sm:text-sm text-slate-800">
                    미탐(FN {fnCount}건) 유출 클레임: <strong className="font-bold text-rose-700">{totalFnCost}만원</strong>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed pt-2 border-t border-slate-200">
                  💡 <strong>면접 필승 논리:</strong> "공장에서는 단순 F1-Score가 아닌 미탐 비용({defectEscapeCostPerUnit}만)이 
                  오탐 비용({lineStopCostPerIncident}만)의 수십 배에 달하므로, Recall에 가중치를 둔 F-beta Score 기준으로 Decision Threshold를 신중히 튜닝했습니다."
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Glossary Cards */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Info className="w-5 h-5 text-blue-600" />
          <span>면접 필수 제조 핵심 지표 사전</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {MANUFACTURING_METRICS.map((metric, idx) => (
            <div key={idx} className="bg-slate-50 p-4 sm:p-5 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-700">
                  {metric.name} ({metric.category})
                </span>
              </div>
              <h4 className="text-sm font-bold text-slate-900">{metric.fullName}</h4>
              <p className="text-xs font-mono text-slate-800 bg-white p-2 rounded-lg border border-slate-200">
                {metric.formula}
              </p>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                {metric.description}
              </p>
              <p className="text-xs text-emerald-800 pt-1 font-medium">
                🎯 면접 포인트: {metric.interviewContext}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
