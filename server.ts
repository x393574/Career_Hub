import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const SYSTEM_MANUFACTURING_PROMPT = `
당신은 반도체, 디스플레이, 배터리, 자동차/모빌리티, 전기·전자, 화학/소재, 중공업, 제철, 기계·가공 등 제조업 전반의 '생산기술', '제조DX/AX', '스마트팩토리', '공정제어/품질' 직무 지원자를 전담 코칭하는 시니어 제조DX 아키텍트이자 수석 기술 면접관입니다.

사용자의 입력사항(기업명, 공고문, 보유 이력, 프로젝트 메모, 꼬리질문 답변, 면접 답변 등)을 반드시 100% 반영하여 실제 플랜트 현장의 언어(설비, 센서 데이터 파이프라인, 공정 흐름, 수율 및 생산 제약조건)로 변환하고 논리적 빈틈을 엄격히 검증합니다.

제조업 전반 도메인 원칙:
1. 제조 공정 유형 분류:
   - 이산 제조 (Discrete Manufacturing - 반도체, 자동차, 전자부품, 기계, 정밀가공, 조립): 단위(Unit/Piece), Takt Time/Cycle Time 관리, 공구 마모(전류/진동), 설비 RPM, 비전 결함 검사, 토크/각도 곡선, AGV/AMR 물류.
   - 연속/배치 제조 (Process/Batch Manufacturing - 석유화학, 정유, 철강, 배터리 소재, 제약/바이오): 배관/반응기 내 연속 흐름, 온도/압력/유량/레벨/pH/밸브 개도율 다변량 시계열, 반응 최적화(APC), 공정 변동성 제어, 에너지 원단위 절감.
2. OT/IT 시스템 계층 (Purdue Model):
   - Level 0~1 (현장 설비/계측): 센서, 액추에이터, 로봇, PLC(Siemens, LS, Mitsubishi, Rockwell), 센서 통신(IO-Link, 4-20mA, RS-485).
   - Level 2 (제어 및 감시): SCADA, HMI, 현장 IPC, DCS, Modbus, OPC-UA, MQTT, SECS/GEM.
   - Level 3 (제조 실행/관리): MES, WMS, QMS, CMMS, FDC, YMS.
   - Level 4 (전사 자원 관리): ERP, SCM, 엔터프라이즈 데이터 레이크.
3. 핵심 운영 지표:
   - 수율(Yield), 직행율(FTY, First Throughput Yield)
   - 설비종합효율 (OEE = 시간가동률 × 성능가동률 × 양품률)
   - Takt Time vs Cycle Time
   - MTBF(평균고장간격) / MTTR(평균수리시간)
   - 오탐(False Alarm) 셧다운 비용 vs 미탐(Missed Detection) 불량 유출 비용

엄격한 원칙:
- 사용자의 입력 텍스트에 등장하는 구체적 기술, 센서, 문제 상황, 수치를 절대 누락하지 말고 결과물에 직접 반영하십시오.
- 진부한 추상적 표현 배제("성실히 임했습니다" X -> 구체적 기술 명칭과 수치 지표 O).
- 사실 위조 방지: 사용자가 입력하지 않은 정량 수치는 [정량 수치 입력 필요: 예) 불량 검출 속도 XX% 단축] 형태로 표시하되, 사용자가 이미 입력한 수치(예: 94%, 18ms, 35 FPS 등)는 그대로 적극 활용하십시오.
- 반드시 유효한 JSON 객체만 출력하십시오.
`;

function extractJson(rawText: string) {
  try {
    const cleaned = rawText.trim();
    if (cleaned.startsWith('{') || cleaned.startsWith('[')) {
      return JSON.parse(cleaned);
    }
    const match = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (match && match[1]) {
      return JSON.parse(match[1].trim());
    }
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      return JSON.parse(cleaned.slice(firstBrace, lastBrace + 1));
    }
    return JSON.parse(cleaned);
  } catch {
    return null;
  }
}

async function generateManufacturingJson(prompt: string): Promise<any> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY가 설정되지 않았습니다.');
  }

  const modelsToTry: Array<{ model: string; thinkingLevel: ThinkingLevel }> = [
    { model: 'gemini-3.1-flash-lite', thinkingLevel: ThinkingLevel.MINIMAL },
    { model: 'gemini-3.8-flash', thinkingLevel: ThinkingLevel.LOW },
  ];

  let lastError: any = null;

  for (const candidate of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        model: candidate.model,
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_MANUFACTURING_PROMPT,
          responseMimeType: 'application/json',
          thinkingConfig: { thinkingLevel: candidate.thinkingLevel },
        },
      });

      const parsed = extractJson(response.text || '');
      if (parsed) {
        return parsed;
      }
      lastError = new Error('AI 응답 JSON 파싱에 실패했습니다.');
    } catch (err: any) {
      console.warn(`[Model ${candidate.model} failed]:`, err?.message || err);
      lastError = err;
    }
  }

  throw lastError || new Error('AI 분석 요청 처리에 실패했습니다.');
}

// 1. Company Process Explorer API
app.post('/api/gemini/company-explorer', async (req: Request, res: Response) => {
  try {
    const { companyName } = req.body;
    if (!companyName || typeof companyName !== 'string') {
      res.status(400).json({ error: '기업명 또는 사업부를 입력해주세요.' });
      return;
    }

    const prompt = `
사용자가 입력한 제조 기업(또는 기업 + 사업부/공장/라인): "${companyName.trim()}"
이 기업 및 사업부의 실제 대표 제조 라인을 역공학하여 지원자가 공정을 깊이 있게 학습할 수 있도록 아래 JSON 포맷으로 작성하십시오.
반드시 "${companyName.trim()}"의 실제 주력 제품과 특화된 공정 단계(4~6단계), 실제 쓰이는 설비 및 물리량/센서 데이터를 구체적으로 작성하십시오.

응답 형식 (JSON만 출력):
{
  "company_name": "기업명 및 분석 대상 사업부/공장명",
  "manufacturing_type": "이산 제조 (Discrete Manufacturing) 또는 연속/배치 제조 (Process/Batch Manufacturing) 또는 혼합형",
  "main_site": "대표 스마트팩토리 사업장 및 핵심 생산 라인",
  "site_overview": "해당 사업장의 생산 품목, 공정 특성 및 스마트팩토리 고도화 수준 요약 (2문장)",
  "pipeline_steps": [
    {
      "step": 1,
      "process_name": "구체적 공정명 (예: 극판 슬러리 믹싱 / 웨이퍼 노광 / 차체 프레스 등)",
      "equipment": "핵심 설비명 및 물리적·화학적 상태 변화 설명",
      "ot_data": "수집 센서, 계측 물리량, 산업용 프로토콜 및 샘플링 주기 명시",
      "pain_points": "해당 공정에서 자주 발생하는 품질 불량, 설비 마모, 공정 산포 등 고질적 병목(Pain Point)"
    }
  ],
  "actual_dx_initiatives": [
    {
      "title": "해당 기업에서 실제 추진 중이거나 핵심인 제조DX/AX 과제명",
      "tech_stack": "적용 기술 스택 (예: Vision AI, PLC Edge IPC, SECS/GEM, Digital Twin 등)",
      "expected_effect": "정량적/정성적 목표 효과 (수율 개선, FTY 향상, 설비 다운타임 절감 등)"
    }
  ],
  "interview_pitch_template": "저는 귀사의 [특정 공정 단계]에서 발생하는 [특정 데이터]를 활용해 [DX 과제]를 해결하고 싶습니다... 로 이어지는 실제 면접용 구체적 발언 템플릿 (3문장)",
  "purdue_level_breakdown": {
    "level0_1": "이 공장의 대표 현장 센서, 액추에이터 및 PLC/제어기 구성",
    "level2": "현장 SCADA/HMI/IPC 및 수집 통신 프로토콜",
    "level3": "공장 MES/QMS/FDC/CMMS 운영 구조",
    "level4": "전사 ERP/SCM 및 엔터프라이즈 데이터 레이크 파이프라인"
  }
}
`;

    const parsed = await generateManufacturingJson(prompt);
    res.json(parsed);
  } catch (error: any) {
    console.error('Company Explorer Error:', error);
    res.status(500).json({ error: error.message || '공정 분석 중 오류가 발생했습니다.' });
  }
});

// 2. Job Posting Diagnosis API
app.post('/api/gemini/job-diagnosis', async (req: Request, res: Response) => {
  try {
    const { jobDescription, userExperience } = req.body;
    if (!jobDescription || !jobDescription.trim()) {
      res.status(400).json({ error: '채용 공고문을 입력해주세요.' });
      return;
    }

    const prompt = `
사용자가 입력한 채용 공고문(JD):
"""
${jobDescription.trim()}
"""

사용자가 입력한 보유 이력 / 프로젝트 경험:
"""
${userExperience ? userExperience.trim() : '지원자 이력 미입력 (공고문 요구사항 중심으로 기준 진단 수행)'}
"""

위 채용 공고문과 지원자의 보유 이력을 1:1로 엄격히 대조하여 정밀 파싱 및 적합도 진단을 수행하십시오.
점수와 코멘트는 반드시 사용자가 입력한 공고문의 기술 요구사항과 사용자의 실제 이력 내용에 근거하여 산출해야 합니다.

응답 형식 (JSON만 출력):
{
  "target_role": "공고에서 추출한 정확한 기업/직무명 및 담당 도메인",
  "manufacturing_type": "이산 제조 (Discrete Manufacturing) 또는 연속/배치 제조 (Process/Batch Manufacturing)",
  "purdue_focus_levels": ["공고 직무가 주로 다루는 Purdue 계층들 (예: Level 1 PLC/센서, Level 2 Edge IPC, Level 3 MES/FDC 등)"],
  "required_skills": ["공고문에서 추출한 필수 지원 자격 요건들 (3~5개)"],
  "preferred_skills": ["공고문에서 추출한 우대 사항 요건들 (3~5개)"],
  "technical_stack": {
    "languages": ["요구 프로그래밍 언어들"],
    "frameworks_ai": ["요구 AI/데이터/비전 프레임워크들"],
    "protocols_db": ["요구 산업용 통신 프로토콜 및 DB들"],
    "automation_tools": ["요구 설비 제어/자동화/MES 툴들"]
  },
  "match_score": {
    "overall": 80,
    "requirement_check": true,
    "requirement_comment": "지원자 이력이 필수 요건을 어떻게 충족하거나 부족한지 구체적 분석 (1~2문장)",
    "tech_stack_score": 82,
    "tech_stack_comment": "공고 요구 스택 대비 지원자 보유 기술(언급된 센서/모델/툴) 매칭 분석 (1~2문장)",
    "domain_fit_score": 78,
    "domain_fit_comment": "OT/IT 결합 및 현장 공정 데이터 이해도 평가 (1~2문장)"
  },
  "radar_metrics": [
    { "subject": "설비·센서 연동(OT)", "score": 75, "fullMark": 100 },
    { "subject": "시계열/비전 AI", "score": 85, "fullMark": 100 },
    { "subject": "공정제어·품질(SPC)", "score": 70, "fullMark": 100 },
    { "subject": "산업용 통신(OPC-UA/Modbus)", "score": 72, "fullMark": 100 },
    { "subject": "현장 Takt Time 대응력", "score": 68, "fullMark": 100 },
    { "subject": "시스템 아키텍처(MES/Edge)", "score": 80, "fullMark": 100 }
  ],
  "critical_gaps": ["지원자 이력에서 이 공고 합격을 위해 반드시 보완해야 할 제조 현장 지식/경험 빈틈 3가지"],
  "recommended_appeal_points": ["지원자의 현재 프로젝트 경험을 이 공고 면접에서 어떻게 포장·어필해야 하는지 구체적 전략 3가지"]
}
`;

    const parsed = await generateManufacturingJson(prompt);
    res.json(parsed);
  } catch (error: any) {
    console.error('Job Diagnosis Error:', error);
    res.status(500).json({ error: error.message || '공고 진단 중 오류가 발생했습니다.' });
  }
});

// 3. BEI Probing & STAR / PREP Transformation API
app.post('/api/gemini/bei-probing', async (req: Request, res: Response) => {
  try {
    const { rawExperience, targetCompany, answeredProbes, currentQuestions, mode } = req.body;
    if (!rawExperience || !rawExperience.trim()) {
      res.status(400).json({ error: '프로젝트 또는 경험 메모를 입력해주세요.' });
      return;
    }

    const isResynthesize = mode === 'resynthesize' && answeredProbes && Object.keys(answeredProbes).length > 0;

    let probeContext = '아직 꼬리질문 답변 전 단계 (초안 생성 및 맞춤형 꼬리질문 도출 단계)';
    if (isResynthesize) {
      const qaPairs = (currentQuestions || []).map((q: any) => {
        const ans = answeredProbes[q.id] || '(미답변)';
        return `[질문 ${q.id}: ${q.category}] ${q.question}\n👉 지원자의 추가 답변: ${ans}`;
      }).join('\n\n');
      probeContext = `지원자가 3대 BEI 꼬리질문에 대해 아래와 같이 구체적인 추가 답변을 작성했습니다. 이 답변 내용(수치, 알고리즘, 노이즈 처리, 지연시간, 본인 기여도 등)을 STAR와 PREP 모든 항목에 반드시 깊이 있게 통합하여 재합성하십시오!\n\n${qaPairs}`;
    }

    const prompt = `
지원자의 원시 프로젝트 메모:
"""
${rawExperience.trim()}
"""

목표 기업 및 직무 도메인: "${targetCompany || '첨단 제조 대기업 (생산기술 / 제조DX / 스마트팩토리)'}"

요청 모드: ${isResynthesize ? 'STEP 2 꼬리질문 답변을 완벽히 반영한 STAR / PREP 심층 재합성' : 'STEP 1 프로젝트 메모 분석을 통한 맞춤 BEI 꼬리질문 3개 도출 및 STAR / PREP 변환'}

꼬리질문 및 지원자 추가 답변 컨텍스트:
"""
${probeContext}
"""

작업 지침:
1. [검증 단계 (BEI Probing Questions)]:
   - 지원자의 원시 프로젝트 메모("${rawExperience.trim().slice(0, 120)}...")에 등장하는 구체적 기술과 상황을 겨냥하여 날카로운 심층 꼬리질문 3가지를 작성하십시오.
   - id 1 (개인 기여도 검증): 팀 전체 성과 외에 지원자 본인이 직접 설계/구현한 핵심 모듈·알고리즘·파이프라인 질문
   - id 2 (제조 데이터 실무 특성 검증): 공장 데이터 특유의 불균형(정상 99% 이상), 결측치, 센서 노이즈/조명 변화/드리프트 처리 질문
   - id 3 (현장 물리 제약 & Takt Time 검증): 엔드투엔드 처리 지연시간(Latency ms/FPS)과 실제 설비 Cycle Time / Takt Time 충족 여부 질문
   ${isResynthesize ? '- 이미 지원자가 답변한 내용에서 한 단계 더 나아간 심화 확인 포인트를 reason에 코멘트하십시오.' : ''}

2. [완성 단계 (STAR & PREP 동시 변환)]:
   - 지원자가 입력한 원시 프로젝트 메모${isResynthesize ? '와 STEP 2에서 추가 입력한 꼬리질문 답변들' : ''}을 100% 반영하여 "물리적 공장 환경과 OT/IT 데이터를 유기적으로 연결하는 현장형 엔지니어" 관점으로 작성하십시오.
   - 사용자가 입력한 수치(예: 정확도, FPS, ms, 샘플링 주기, 데이터 수 등)는 그대로 살리고, 아직 언급되지 않은 핵심 정량 지표만 [정량 수치 입력 필요: 예) 오탐률 XX% 감소] 형태로 표시하십시오.

응답 형식 (JSON만 출력):
{
  "bei_probing_questions": [
    {
      "id": 1,
      "category": "개인 기여도 및 독자 설계 검증",
      "question": "지원자의 프로젝트 내용에 맞춘 구체적 기여도 꼬리질문",
      "reason": "면접관의 검증 의도 설명",
      "suggested_placeholder": "예: 저는 데이터 수집 모듈과 ... 알고리즘 설계를 100% 전담 구현했습니다."
    },
    {
      "id": 2,
      "category": "제조 데이터 실무 특성 검증",
      "question": "지원자의 프로젝트 데이터 특성에 맞춘 불균형/노이즈/결측치 꼬리질문",
      "reason": "면접관의 검증 의도 설명",
      "suggested_placeholder": "예: 센서 노이즈는 ... 필터로 정제했고 불균형 문제는 ... 기법으로 해결했습니다."
    },
    {
      "id": 3,
      "category": "현장 제약조건 및 Takt Time 검증",
      "question": "지원자의 프로젝트 추론 속도/지연시간(Latency) 및 설비 Takt Time 연계 꼬리질문",
      "reason": "면접관의 검증 의도 설명",
      "suggested_placeholder": "예: 엔드투엔드 추론 시간은 ...ms였으며, 라인 요구 주기(...ms) 내에 실시간 처리가 가능했습니다."
    }
  ],
  "experience_synthesis": {
    "project_title": "지원자의 입력 프로젝트와 목표 기업 도메인을 결합해 공학적으로 재정의한 프로젝트 명칭",
    "key_technologies": ["지원자 입력 및 답변에서 추출한 핵심 엔지니어링 기술 키워드 5~7개"],
    "applied_points": ["지원자의 입력/답변 중 이번 STAR·PREP 합성에 핵심적으로 반영된 포인트 3가지 요약"],
    "star_resume": {
      "situation": "지원자의 프로젝트 배경을 실제 제조 공정 및 설비 병목 문제 관점으로 구체화한 Situation (2~3문장)",
      "task": "달성해야 했던 구체적 엔지니어링 목표 및 물리적/시스템적 제약조건(Takt Time, 노이즈, 불균형 등) Task (2~3문장)",
      "action": "지원자가 직접 수행한 기술적 액션(사용 센서/툴, 전처리, 알고리즘, 프로토콜, 경량화 등) Action (3~4문장)",
      "result": "도출한 정량적/공학적 성과 및 누락 수치 보완 가이드 Result (2~3문장)"
    },
    "prep_speech": {
      "point": "두괄식 결론: 지원자의 핵심 기술 역량과 정량적 성과를 1~2문장으로 압축한 첫 마디",
      "reason": "왜 해당 알고리즘/파이프라인/통신 구조를 채택했는지에 대한 공학적 이유 (2문장)",
      "example": "실제 구현 및 데이터 처리 중 겪은 노이즈/불균형/지연시간 문제를 해결한 구체적 사례 (2~3문장)",
      "point_summary": "목표 기업(${targetCompany || '귀사'})의 현장 라인 수율(FTY) 및 설비 가동률(OEE) 향상에 어떻게 기여할 것인지 마무리 포부 (1~2문장)"
    }
  },
  "critic_feedback": "수석 면접관 관점에서 지원자의 현재 내용에 대한 날카로운 총평 및 면접장 추가 대비 조언 (3문장)"
}
`;

    const parsed = await generateManufacturingJson(prompt);
    res.json(parsed);
  } catch (error: any) {
    console.error('BEI Probing Error:', error);
    res.status(500).json({ error: error.message || 'BEI 검증 및 STAR 변환 중 오류가 발생했습니다.' });
  }
});

// 4. Domain-Integrated Technical Interview Questions API
app.post('/api/gemini/interview-questions', async (req: Request, res: Response) => {
  try {
    const { targetCompany, targetRole, techStack, projectBrief } = req.body;

    const prompt = `
지원자의 면접 준비 프로필:
- 대상 기업: "${targetCompany || '첨단 제조 대기업'}"
- 지원 직무: "${targetRole || '제조DX / 생산기술 / 스마트팩토리 엔지니어'}"
- 보유 기술 스택: "${techStack || 'Python, PLC 연동, 시계열/비전 AI'}"
- 지원자 핵심 프로젝트 요약: "${projectBrief || '센서 데이터 수집 및 이상 탐지 파이프라인 구축'}"

일반적인 IT/CS 질문이 아니라, 위 4가지 입력사항(대상 기업의 실제 공정, 지원 직무, 기술 스택, 지원자의 프로젝트 요약)을 직접적으로 파고드는 도메인 융합형 기술 면접 문항을 3개 계층(Tier 1, Tier 2, Tier 3)으로 생성하십시오.

응답 형식 (JSON만 출력):
{
  "questions": [
    {
      "tier": "Tier 1 (설비 데이터/인프라)",
      "topic": "지원 기술 스택(${techStack})과 현장 OT/IT 통신 인프라 결합 주제",
      "question": "대상 기업(${targetCompany}) 공정 설비와 연관된 PLC/센서/프로토콜 연동, 데이터 유실 방지 버퍼링, 시간 동기화 등에 관한 구체적 면접 질문",
      "intent": "면접관의 핵심 평가 의도 (1문장)",
      "key_keywords": ["답변 필수 기술 키워드1", "답변 필수 기술 키워드2", "답변 필수 기술 키워드3"]
    },
    {
      "tier": "Tier 2 (모델링 및 현장 적용)",
      "topic": "공정 데이터 불균형 및 오탐(라인 셧다운) vs 미탐(불량 유출) 임계치 설계",
      "question": "지원 직무(${targetRole}) 및 공정 특성을 반영한 데이터 노이즈/드리프트 극복 및 비대칭 비용 기반 Decision Threshold 설계 면접 질문",
      "intent": "면접관의 핵심 평가 의도 (1문장)",
      "key_keywords": ["답변 필수 기술 키워드1", "답변 필수 기술 키워드2", "답변 필수 기술 키워드3"]
    },
    {
      "tier": "Tier 3 (BEI 프로젝트 압박)",
      "topic": "지원자 프로젝트(${projectBrief})의 현장 Takt Time 및 물리적 병목 압박 검증",
      "question": "지원자의 프로젝트(${projectBrief})를 실제 ${targetCompany} 양산 라인에 적용할 때 발생할 수 있는 추론 지연시간(Latency), 하드웨어 제약, 예외 상황을 날카롭게 파고드는 압박 면접 질문",
      "intent": "면접관의 핵심 평가 의도 (1문장)",
      "key_keywords": ["답변 필수 기술 키워드1", "답변 필수 기술 키워드2", "답변 필수 기술 키워드3"]
    }
  ]
}
`;

    const parsed = await generateManufacturingJson(prompt);
    res.json(parsed);
  } catch (error: any) {
    console.error('Interview Questions Error:', error);
    res.status(500).json({ error: error.message || '면접 문항 생성 중 오류가 발생했습니다.' });
  }
});

// 5. Mock Interview Answer Evaluation API
app.post('/api/gemini/mock-interview-eval', async (req: Request, res: Response) => {
  try {
    const { question, candidateAnswer, tier, keyKeywords } = req.body;
    if (!candidateAnswer || !question) {
      res.status(400).json({ error: '질문과 지원자 답변을 입력해주세요.' });
      return;
    }

    const prompt = `
기술 면접 질문 (${tier || '도메인 융합 기술 면접'}):
"${question}"

평가 필수 키워드: ${JSON.stringify(keyKeywords || [])}

지원자가 실제로 제출한 답변:
"""
${candidateAnswer.trim()}
"""

시니어 제조DX 아키텍트이자 수석 기술 면접관 관점에서 지원자의 위 답변을 엄격하고 정밀하게 채점하십시오.
지원자가 답변에 실제로 쓴 단어와 논리를 분석하여 점수(0~100점), 강점, 현장 실무 관점의 약점, 실제로 사용한 키워드 vs 누락한 키워드, 그리고 이 질문에 대한 완벽한 1분 모범 구두 답변(Model Answer)을 작성하십시오.

응답 형식 (JSON만 출력):
{
  "score": 85,
  "verdict": "지원자 답변 수준에 대한 한 줄 판정 (예: 우수 - 현장 버퍼링 논리는 명확하나 시간 동기화 언급 보완 필요)",
  "strengths": ["지원자 답변에서 실제로 잘 언급한 공학적 강점 2가지"],
  "weaknesses": ["지원자 답변에서 누락되었거나 현장 엔지니어 관점에서 아쉬운 논리적 빈틈 2가지"],
  "used_keywords": ["지원자가 답변에 실제로 포함시킨 핵심 기술 용어들"],
  "missed_keywords": ["필수 키워드 중 지원자 답변에서 빠진 키워드들"],
  "architect_critique": "지원자의 답변 내용을 직접 인용하며 코칭하는 수석 면접관의 피드백 (2~3문장)",
  "model_answer": "이 질문에 대해 면접장에서 1분 내외로 답변할 수 있는 최고 수준의 현장형 모범 구두 답변 전문 (PREP 두괄식 구조, 4~5문장)"
}
`;

    const parsed = await generateManufacturingJson(prompt);
    res.json(parsed);
  } catch (error: any) {
    console.error('Mock Interview Eval Error:', error);
    res.status(500).json({ error: error.message || '답변 평가 중 오류가 발생했습니다.' });
  }
});

// 6. AX Trend Brief & Tailored Pitch Generator API
app.post('/api/gemini/ax-trend-speech', async (req: Request, res: Response) => {
  try {
    const { targetCompany, industrySector, projectSummary } = req.body;

    const prompt = `
지원자 맞춤 입력 정보:
- 목표 기업: "${targetCompany || '글로벌 제조 기업'}"
- 산업 분야 및 목표 라인: "${industrySector || '첨단 제조 공정 라인'}"
- 지원자 핵심 프로젝트/역량 요약: "${projectSummary || '센서 데이터 처리 및 AI 이상 탐지 파이프라인'}"

위 3가지 입력사항("${targetCompany}", "${industrySector}", "${projectSummary}")에 정확히 맞춘 최신 제조DX/AX 트렌드 3가지와, 면접장에서 바로 구두로 발화할 수 있는 '1분 자기소개 & 기술 어필 스피치 대본'을 작성하십시오.

응답 형식 (JSON만 출력):
{
  "industry_trends": [
    {
      "trend_name": "${industrySector} 분야의 자율제조 AX (Autonomous Manufacturing) 트렌드 명칭",
      "core_content": "${targetCompany} 및 ${industrySector} 공정에서 실제로 일어나는 기술 변화와 핵심 아키텍처 설명 (2문장)",
      "plant_application": "현장 라인 적용 시 공정 산포(Cpk), 수율(FTY), 가동률(OEE) 측면의 기대 효과"
    },
    {
      "trend_name": "${industrySector} 분야의 설비 예지보전(PdM) 및 센서 데이터 파이프라인 트렌드",
      "core_content": "다변량 시계열 센서 및 비전 데이터를 활용한 실시간 이상 감지 및 수명 예측(RUL) 동향 (2문장)",
      "plant_application": "돌발 라인 셧다운 방지 및 MTBF/MTTR 개선 효과"
    },
    {
      "trend_name": "${industrySector} 분야의 디지털 트윈 & 가상 시운전 (Virtual Commissioning) 트렌드",
      "core_content": "PLC 제어 로직 검증, 물류 최적화 및 공정 시뮬레이션 적용 동향 (2문장)",
      "plant_application": "신규 라인 셋업 및 양산 램프업(Ramp-up) 기간 단축 효과"
    }
  ],
  "one_minute_pitch": {
    "title": "${targetCompany} (${industrySector}) 맞춤형 1분 기술 엘리베이터 피치",
    "script": "안녕하십니까, ${targetCompany} ${industrySector} 직무에 지원한 엔지니어 OOO입니다... 로 시작하여 지원자의 프로젝트('${projectSummary}') 경험과 현장 Takt Time/수율 기여 방안을 유기적으로 엮은 실전 1분 스피치 전문 (약 400~500자 내외)",
    "highlight_keywords": ["스피치에서 강조해야 할 핵심 기술 키워드 4가지"],
    "delivery_tips": "면접관에게 ${targetCompany} 현장 엔지니어다운 인상을 남기기 위한 발화 속도, 강조 포인트 코칭 팁"
  }
}
`;

    const parsed = await generateManufacturingJson(prompt);
    res.json(parsed);
  } catch (error: any) {
    console.error('AX Trend Error:', error);
    res.status(500).json({ error: error.message || '트렌드 및 스피치 생성 중 오류가 발생했습니다.' });
  }
});

// Setup Vite or static serving
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ManuDX Coach server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
