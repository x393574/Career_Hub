import express, { Request, Response } from 'express';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
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

  // Google AI Studio 표준 최신 모델 적용
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
app.post(['/api/gemini/company-explorer', '/gemini/company-explorer'], async (req: Request, res: Response) => {
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
      "process_name": "구체적 공정명",
      "equipment": "핵심 설비명 및 물리적·화학적 상태 변화 설명",
      "ot_data": "수집 센서, 계측 물리량, 산업용 프로토콜 및 샘플링 주기 명시",
      "pain_points": "해당 공정에서 자주 발생하는 품질 불량, 설비 마모, 공정 산포 등 고질적 병목(Pain Point)"
    }
  ],
  "actual_dx_initiatives": [
    {
      "title": "해당 기업에서 실제 추진 중이거나 핵심인 제조DX/AX 과제명",
      "tech_stack": "적용 기술 스택",
      "expected_effect": "정량적/정성적 목표 효과"
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
app.post(['/api/gemini/job-diagnosis', '/gemini/job-diagnosis'], async (req: Request, res: Response) => {
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
${userExperience ? userExperience.trim() : '지원자 이력 미입력'}
"""

위 채용 공고문과 지원자의 보유 이력을 1:1로 엄격히 대조하여 정밀 파싱 및 적합도 진단을 수행하십시오.

응답 형식 (JSON만 출력):
{
  "target_role": "공고에서 추출한 정확한 기업/직무명 및 담당 도메인",
  "manufacturing_type": "이산 제조 또는 연속/배치 제조",
  "purdue_focus_levels": ["공고 직무가 주로 다루는 Purdue 계층들"],
  "required_skills": ["공고문에서 추출한 필수 지원 자격 요건들"],
  "preferred_skills": ["공고문에서 추출한 우대 사항 요건들"],
  "technical_stack": {
    "languages": ["요구 프로그래밍 언어들"],
    "frameworks_ai": ["요구 AI/데이터/비전 프레임워크들"],
    "protocols_db": ["요구 산업용 통신 프로토콜 및 DB들"],
    "automation_tools": ["요구 설비 제어/자동화/MES 툴들"]
  },
  "match_score": {
    "overall": 80,
    "requirement_check": true,
    "requirement_comment": "필수 요건 충족 분석",
    "tech_stack_score": 82,
    "tech_stack_comment": "기술 매칭 분석",
    "domain_fit_score": 78,
    "domain_fit_comment": "도메인 적합도 평가"
