/**
 * 스캔 작업 도메인 타입.
 *
 * 백엔드 (hichi.server) 의 FurnitureResponse 와 1:1 대응한다.
 * 한 사용자의 가구는 곧 한 스캔 작업의 결과물이므로 두 개념이 같은 행을 공유한다.
 *
 *   ─ 파이프라인 ─
 *   YOLO + SAM 으로 가구 카테고리/마스크 인식
 *   COLMAP + OpenMVS + MeshLab 으로 3D 재구성 → .glb 출력
 */

/** 어떤 입력으로 만든 작업인지. 현재 백엔드는 사진만 받지만 영상도 같은 엔드포인트로 보낸다. */
export type ScanSource = 'photos' | 'video';

/**
 * 작업의 라이프사이클.
 *
 * 백엔드/AI 서버가 실제로 내려주는 값: queued / running / completed / failed / cancelled.
 * (AI 가 progress stage 라벨로 'preprocessing', 'detecting' 등을 따로 내리지만
 *  여기서는 사용자 노출용 stageLabel 로만 다룬다.)
 */
export type ScanJobStatus =
  | 'queued'
  | 'running'
  | 'completed'
  | 'failed'
  | 'cancelled';

export type ScanJob = {
  /** 백엔드 Furniture row id (정수). 문자열로도 다루기 쉽게 string. */
  id: string;
  source: ScanSource;
  status: ScanJobStatus;
  /** 0 ~ 1 */
  progress: number;
  /** 사용자에게 보여줄 한국어 단계 라벨 */
  stageLabel: string;
  /** 완료 시 .glb 다운로드 URL (백엔드 절대/상대 URL) */
  modelUrl?: string;
  /** 실패 시 메시지 */
  error?: string;
  createdAt: number;
};
