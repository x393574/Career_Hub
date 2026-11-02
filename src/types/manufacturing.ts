export type ManufacturingType = '이산 제조 (Discrete Manufacturing)' | '연속/배치 제조 (Process/Batch Manufacturing)';

export interface PipelineStep {
  step: number;
  process_name: string;
  equipment: string;
  ot_data: string;
  pain_points: string;
}

export interface DxInitiative {
  title: string;
  tech_stack: string;
  expected_effect: string;
}

export interface CompanyProcessProfile {
  company_name: string;
  manufacturing_type: ManufacturingType | string;
  main_site: string;
  site_overview?: string;
  pipeline_steps: PipelineStep[];
  actual_dx_initiatives?: DxInitiative[];
  interview_pitch_template: string;
  purdue_level_breakdown?: {
    level0_1: string;
    level2: string;
    level3: string;
    level4: string;
  };
}

export interface RadarMetric {
  subject: string;
  score: number;
  fullMark: number;
}

export interface JobAnalysis {
  target_role: string;
  manufacturing_type: string;
  purdue_focus_levels?: string[];
  required_skills: string[];
  preferred_skills: string[];
  technical_stack?: {
    languages?: string[];
    frameworks_ai?: string[];
    protocols_db?: string[];
    automation_tools?: string[];
  };
  match_score: {
    overall: number;
    requirement_check: boolean;
    requirement_comment?: string;
    tech_stack_score: number;
    tech_stack_comment?: string;
    domain_fit_score: number;
    domain_fit_comment?: string;
  };
  radar_metrics?: RadarMetric[];
  critical_gaps?: string[];
  recommended_appeal_points?: string[];
}

export interface BeiProbeQuestion {
  id: number;
  category: string;
  question: string;
  reason: string;
  suggested_placeholder?: string;
}

export interface StarResume {
  situation: string;
  task: string;
  action: string;
  result: string;
}

export interface PrepSpeech {
  point: string;
  reason: string;
  example: string;
  point_summary: string;
}

export interface ExperienceSynthesis {
  project_title?: string;
  key_technologies?: string[];
  applied_points?: string[];
  star_resume: StarResume;
  prep_speech: PrepSpeech;
}

export interface BeiProbingResponse {
  bei_probing_questions: BeiProbeQuestion[];
  experience_synthesis: ExperienceSynthesis;
  critic_feedback?: string;
}

export interface InterviewQuestionItem {
  tier: string;
  topic?: string;
  question: string;
  intent: string;
  key_keywords: string[];
}

export interface MockInterviewEval {
  score: number;
  verdict: string;
  strengths: string[];
  weaknesses: string[];
  used_keywords: string[];
  missed_keywords: string[];
  architect_critique: string;
  model_answer: string;
}

export interface IndustryTrendItem {
  trend_name: string;
  core_content: string;
  plant_application: string;
}

export interface AxTrendResponse {
  industry_trends: IndustryTrendItem[];
  one_minute_pitch: {
    title: string;
    script: string;
    highlight_keywords: string[];
    delivery_tips: string;
  };
}

export interface CuratedJob {
  id: string;
  company: string;
  role: string;
  division: string;
  location: string;
  manufacturingType: ManufacturingType | string;
  purdueLevel: string;
  keySkills: string[];
  summary: string;
  taktTimeContext: string;
}
