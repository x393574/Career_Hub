import { CuratedJob } from '../types/manufacturing';

export const CURATED_JOBS: CuratedJob[] = [
  {
    id: 'samsung-ds-dx',
    company: '삼성전자 DS부문',
    role: '스마트팩토리 / 제조AI 솔루션 엔지니어',
    division: 'Foundry / 메모리 제조기술센터',
    location: '경기 화성 / 평택 캠퍼스',
    manufacturingType: '이산 제조 (Discrete Manufacturing)',
    purdueLevel: 'Level 2~3 (Edge IPC / FDC / MES)',
    keySkills: ['Python', 'C/C++', 'SECS/GEM', 'Kafka', 'TensorRT', 'FDC 이상탐지', 'Takt Time 최적화'],
    summary: '반도체 전/후공정 설비에서 발생하는 초고속 센서 데이터 파이프라인 구축, 웨이퍼 결함 AI 검출 모델 개발 및 Edge IPC 배포.',
    taktTimeContext: '웨이퍼 이송 및 노광/식각 공정 사이클 타임(수십 초 단위) 내 실시간 FDC 이상 분류'
  },
  {
    id: 'hyundai-smart-factory',
    company: '현대자동차',
    role: '생산기술 / 스마트팩토리 가상검증 및 DX',
    division: '생산기술본부 제조솔루션센터',
    location: '울산 / 남양연구소 / 싱가포르(HMGICS)',
    manufacturingType: '이산 제조 (Discrete Manufacturing)',
    purdueLevel: 'Level 1~3 (PLC / SCADA / 디지털 트윈)',
    keySkills: ['PLC (Siemens/Rockwell)', 'C# / Python', 'OPC-UA', 'Process Simulate', 'AGV/AMR 군집제어', '너트러너 토크곡선'],
    summary: '자동차 차체/의장 조립 라인의 디지털 트윈 가상 시운전, 전동 체결 토크 시계열 불량 탐지 및 로봇/AMR 통신 인터페이스 개발.',
    taktTimeContext: '차량 1대당 생산 Takt Time 45~60초 엄수, 초당 센서 수집 및 0.5초 이내 체결 판정'
  },
  {
    id: 'lges-battery-dx',
    company: 'LG에너지솔루션',
    role: '배터리 공정DX / 지능화 솔루션 개발',
    division: '생산기술원 / 배터리연구소',
    location: '충북 오창 / 대전 기술원',
    manufacturingType: '연속/배치 (전극) + 이산 조립 (조립/화성)',
    keySkills: ['Python', 'PyTorch', 'OpenCV', '라인스캔 비전', '시계열 dQ/dV 분석', 'Modbus TCP', 'Edge AI'],
    purdueLevel: 'Level 1~3 (센서 / 머신비전 / 공정 MES)',
    summary: '롤투롤 코팅 핀홀 및 전극 버(Burr) 실시간 비전 전수 검사 시스템 구축, 화성 충방전 시계열 분석을 통한 배터리 수명 예측.',
    taktTimeContext: '100m/min 고속 주행 롤투롤 연속 라인에서 10μm 미세 결함 인라인 실시간 검출'
  },
  {
    id: 'posco-smart-steel',
    company: 'POSCO',
    role: '스마트팩토리 제어계측 및 AI 엔지니어',
    division: '포항/광양 제철소 생산기술부',
    location: '경북 포항 / 전남 광양',
    manufacturingType: '연속/배치 제조 (Process/Batch Manufacturing)',
    purdueLevel: 'Level 0~2 (계측센서 / DCS / APC 자율제어)',
    keySkills: ['고온 열화상 영상처리', '다변량 시계열 분석', 'DCS / PLC 연동', 'FFT 진동 엔벨로프', 'PdM 예지보전'],
    summary: '스마트 고로 쇳물 온도 예측 자율제어 알고리즘 개발, 열간 압연 롤러 고주파 진동 분석을 통한 파손 조기 예지보전 시스템 운영.',
    taktTimeContext: '24시간 365일 무중단 연속 제철 플랜트의 에너지 원단위 절감 및 대형 브레이크아웃 사전 차단'
  },
  {
    id: 'skhynix-fab-ai',
    company: 'SK하이닉스',
    role: 'Fab 데이터 분석 및 공정제어(APC/FDC)',
    division: '제조/기술담당 미래기술연구원',
    location: '경기 이천 / 충북 청주',
    manufacturingType: '이산 제조 (Discrete Manufacturing)',
    purdueLevel: 'Level 2~4 (APC / 수율예측 / 엔터프라이즈 레이크)',
    keySkills: ['시계열 머신러닝', 'SECS/GEM', 'SPC 통계적 품질관리', 'R/Python/SQL', '클러스터 이상치'],
    summary: 'HBM 첨단 패키징 및 초미세 메모리 공정 산포 축소를 위한 가상 계측(Virtual Metrology) 모델 구축 및 피드포워드 APC 제어.',
    taktTimeContext: '수백 개 반도체 단위 공정 간 피드포워드/피드백 제어로 Cpk 1.67 이상 확보'
  },
  {
    id: 'hanwha-aero-smart',
    company: '한화에어로스페이스',
    role: '정밀가공 공정 스마트팩토리 & 예지보전',
    division: '창원 항공엔진공장 생산기술팀',
    location: '경남 창원',
    manufacturingType: '이산 제조 (정밀가공 / 조립)',
    purdueLevel: 'Level 0~2 (CNC 공작기계 / 가속도 센서 / SCADA)',
    keySkills: ['CNC 화낙(Fanuc)/지멘스 연동', '공구 마모 진동 음향방출(AE)', 'C# / Python', 'OPC-UA', 'Edge Computing'],
    summary: '항공기 가스터빈 블레이드 5축 가공기 공구 마모 실시간 모니터링 및 채터 진동(Chatter Vibration) 회피 자율 제어기 개발.',
    taktTimeContext: '고가 난삭재 부품 가공 불량 방지를 위한 10ms 단위 초고속 공구 절삭력 모니터링'
  }
];

export const PRESET_JD_TEXTS = {
  samsung_ds: `[삼성전자 DS부문] 스마트팩토리 제조AI / SW 엔지니어
[주요 업무]
- 반도체 팹 내 설비 센서 데이터 수집 및 실시간 FDC(고장감지분류) 파이프라인 개발
- 웨이퍼 표면 미세 결함 인라인 비전 AI 모델 개발 및 고속 Edge IPC(TensorRT) 배포
- SECS/GEM 및 HSMS 프로토콜 기반 설비 인터페이스 연동 및 공정 데이터 정제
- 수율 향상 및 공정 산포 개선을 위한 다변량 시계열 통계 분석(SPC) 및 APC 모델 구축

[필수 요건]
- 컴퓨터공학, 전자전기, 기계공학, 산업공학 등 관련 전공 학사 이상
- Python, C/C++ 중 1개 이상 능숙한 프로그래밍 역량
- 데이터베이스(RDBMS, NoSQL, Time-series DB) 쿼리 및 파이프라인 구축 경험
- 통계 분석, 머신러닝/딥러닝 기본 지식 보유자

[우대 사항]
- 반도체 8대 공정 및 단위 설비에 대한 이해 보유자
- 산업용 통신 프로토콜(SECS/GEM, OPC-UA, MQTT) 연동 프로젝트 경험자
- Edge 컴퓨팅 최적화(TensorRT, ONNX Runtime, C++ 추론 파이프라인) 경험자
- 공장 설비 이상 탐지(Anomaly Detection) 또는 컴퓨터 비전 결함 검출 프로젝트 경험자`,

  hyundai_smart: `[현대자동차] 생산기술본부 스마트팩토리 가상검증 & DX 엔지니어
[주요 업무]
- 자동차 의장 및 차체 조립 라인의 스마트팩토리 제어 및 데이터 모니터링 시스템 구축
- 스마트 너트러너 전동 체결 토크/각도 곡선 시계열 데이터 수집 및 불량 조기 판정 모델 개발
- Siemens Process Simulate 기반 디지털 트윈 가상 시운전(Virtual Commissioning) 수행
- AGV/AMR 군집 물류 관제 및 PLC(Siemens/Rockwell) 인터페이스 연동

[필수 요건]
- 기계, 전기전자, 메카트로닉스, 컴퓨터공학 관련 학사 이상
- C#, Python, C++ 중 1개 이상 프로그래밍 가능자
- 산업용 네트워크 및 제어기(PLC, IPC, HMI) 기본 원리 이해자

[우대 사항]
- OPC-UA, Modbus TCP, Profinet 등 산업용 프로토콜 실무 연동 경험자
- 실제 설비 제어 로직(Ladder Logic) 작성 또는 시운전 참여 경험자
- 제조 현장 Takt Time 관리 및 설비종합효율(OEE) 개선 프로젝트 유경험자
- 컴퓨터 비전 또는 1D 시계열 센서 이상치 탐지 알고리즘 개발 역량 보유자`,

  lges_battery: `[LG에너지솔루션] 배터리 셀 제조DX / 공정 지능화 엔지니어
[주요 업무]
- 롤투롤(Roll-to-Roll) 코팅/롤프레싱/슬리팅 공정 인라인 머신비전 결함 검사 파이프라인 개발
- 라인스캔 카메라 및 GPU 기반 엣지 AI 결함 검출(전극 버, 핀홀, 이물) 모델 경량화 배포
- 화성 공정 충방전 시계열 프로파일(dQ/dV, OCV, IR) 데이터 기반 셀 품질 판정 AI 모델 개발
- 제조 현장 센서(온도, 압력, 웹 텐션 로드셀) 데이터 수집 및 공정 제어기(PLC) 인터페이스 연계

[필수 요건]
- 전기전자, 컴퓨터, 화학공학, 신소재 등 관련 전공 학사 이상
- Python 기반 딥러닝 프레임워크(PyTorch, OpenCV) 능숙자
- 현장 계측 데이터 및 이미지 데이터 처리 경험자

[우대 사항]
- 배터리 제조 공정(믹싱-코팅-롤프레스-조립-활성화) 이해 보유자
- 고속 연속 공정(100m/min)에서의 실시간 이미지 추론 파이프라인 최적화 경험
- 불균형 데이터셋(희귀 불량)에 대한 Data Augmentation 및 Anomaly Detection 기법 적용자
- MES 연동 및 스마트팩토리 데이터 수집 인프라 구축 경험자`
};

export const SAMPLE_CANDIDATE_EXPERIENCES = [
  {
    title: '모터 진동 가속도 센서 FFT 기반 베어링 결함 분류 모델 (학부 캡스톤)',
    text: `학부 4학년 캡스톤 디자인 프로젝트로 산업용 회전 모터의 베어링 결함을 진단하는 시스템을 만들었습니다.
ADXL345 3축 가속도 센서를 모터 케이싱에 부착하여 아두이노를 통해 1kHz 샘플링 속도로 진동 데이터를 수집했습니다.
수집된 시계열 진동 신호를 Python SciPy로 FFT(고속 푸리에 변환)를 수행하여 주파수 스펙트럼으로 변환했고,
정상, 볼 결함, 내륜 결함, 외륜 결함 4가지 상태를 분류하는 1D CNN 모델을 PyTorch로 구현했습니다.
최종 분류 정확도 94%를 얻었으며, 이를 로컬 대시보드에서 시각화했습니다.`
  },
  {
    title: '부품 표면 스크래치 결함 검출 YOLOv8 비전 파이프라인 (부트캠프)',
    text: `제조 지능화 국비 부트캠프에서 금속 부품 표면의 스크래치와 찍힘 결함을 검사하는 자동화 파이프라인을 구축했습니다.
공개 금속 표면 데이터셋(NEU surface defect) 1,800장을 사용하여 YOLOv8 모델을 파인튜닝했습니다.
검출 속도를 향상시키기 위해 ONNX Runtime과 TensorRT로 모델을 양자화하여 웹캠 실시간 영상에서 35 FPS 추론을 달성했습니다.
검출된 불량 좌표와 클래스를 Fast-API 백엔드를 통해 웹 브라우저 대시보드로 전송하고 DB에 기록하는 프로토타입을 완성했습니다.`
  },
  {
    title: 'PLC Modbus TCP 통신 기반 3축 액추에이터 상태 모니터링 (연구실 산학)',
    text: `대학 연구실에서 중소 제조기업 산학 프로젝트로 직교 3축 서보 모터의 동작 상태를 모니터링했습니다.
LS ELECTRIC XGT 시리즈 PLC와 산업용 PC 간에 Modbus TCP 통신(포트 502)을 연결하여 100ms 주기로 서보 드라이브의 현재 위치, 모터 부하율, 에러 코드를 폴링했습니다.
Python pymodbus 라이브러리로 수집 클라이언트를 작성하고, 통신 끊김 발생 시 로컬 SQLite에 임시 버퍼링했다가 재연결 시 일괄 전송하는 장애 복구 로직을 구현했습니다.`
  }
];
