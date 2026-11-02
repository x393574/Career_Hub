export interface PurdueLevelInfo {
  level: string;
  name: string;
  koreanName: string;
  devices: string[];
  protocols: string[];
  dataCharacteristics: string;
  roleInSmartFactory: string;
  interviewTip: string;
}

export const PURDUE_MODEL_LEVELS: PurdueLevelInfo[] = [
  {
    level: 'Level 0',
    name: 'Physical Process & Field Devices',
    koreanName: '현장 설비 및 센서·계측 계층',
    devices: ['온도/압력/유량/진동 센서', '로드셀', '모터 드라이브', '서보 액추에이터', '솔레노이드 밸브', '방사선 게이지'],
    protocols: ['4-20mA 아날로그 전류 루프', '0-10V 전압 신호', 'IO-Link', 'HART', 'RS-485'],
    dataCharacteristics: '마이크로초~밀리초(ms) 단위의 원시 아날로그/디지털 물리 전기 신호. 노이즈 및 드리프트 빈번.',
    roleInSmartFactory: '실제 물리적 가공, 변형, 화학 반응이 일어나는 지점. 모든 데이터 수집의 근원지.',
    interviewTip: '"센서 노이즈 필터링(칼만 필터, 이동평균)과 센서 드리프트 보정 기법을 알고 있는지 어필하십시오."'
  },
  {
    level: 'Level 1',
    name: 'Direct Sensing & Manipulation (Control)',
    koreanName: '직접 제어 계층 (PLC / DCS / RTU)',
    devices: ['PLC (Siemens S7, LS XGT, Mitsubishi MELSEC, Rockwell ControlLogix)', 'DCS 컨트롤러', 'Safety PLC', 'CNC 컨트롤러'],
    protocols: ['Profinet', 'EtherNet/IP', 'Modbus RTU/TCP', 'CC-Link', 'CANopen'],
    dataCharacteristics: '스캔 타임(1~10ms) 기반의 결정론적(Deterministic) I/O 래더 로직 처리 데이터.',
    roleInSmartFactory: '설비의 물리적 모션을 직접 제어하고 인터락(Interlock) 및 비상 정지를 수행하는 핵심 두뇌.',
    interviewTip: '"소프트웨어 엔지니어가 PLC 스캔 주기와 메모리 맵(M, D, W 영역)의 I/O 주소를 이해하고 있음을 강조하면 강력한 차별점이 됩니다."'
  },
  {
    level: 'Level 2',
    name: 'Supervisory Control & Edge IPC',
    koreanName: '감시 제어 및 현장 엣지 계층 (SCADA / HMI / Edge IPC)',
    devices: ['SCADA 서버', '현장 오퍼레이터 HMI 터치패널', '산업용 PC (Advantech, Siemens IPC)', 'GPU 가속 Edge 노드'],
    protocols: ['OPC-UA', 'OPC-DA', 'Modbus TCP', 'MQTT (Sparkplug B)', 'SECS/GEM (반도체/FPD)'],
    dataCharacteristics: '초(sec)~밀리초 단위 수집, 시계열 데이터 변환, 로컬 머신비전 추론 및 알람 처리.',
    roleInSmartFactory: '현장 작업자 감시 제어 및 IT 클라우드/MES로 데이터를 브릿징하는 최전선 관문.',
    interviewTip: '"통신 단절 시 링 버퍼(Ring Buffer)를 통한 로컬 데이터 캐싱 및 재연결 동기화 구조를 설계해봤다고 발언하십시오."'
  },
  {
    level: 'Level 3',
    name: 'Manufacturing Operations Management (MOM/MES)',
    koreanName: '제조 실행 및 운영 관리 계층 (MES / QMS / WMS / CMMS)',
    devices: ['MES 서버', '품질관리시스템(QMS)', '창고관리시스템(WMS)', '설비보전관리(CMMS)', 'FDC/YMS 서버'],
    protocols: ['RESTful API', 'gRPC', 'Kafka', 'AMQP', 'Database Connectors (JDBC/ODBC)'],
    dataCharacteristics: '제품 롯(Lot) 단위, 바코드/RFID 스캔 데이터, 공정 진행 실적, 수율, 설비 가동/비가동 이력.',
    roleInSmartFactory: '생산 계획을 현장 단위 작업 지시로 전달하고, 공정 진행 상태와 품질 이력을 추적(Traceability).',
    interviewTip: '"단순 AI 모델링을 넘어 MES의 작업 지시(Work Order) 및 품질 판정 인터락과 모델 추론 결과가 연계되는 파이프라인을 언급하십시오."'
  },
  {
    level: 'Level 4',
    name: 'Business Planning & Enterprise IT',
    koreanName: '전사 자원 관리 및 비즈니스 계층 (ERP / SCM / Enterprise Lake)',
    devices: ['ERP 시스템 (SAP, Oracle)', 'SCM 공급망 플랫폼', '클라우드 데이터 레이크 (Snowflake, BigQuery, AWS/GCP)'],
    protocols: ['HTTPS / OAuth2', 'EDI', 'GraphQL', 'ETL/ELT Batch Pipelines'],
    dataCharacteristics: '일/주/월 단위의 비즈니스 지표, 원자재 발주, 납기, 원가, 글로벌 공장 통합 수율.',
    roleInSmartFactory: '전사 자원 배분 및 글로벌 공장 간 생산량 조율, 경영진 의사결정 지원.',
    interviewTip: '"Level 0에서 발생한 미세 결함 데이터가 Level 4의 원가 손실 및 고객 납기 지연에 어떤 비즈니스 영향을 주는지 연결하여 설명하십시오."'
  }
];

export interface MetricDefinition {
  name: string;
  fullName: string;
  category: string;
  formula: string;
  description: string;
  interviewContext: string;
}

export const MANUFACTURING_METRICS: MetricDefinition[] = [
  {
    name: 'OEE',
    fullName: 'Overall Equipment Effectiveness (설비종합효율)',
    category: '생산성 및 가동 효율',
    formula: 'OEE = 시간가동률(Availability) × 성능가동률(Performance) × 양품률(Quality)',
    description: '설비가 계획된 조업 시간 동안 얼마나 최대 속도로 양품만을 생산했는지를 나타내는 글로벌 표준 종합 생산성 지표. 글로벌 선진 공장의 벤치마크는 대개 85% 이상(월드클래스)입니다.',
    interviewContext: '가동률 저하(고장/정비), 성능 저하(순간 정지/속도 저하), 품질 저하(불량/재작업) 중 본인의 AI/DX 솔루션이 어떤 지표를 개선하는지 명확히 구분해야 합니다.'
  },
  {
    name: 'FTY',
    fullName: 'First Throughput Yield (직행율)',
    category: '품질 지표',
    formula: 'FTY = (투입 수량 - 재작업 수량 - 폐기 수량) / 투입 수량 × 100 (%)',
    description: '공정 도중 재작업(Rework)이나 수정 조치 없이 단번에 통과하여 최종 완성된 양품의 비율. 단순 최종 수율(누적 양품 수량)보다 공정의 실질적 비용과 낭비를 정직하게 보여줍니다.',
    interviewContext: '재작업은 설비 가동 시간과 인건비를 낭비하므로, 인라인 검사를 통해 직행율(FTY)을 높이는 것이 DX의 핵심 가치임을 어필합니다.'
  },
  {
    name: 'Takt Time vs Cycle Time',
    fullName: 'Takt Time (고객 요구 박자) vs Cycle Time (실제 가공 주기)',
    category: '공정 밸런싱',
    formula: 'Takt Time = 가용 순 가동 시간 / 고객 일일 요구 수량 | Cycle Time = 단위 제품 실가공 소요 시간',
    description: 'Takt Time은 시장의 고객 수요 속도이며, Cycle Time은 현장 설비가 부품 1개를 완성하는 실제 시간입니다. Cycle Time > Takt Time이면 납기 미달이 발생하고, 반대면 과잉 재공(WIP)이 쌓입니다.',
    interviewContext: 'AI 모델의 추론 지연시간(Latency)은 반드시 공정의 Cycle Time 및 여유 시간(Buffer)보다 짧아야 설비 인터락에 병목을 주지 않는다는 점을 강조하십시오.'
  },
  {
    name: 'MTBF & MTTR',
    fullName: 'Mean Time Between Failures & Mean Time To Repair',
    category: '설비 신뢰성 및 보전',
    formula: 'MTBF = 총 가동 시간 / 고장 횟수 | MTTR = 총 고장 수리 시간 / 고장 횟수',
    description: 'MTBF는 설비가 고장 없이 작동하는 평균 수명/간격(신뢰성 지표), MTTR은 고장 발생 후 복구에 걸리는 평균 수리 시간(보전성 지표)입니다.',
    interviewContext: '예지보전(PdM) 모델은 MTBF를 획기적으로 늘려 돌발 정지를 방지하고, 사전 고장 부품을 특정하여 MTTR을 50% 이상 단축시키는 데 목적이 있습니다.'
  },
  {
    name: '비대칭 비용 매트릭스',
    fullName: 'False Alarm (오탐) vs Missed Detection (미탐) Cost Matrix',
    category: '제조 AI 의사결정',
    formula: 'Total Cost = (FP × 오탐 셧다운 비용) + (FN × 불량 유출 클레임 비용)',
    description: '일반 IT에서는 Precision과 Recall의 단순 조화평균(F1-score)을 보지만, 공장에서는 오탐으로 수억 원대 라인이 멈추는 손실 vs 치명 불량이 고객사로 유출되어 리콜되는 손실이 완전히 다릅니다.',
    interviewContext: '면접관이 "F1-Score 몇 점이었나요?"라고 물었을 때, "단순 F1-Score에 머물지 않고 현장 오탐/미탐 비용 매트릭스를 고려하여 F-beta 가중치 및 Threshold를 튜닝했습니다"라고 답변해야 최고점을 받습니다.'
  }
];
