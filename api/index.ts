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
  // 지연 대기용 헬퍼 함수
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function generateManufacturingJson(prompt: string): Promise<any> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY가 설정되지 않았습니다.');
  }

  // 트래픽 과부하 시 순차적으로 시도할 최신 지원 모델 목록
  const candidates: Array<{ model: string; thinkingLevel: ThinkingLevel }> = [
    { model: 'gemini-3.8-flash', thinkingLevel: ThinkingLevel.LOW },
    { model: 'gemini-3.1-flash-lite', thinkingLevel: ThinkingLevel.MINIMAL },
  ];

  let lastError: any = null;

  for (const candidate of candidates) {
    // 503 과부하 발생 시 1회 자동 재시도 (최대 2번 시도)
    for (let attempt = 1; attempt <= 2; attempt++) {
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
        const errMsg = err?.message || String(err);
        const isUnavailable = errMsg.includes('503') || errMsg.includes('UNAVAILABLE') || errMsg.includes('high demand');

        console.warn(`[${candidate.model} attempt ${attempt} failed]:`, errMsg);
        lastError = err;

        // 구글 서버 일시적 과부하(503)인 경우 1.5초 대기 후 재시도
        if (isUnavailable && attempt < 2) {
          await delay(1500);
          continue;
        }
        break; // 다른 에러이거나 2회 실패 시 다음 대체 모델로 전환
      }
    }
  }

  throw lastError || new Error('현재 구글 AI 서버 혼잡으로 응답 생성에 실패했습니다. 잠시 후 다시 시도해주세요.');
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
  },
  "radar_metrics": [
    { "subject": "설비·센서 연동(OT)", "score": 75, "fullMark": 100 },
    { "subject": "시계열/비전 AI", "score": 85, "fullMark": 100 },
    { "subject": "공정제어·품질(SPC)", "score": 70, "fullMark": 100 },
    { "subject": "산업용 통신(OPC-UA/Modbus)", "score": 72, "fullMark": 100 },
    { "subject": "현장 Takt Time 대응력", "score": 68, "fullMark": 100 },
    { "subject": "시스템 아키텍처(MES/Edge)", "score": 80, "fullMark": 100 }
  ],
  "critical_gaps": ["보완해야 할 빈틈 3가지"],
  "recommended_appeal_points": ["면접 어필 전략 3가지"]
}
`;

    const parsed = await generateManufacturingJson(prompt);
    res.json(parsed);
  } catch (error: any) {
    console.error('Job Diagnosis Error:', error);
    res.status(500).json({ error: error.message || '공고 진단 중 오류가 발생했습니다.' });
  }
});

// 3. BEI Probing & STAR / PREP API
app.post(['/api/gemini/bei-probing', '/gemini/bei-probing'], async (req: Request, res: Response) => {
  try {
    const { rawExperience, targetCompany, answeredProbes, currentQuestions, mode } = req.body;
    if (!rawExperience || !rawExperience.trim()) {
      res.status(400).json({ error: '프로젝트 또는 경험 메모를 입력해주세요.' });
      return;
    }

    const isResynthesize = mode === 'resynthesize' && answeredProbes && Object.keys(answeredProbes).length > 0;
    let probeContext = '아직 꼬리질문 답변 전 단계';
    if (isResynthesize) {
      const qaPairs = (currentQuestions || []).map((q: any) => {
        const ans = answeredProbes[q.id] || '(미답변)';
        return `[질문 ${q.id}: ${q.category}] ${q.question}\n👉 지원자 답변: ${ans}`;
      }).join('\n\n');
      probeContext = `지원자가 3대 BEI 꼬리질문에 대해 추가 답변을 작성했습니다. 이 답변 내용을 STAR/PREP에 통합하십시오:\n\n${qaPairs}`;
    }

    const prompt = `
지원자 프로젝트 메모:
"""
${rawExperience.trim()}
"""
목표 기업: "${targetCompany || '첨단 제조 대기업'}"
컨텍스트:
"""
${probeContext}
"""

응답 형식 (JSON만 출력):
{
  "bei_probing_questions": [
    {
      "id": 1,
      "category": "개인 기여도 및 독자 설계 검증",
      "question": "개인 기여도 질문",
      "reason": "검증 의도",
      "suggested_placeholder": "예시 답변"
    },
    {
      "id": 2,
      "category": "제조 데이터 실무 특성 검증",
      "question": "데이터 불균형/노이즈 처리 질문",
      "reason": "검증 의도",
      "suggested_placeholder": "예시 답변"
    },
    {
      "id": 3,
      "category": "현장 제약조건 및 Takt Time 검증",
      "question": "추론 속도 및 Takt Time 질문",
      "reason": "검증 의도",
      "suggested_placeholder": "예시 답변"
    }
  ],
  "experience_synthesis": {
    "project_title": "공학적으로 재정의한 프로젝트 명칭",
    "key_technologies": ["핵심 기술 키워드 5~7개"],
    "applied_points": ["반영된 핵심 포인트 3가지"],
    "star_resume": {
      "situation": "Situation",
      "task": "Task",
      "action": "Action",
      "result": "Result"
    },
    "prep_speech": {
      "point": "두괄식 결론",
      "reason": "기술 채택 이유",
      "example": "문제 해결 사례",
      "point_summary": "기여 포부"
    }
  },
  "critic_feedback": "수석 면접관 총평"
}
`;

    const parsed = await generateManufacturingJson(prompt);
    res.json(parsed);
  } catch (error: any) {
    console.error('BEI Probing Error:', error);
    res.status(500).json({ error: error.message || 'BEI 검증 중 오류가 발생했습니다.' });
  }
});

// 4. Interview Questions API
app.post(['/api/gemini/interview-questions', '/gemini/interview-questions'], async (req: Request, res: Response) => {
  try {
    const { targetCompany, targetRole, techStack, projectBrief } = req.body;
    const prompt = `
대상 기업: "${targetCompany || '첨단 제조 기업'}", 지원 직무: "${targetRole || '제조DX'}", 기술 스택: "${techStack || 'Python, PLC'}", 프로젝트: "${projectBrief || '이상 탐지'}"
위 사항에 맞춘 Tier 1, Tier 2, Tier 3 면접 문항을 생성하십시오.

응답 형식 (JSON만 출력):
{
  "questions": [
    {
      "tier": "Tier 1 (설비 데이터/인프라)",
      "topic": "주제",
      "question": "구체적 질문",
      "intent": "평가 의도",
      "key_keywords": ["키워드1", "키워드2", "키워드3"]
    },
    {
      "tier": "Tier 2 (모델링 및 현장 적용)",
      "topic": "주제",
      "question": "구체적 질문",
      "intent": "평가 의도",
      "key_keywords": ["키워드1", "키워드2", "키워드3"]
    },
    {
      "tier": "Tier 3 (BEI 프로젝트 압박)",
      "topic": "주제",
      "question": "구체적 질문",
      "intent": "평가 의도",
      "key_keywords": ["키워드1", "키워드2", "키워드3"]
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

// 5. Mock Interview Answer Eval API
app.post(['/api/gemini/mock-interview-eval', '/gemini/mock-interview-eval'], async (req: Request, res: Response) => {
  try {
    const { question, candidateAnswer, tier, keyKeywords } = req.body;
    if (!candidateAnswer || !question) {
      res.status(400).json({ error: '질문과 지원자 답변을 입력해주세요.' });
      return;
    }

    const prompt = `
질문: "${question}", 필수 키워드: ${JSON.stringify(keyKeywords || [])}
지원자 답변:
"""
${candidateAnswer.trim()}
"""
채점 점수(0~100), 강점, 약점, 사용/누락 키워드, 모범 답변을 JSON으로 작성하십시오.

응답 형식 (JSON만 출력):
{
  "score": 85,
  "verdict": "한 줄 판정",
  "strengths": ["강점 2가지"],
  "weaknesses": ["약점 2가지"],
  "used_keywords": ["사용한 키워드"],
  "missed_keywords": ["누락 키워드"],
  "architect_critique": "면접관 코칭 피드백",
  "model_answer": "1분 모범 구두 답변"
}
`;
    const parsed = await generateManufacturingJson(prompt);
    res.json(parsed);
  } catch (error: any) {
    console.error('Mock Interview Eval Error:', error);
    res.status(500).json({ error: error.message || '답변 평가 중 오류가 발생했습니다.' });
  }
});

// 6. AX Trend Brief API
app.post(['/api/gemini/ax-trend-speech', '/gemini/ax-trend-speech'], async (req: Request, res: Response) => {
  try {
    const { targetCompany, industrySector, projectSummary } = req.body;
    const prompt = `
목표 기업: "${targetCompany || '글로벌 제조 기업'}", 산업 분야: "${industrySector || '첨단 제조 공정'}", 프로젝트: "${projectSummary || '센서 데이터 이상 탐지'}"
맞춤형 제조DX/AX 트렌드 3가지와 1분 스피치 대본을 작성하십시오.

응답 형식 (JSON만 출력):
{
  "industry_trends": [
    {
      "trend_name": "트렌드명",
      "core_content": "기술 변화 설명",
      "plant_application": "기대 효과"
    }
  ],
  "one_minute_pitch": {
    "title": "1분 기술 피치",
    "script": "스피치 대본 전문",
    "highlight_keywords": ["키워드1", "키워드2"],
    "delivery_tips": "발화 코칭 팁"
  }
}
`;
    const parsed = await generateManufacturingJson(prompt);
    res.json(parsed);
  } catch (error: any) {
    console.error('AX Trend Error:', error);
    res.status(500).json({ error: error.message || '트렌드 생성 중 오류가 발생했습니다.' });
  }
});

// Vercel Serverless Function 내보내기
export default app;
