import { CompanyProcessProfile } from '../types/manufacturing';

export const PRESET_COMPANIES: Record<string, CompanyProcessProfile> = {
  '삼성전자 평택캠퍼스 P3 파운드리': {
    company_name: '삼성전자 DS부문 Foundry 사업부',
    manufacturing_type: '이산 제조 (Discrete Manufacturing)',
    main_site: '평택캠퍼스 P3 Line (EUV 첨단 미세공정 및 OHT 무인 물류)',
    site_overview: '3nm/4nm GAA(Gate-All-Around) 트랜지스터 구조를 양산하는 세계 최대 규모의 반도체 클린룸 팹. 수천 대의 OHT(Overhead Hoist Transport)가 초당 수 미터로 웨이퍼 FOUP을 자동 이송합니다.',
    pipeline_steps: [
      {
        step: 1,
        process_name: '산화 및 증착 (Oxidation & CVD/ALD)',
        equipment: '초고진공 배치로(Furnace) 및 매엽식 ALD 설비',
        ot_data: 'MFC 가스 유량(sccm), 챔버 내벽 온도(열전대 0.1℃ 단위), RF 제너레이터 반사 전력(W), 샘플링 10Hz',
        pain_points: '원자층 두께(Å) 균일도 편차, 플라즈마 아크 방전으로 인한 박막 오염, 타겟 두께 드리프트'
      },
      {
        step: 2,
        process_name: '포토리소그래피 (Photolithography)',
        equipment: 'ASML 극자외선(EUV) 0.33 NA 노광기 및 트랙 코터/디벨로퍼',
        ot_data: '웨이퍼 스테이지 간섭계 위치 정밀도(nm 단위), EUV 광원 펄스 에너지(mJ), 펠리클 투과율 모니터링',
        pain_points: 'Overlay 오정렬(1.5nm 이하 관리 필요), 레지스트 브릿지/핀홀 미세 결함, 광학계 열팽창 드리프트'
      },
      {
        step: 3,
        process_name: '식각 (Dry Etching)',
        equipment: 'ICP/CCP 플라즈마 고밀도 드라이 에처',
        ot_data: 'OES(광학발광분광법) 플라즈마 스펙트럼(200~800nm 파장), 정전척(ESC) 헬륨 냉각 압력(Torr)',
        pain_points: '종단점(EPD, End Point Detection) 오검출로 인한 과식각/미식각, 포커스 링 소모성 부품 침식'
      },
      {
        step: 4,
        process_name: '화학기계적 연마 (CMP)',
        equipment: '다축 연마 헤드 및 플래튼(Platen), 슬러리 공급 노즐',
        ot_data: '패드 컨디셔너 마찰 하중 토크(Nm), 와전류(Eddy Current) 잔여 금속 두께 실시간 센서, 모터 전류',
        pain_points: '웨이퍼 엣지 과연마(Edge Roll-off), 패드 글레이징으로 인한 연마율 급락, 마이크로 스크래치'
      },
      {
        step: 5,
        process_name: '인라인 전자빔 검사 및 FDC (Defect Inspection & FDC)',
        equipment: 'Brightfield/Darkfield 광학 검사기, 초고속 인라인 리뷰 SEM',
        ot_data: '고해상도 다이-투-다이 비교 이미지, FDC(Fault Detection & Classification) 다변량 SVID 파라미터',
        pain_points: '웨이퍼 1장당 수십만 개 결함 중 치명 결함(Killer Defect) 실시간 선별 분별력, 계측기 큐 타임 지연'
      }
    ],
    actual_dx_initiatives: [
      {
        title: 'FDC(설비 고장 감지) 및 APC(고급 공정 제어) 머신러닝 연동',
        tech_stack: 'SECS/GEM 통신, Kafka 실시간 시계열 스트리밍, AutoEncoder 이상치 탐지',
        expected_effect: '식각/증착 공정 산포 35% 축소 및 웨이퍼 스크랩 사전 방지'
      },
      {
        title: 'OHT 군집 주행 AI 지능화 및 병목 예측',
        tech_stack: '강화학습 기반 경로 플래너, MQTT/WebSocket 에이전트, 실시간 디지털 트윈',
        expected_effect: '반송 대기 시간 22% 단축 및 병목 베이(Bay) 체증 제로화'
      },
      {
        title: '웨이퍼 결함 SEM 이미지 자동 분류 (ADC)',
        tech_stack: 'TensorRT 기반 YOLOv8/ViT 앙상블, INT8 양자화 Edge IPC',
        expected_effect: '결함 분류 지연시간을 50ms 이내로 줄여 Takt Time 동기화 달성'
      }
    ],
    interview_pitch_template: '저는 귀사 평택 P3 팹의 식각 및 CMP 공정에서 발생하는 OES 분광 스펙트럼과 모터 전류 시계열 데이터를 Edge 환경에서 초당 100회 단위로 수집·전처리하고, FDC 파라미터 드리프트를 조기 감지하여 치명 결함(Killer Defect) 유출을 차단하는 현장형 제조AX 엔지니어가 되겠습니다.',
    purdue_level_breakdown: {
      level0_1: '플라즈마 정전척 헬륨 압력 센서, OES 광섬유 센서, SECS-II/HSMS 인터페이스 PLC',
      level2: '설비 EAP(Equipment Automation Program), SECS/GEM 브릿지 IPC, Edge 추론 노드',
      level3: 'FDC 이상치 분석 서버, 수율 관리 시스템(YMS), 실시간 Fab MES',
      level4: '전사 웨이퍼 빅데이터 레이크 및 ERP 공정 원가 시스템'
    }
  },

  'LG에너지솔루션 오창 에너지플랜트': {
    company_name: 'LG에너지솔루션 배터리 생산기술센터',
    manufacturing_type: '연속/배치 제조 (전극 공정) + 이산 조립 (조립/활성화 공정) 혼합형',
    main_site: '오창 에너지플랜트 2공장 (차세대 원통형 4680 및 파우치 스마트 라인)',
    site_overview: '세계경제포럼(WEF) 등대공장(Lighthouse Network) 기준에 맞춰 AI 기반 배터리 전 공정 지능화 및 실시간 품질 불량 자동 판독을 구현한 첨단 이차전지 기지입니다.',
    pipeline_steps: [
      {
        step: 1,
        process_name: '전극 믹싱 (Slurry Mixing)',
        equipment: '고속 유성식 믹서(Planetary Mixer) 및 연속식 트윈 스크루 믹서',
        ot_data: '슬러리 점도(cP, 브룩필드 센서), 고형분 함량(%), 임펠러 교반 모터 토크(Nm), 슬러리 온도',
        pain_points: '슬러리 분산 불균일로 인한 뭉침 현상, 교반 중 기포 발생, 배치 간 점도 산포'
      },
      {
        step: 2,
        process_name: '코팅 및 건조 (Roll-to-Roll Coating & Drying)',
        equipment: '슬롯다이(Slot-die) 양면 코터 및 다단 열풍 챔버',
        ot_data: '방사선(X-ray / Beta-ray) 평량 센서(g/m²), 웹 텐션 로드셀(N), 노즐 토출 압력, 건조로 윈드 스피드',
        pain_points: '두께 편차 및 무지부(Uncoated area) 슬러리 오염, 건조 수축 크랙, 코팅 핀홀'
      },
      {
        step: 3,
        process_name: '롤프레싱 (Roll Pressing / Calendering)',
        equipment: '초고압 롤프레스 롤러 및 갭 제어 유압 서보 액추에이터',
        ot_data: '롤 갭 변위 센서(0.1μm LVDT), 롤러 좌우 가압 하중(ton), 롤러 표면 온도 적외선 센서',
        pain_points: '전극 합제 과압축으로 인한 알루미늄/구리 호일 단선 및 엣지 웨이브 주름, 전극 밀도 불균일'
      },
      {
        step: 4,
        process_name: '슬리팅 & 노칭 (Slitting & Laser Notching)',
        equipment: '고속 회전 슬리터 나이프 및 고출력 피코초 파이버 레이저 노칭기',
        ot_data: '웹 이송 속도(m/min), 나이프 샤프트 진동(g), 레이저 파워(W), 인라인 머신비전 엣지 검사',
        pain_points: '나이프 마모에 따른 전극 버(Burr, 10μm 초과 시 분리막 손상 위험), 레이저 스패터 비산'
      },
      {
        step: 5,
        process_name: '조립 및 탭 웰딩 (Stacking/Winding & Tab Welding)',
        equipment: 'Z-스태킹 고속 적층기, 초음파/레이저 탭 웰더',
        ot_data: '적층 오정렬(Align) 비전 좌표, 초음파 용접 혼(Horn) 진폭(μm) 및 주울 열 에너지(J)',
        pain_points: '양/음극 분리막 오버행(Overhang) 불량, 탭 미용접 및 과용접 관통으로 인한 내부 쇼트'
      },
      {
        step: 6,
        process_name: '활성화 및 화성 공정 (Formation & Aging)',
        equipment: '고정밀 다채널 충방전기(Formation Cycler), OCV/IR 측정기',
        ot_data: '셀 전압(mV), 충전 전류(mA), OCV(개방회로전압), 내부 임피던스(AC-IR, mΩ), 셀 표면 열화상',
        pain_points: '미세 내부 단락으로 인한 자가방전 셀 선별, SEI 피막 불균일 형성, 화성 챔버 내 화재 위험'
      }
    ],
    actual_dx_initiatives: [
      {
        title: '롤투롤 코팅 두께 폐루프 실시간 자동 제어(APC)',
        tech_stack: 'X-ray 평량 계측기 피드백 + 슬롯다이 서보 립 볼트(Lip Bolt) 액추에이터 자동 제어',
        expected_effect: '전극 로딩량 산포(CPK) 1.67 달성 및 불량 로스 30% 감축'
      },
      {
        title: '컴퓨터 비전 기반 10μm 이하 전극 Burr 및 핀홀 전수 검사',
        tech_stack: '라인스캔 카메라(16K), GPU 가속 결함 탐지 모델, 불량 셀 자동 마킹 배출 트리거',
        expected_effect: '120m/min 고속 주행 상태에서 미검출률 0.001ppm 이하 유지'
      },
      {
        title: '화성 공정 충방전 dQ/dV 프로파일 분석을 통한 용량 예측',
        tech_stack: '시계열 1D-CNN + LightGBM 앙상블, 배터리 잔존 수명 및 불량 조기 판별',
        expected_effect: '에이징 기간을 3일에서 1.5일로 50% 단축하여 재공 재고 절감'
      }
    ],
    interview_pitch_template: '저는 귀사 오창 플랜트의 롤투롤 코팅 및 슬리팅 라인에서 발생하는 웹 텐션 로드셀과 라인스캔 비전 데이터를 엣지 IPC 환경에서 실시간 융합하여, 10μm 수준의 전극 버(Burr)와 슬러리 코팅 핀홀을 인라인 라인 속도(100m/min) 내에 100% 전수 검출하는 데 기여하겠습니다.',
    purdue_level_breakdown: {
      level0_1: '슬롯다이 피에조 액추에이터, X-ray 센서, 미쓰비시/지멘스 PLC, 로드셀',
      level2: '롤투롤 HMI/SCADA, 16K 라인스캔 카메라 머신비전 IPC, OPC-UA 브릿지',
      level3: '배터리 추적 MES, 화성 공정 통합 QMS, 설비 수명 CMMS',
      level4: '글로벌 배터리 공급망 ERP 및 배터리 패스포트 탄소발자국 데이터 레이크'
    }
  },

  '현대자동차 울산공장 스마트 의장라인': {
    company_name: '현대자동차 생산기술본부 제조솔루션센터',
    manufacturing_type: '이산 제조 (Discrete Manufacturing - 프레스, 차체, 도장, 의장)',
    main_site: '울산공장 전동화 전용 라인 및 싱가포르 혁신센터(HMGICS) 셀 생산 시스템',
    site_overview: '컨베이어 벨트 중심의 전통 공장을 넘어 컨베이어리스(Conveyor-less) 셀 생산 방식과 AGV/AMR 군집 제어, 로봇 자동 장착을 구현한 최첨단 스마트 팩토리입니다.',
    pipeline_steps: [
      {
        step: 1,
        process_name: '프레스 (Stamping)',
        equipment: '5,400톤 초고속 서보 프레스 라인 및 자동 트랜스퍼 피더',
        ot_data: '스트로크별 금형 가압력 톤수(Tonnage Monitor), 상하 금형 변위, 크랭크 각도, 윤활유 유압',
        pain_points: '강판 두께 편차에 따른 스프링백(Springback) 형상 오차, 금형 크랙, 스크랩 끼임 불량'
      },
      {
        step: 2,
        process_name: '차체 용접 및 실링 (Body in White)',
        equipment: '산업용 6축 다관절 로봇(현대로보틱스/KUKA), 서보 스폿 용접 건, 레이저 브레이징기',
        ot_data: '용접 2차 전류(kA), 전극 팁 가압력(kN), 다이내믹 저항 곡선, 용접 팁 마모도 카운트',
        pain_points: '스폿 용접 팁 산화로 인한 웰드 스패터(Spatter) 발생, 너겟 직경 부족으로 인한 용접 탈락'
      },
      {
        step: 3,
        process_name: '도장 (Painting & Sealing)',
        equipment: '전착 도장조, 로봇 정전 벨 도장기(Bell Applicator), 건조 오븐',
        ot_data: '도료 공급 기어 펌프 유량(cc/min), 벨 회전수(RPM 40,000), 건조로 5구역 온도 프로파일',
        pain_points: '도막 두께 불균일(Orange Peel), 정전기 먼지 흡착 결함, 건조로 온도 편차에 의한 색상 이색'
      },
      {
        step: 4,
        process_name: '의장 조립 및 체결 (Final Assembly & Bolting)',
        equipment: 'AGV 모바일 플랫폼, 스마트 전동 너트러너(Atlas Copco), 윈드실드 도포 로봇',
        ot_data: '체결 토크 곡선(Nm), 각도(Deg), 체결 시간(ms), 바코드/RFID 트래킹 데이터',
        pain_points: '볼트 오체결(Cross-thread), 미체결(Loose Bolt), 샤시 주요 보안 부품 체결 불량'
      },
      {
        step: 5,
        process_name: '최종 검사 및 EOL 전장 진단 (End of Line Inspection)',
        equipment: '휠 얼라인먼트 시험기, 샤시 다이나모미터, ADAS 센서 보정 타겟, CAN/Ethernet 진단기',
        ot_data: '차량 OBD CAN 버스 메시지, ADAS 레이더/카메라 캘리브레이션 오프셋, 브레이크 제동력',
        pain_points: '제어기(ECU) 통신 타임아웃, ADAS 레이더 조준 각도 0.1도 오차, 조향 핸들 중립 틀어짐'
      }
    ],
    actual_dx_initiatives: [
      {
        title: '스마트 너트러너 토크-각도 시계열 이상 체결 딥러닝 판독',
        tech_stack: '1D CNN + LSTM, 체결 곡선(Torque-Angle) 데이터 실시간 수집 및 현장 HMI 즉시 피드백',
        expected_effect: '나사산 마모 및 조기 착좌 불량 100% 즉시 검출 (오체결 유출 0건)'
      },
      {
        title: 'AGV/AMR 군집 주행 통합 관제 시스템(FMS)',
        tech_stack: 'VDA 5050 표준 프로토콜, 라이다(LiDAR) SLAM, 클라우드 실시간 라우팅',
        expected_effect: '부품 키팅 라인 물류 혼선 방지 및 Takt Time 정밀 동기화'
      },
      {
        title: '디지털 트윈 기반 가상 시운전 (Virtual Commissioning)',
        tech_stack: 'Siemens Process Simulate, PLCSIM Advanced, 산업용 로봇 기구학 연동',
        expected_effect: '신차종 혼류 생산 라인 개조 시 현장 셋업 기간 4주 단축'
      }
    ],
    interview_pitch_template: '저는 현대자동차 울산공장 의장 및 샤시 조립 라인의 전동 체결 공정에서 발생하는 수만 건의 토크-각도 시계열 커브를 분석하여, 크로스 스레드 및 미체결을 0.5초 Takt Time 내에 실시간 감지하고 라인 인터락(Interlock)과 연계하는 스마트팩토리 엔지니어로 활약하겠습니다.',
    purdue_level_breakdown: {
      level0_1: '로봇 용접 타이머, Atlas Copco 너트러너 컨트롤러, 로크웰/지멘스 PLC',
      level2: '라인 HMI 패널, 현장 IPC 통신 게이트웨이, Modbus TCP / Profinet 통신',
      level3: '자동차 차체 추적 MES(ALC, Assembly Line Control), 품질 피트 QMS',
      level4: '전사 SAP ERP 공급망 및 글로벌 공장 디지털 트윈 데이터베이스'
    }
  },

  'POSCO 포항제철소 스마트 고로/압연': {
    company_name: 'POSCO 생산기술전략실 / AI연구원',
    manufacturing_type: '연속/배치 제조 (Process/Batch Manufacturing - 제선, 제강, 연주, 압연)',
    main_site: '포항제철소 2열연공장 및 2고로 (대한민국 1호 세계경제포럼 등대공장)',
    site_overview: '대한민국 최초의 등대공장으로, 50년 철강 조업 노하우와 수만 개의 열화상, 초음파, 가스 분석 센서를 융합하여 인공지능 자율제어 스마트 고로 및 가열로를 가동 중입니다.',
    pipeline_steps: [
      {
        step: 1,
        process_name: '제선 - 스마트 고로 (Blast Furnace)',
        equipment: '대형 제철 고로(내용적 5,000m³급), 열풍 송풍관(Tuyere), 노정 장입 장치',
        ot_data: '풍구(Tuyere) 고온 열화상 카메라(2,000℃), 노체 열부하 열전대, 배가스(CO/CO2/H2) 분석계',
        pain_points: '노황(Furnace Condition) 급변으로 인한 슬립(Slip) 및 풍구 용손, 쇳물 온도 불균일'
      },
      {
        step: 2,
        process_name: '제강 - 전로 및 2차 정련 (Converter & Secondary Refining)',
        equipment: '산소 취련 전로(LD Converter), RH 탈가스 설비',
        ot_data: '산소 취입 압력/유량, 서브랜스(Sub-lance) 침적 온도(℃), 슬래그 발포도(Slag Foaming) 음향 센서',
        pain_points: '용강 탄소 농도 및 종점 온도 적중 실패, 슬래그 포밍 넘침 사고, 내화물 라이닝 침식'
      },
      {
        step: 3,
        process_name: '연속주조 (Continuous Casting)',
        equipment: '턴디쉬(Tundish), 수냉 몰드(Mold), 롤 세그먼트, 전자기 교반기(EMS)',
        ot_data: '몰드 레벨 방사선 감지기, 몰드 동판 열전대 그리드, 롤러 유압 가압력, 인발 속도(m/min)',
        pain_points: '용강 응고 쉘 파열로 인한 브레이크아웃(Breakout) 대형 사고, 슬래브 내부 중심 편석'
      },
      {
        step: 4,
        process_name: '가열 및 열간압연 (Reheating & Hot Rolling)',
        equipment: '보행빔식 가열로, 조압연기(Roughing Mill), 7단 사상압연기(Finishing Mill)',
        ot_data: '가열로 존별 연료 가스 유량/로내 온도, 롤 압하력 로드셀(천 톤 단위), 압연 롤러 진동 센서',
        pain_points: '슬래브 스케일(Scale) 결함, 압연 통판 중 사행(Snaking)으로 인한 롤러 끼임(Cobble)'
      },
      {
        step: 5,
        process_name: '냉각 및 권취 (Run-out Table & Coiler)',
        equipment: 'ROT 라미나 수냉 냉각 노즐, 텐션 릴 다운코일러',
        ot_data: '방사 온도계 권취 온도(CT, Coiling Temp), 코일러 맨드릴 확장 유압 토크, 형상 게이지',
        pain_points: '목표 권취 온도 편차로 인한 재질 인장강도 미달, 코일 망원경(Telescope) 권취 형상 불량'
      }
    ],
    actual_dx_initiatives: [
      {
        title: '스마트 고로 쇳물 온도 및 노황 예측 AI 자율제어',
        tech_stack: '풍구 영상 딥러닝 이미지 분석 + 가스 분석계 시계열 LSTM 앙상블',
        expected_effect: '쇳물 온도 적중률 90% 이상 달성 및 석탄 원단위(연료비) 연간 수백억 절감'
      },
      {
        title: '열간 압연기 설비 진동 분석 기반 롤 파손 예지보전(PdM)',
        tech_stack: '고주파 진동 가속도 센서(10kHz), FFT 엔벨로프 분석, 피로 수명 예측 모델',
        expected_effect: '돌발 압연 롤러 파손으로 인한 라인 스톱 제로화'
      },
      {
        title: '슬래브 연속주조 브레이크아웃(Breakout) 방지 시스템',
        tech_stack: '몰드 구리판 내장 수백 개 열전대 온도 전파 패턴 신경망 분류',
        expected_effect: '응고 쉘 파열 사고 100% 사전 감지 및 자동 감속 제어'
      }
    ],
    interview_pitch_template: '저는 포스코 포항제철소 열연 라인의 가열로 및 조압연 공정에서 발생하는 고온 다변량 시계열 센서와 롤러 진동 주파수 데이터를 분석하여, 통판 사행(Snaking)과 롤 마모를 사전에 예측하고 연속 공정의 에너지 원단위를 절감하는 생산기술 엔지니어로 기여하겠습니다.',
    purdue_level_breakdown: {
      level0_1: '고온 열전대, 방사 온도계, 압연 롤러 로드셀, 방사선 레벨계, 지멘스 S7 PLC',
      level2: 'DCS(분산제어시스템), 프로세스 컴퓨터, HMI 감시 제어반, 고속 이더넷 통신',
      level3: '조업 지시 MES, 제강-압연 연계 스케줄러, 실시간 품질 판정 QMS',
      level4: '전사 철강 SCM/ERP 및 수십 년 조업 데이터 빅데이터 플랫폼'
    }
  }
};
