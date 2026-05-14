/**
 * 스캔 작업 도메인 타입.
 *
 * 백엔드 파이프라인 (예정):
 *   - YOLO + SAM 으로 가구 객체 검출/세그멘테이션
 *   - OpenCV 로 프레임 전처리
 *   - COLMAP + OpenMVS + MeshLab CLI 로 3D 재구성 → .glb/.obj 출력
 *
 * 프론트엔드는 작업을 제출(submit) → 폴링(poll) → 결과(GET) 순서로 사용.
 */

/** 어떤 입력으로 만든 작업인지 */
export type ScanSource = 'photos' | 'video';

/** 작업의 라이프사이클 */
export type ScanJobStatus =
  | 'queued'        // 서버 대기열
  | 'preprocessing' // OpenCV 전처리
  | 'detecting'     // YOLO + SAM 검출/세그멘테이션
  | 'reconstructing'// COLMAP + OpenMVS 3D 복원
  | 'meshing'       // MeshLab 메시 후처리
  | 'completed'     // 완료
  | 'failed';       // 실패

export type ScanJob = {
  id: string;
  source: ScanSource;
  status: ScanJobStatus;
  /** 0 ~ 1 */
  progress: number;
  /** 사용자에게 보여줄 한국어 단계 라벨 */
  stageLabel: string;
  /** 완료 시 결과 모델 URL (예: .glb) */
  modelUrl?: string;
  /** 실패 시 메시지 */
  error?: string;
  createdAt: number;
};
