import type { ScanJob, ScanJobStatus } from '@entities/scan-job';

/**
 * 스캔 API 클라이언트 (목 구현).
 *
 * TODO: 실제 백엔드 연결 시 fetch / axios 로 교체.
 *   - POST /api/scan/photos  (multipart: image[])
 *   - POST /api/scan/video   (multipart: video / frames[])
 *   - GET  /api/scan/jobs/:id
 *   - 백엔드는 YOLO+SAM, OpenCV, COLMAP, OpenMVS, MeshLab CLI 로 가구 3D 모델 생성.
 */

const STAGE_PIPELINE: { status: ScanJobStatus; label: string; progress: number }[] = [
  { status: 'queued',         label: '대기 중',                 progress: 0.05 },
  { status: 'preprocessing',  label: '이미지 전처리 (OpenCV)',  progress: 0.2 },
  { status: 'detecting',      label: '가구 인식 (YOLO + SAM)',   progress: 0.45 },
  { status: 'reconstructing', label: '3D 재구성 (COLMAP+MVS)',   progress: 0.75 },
  { status: 'meshing',        label: '메시 다듬는 중 (MeshLab)', progress: 0.92 },
  { status: 'completed',      label: '완료',                    progress: 1 },
];

const jobs = new Map<string, ScanJob>();

const makeId = () =>
  `job_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

/** 사진 5장+ 업로드 → 새 ScanJob 등록 */
export const submitPhotoScan = async (files: File[]): Promise<ScanJob> => {
  if (files.length < 5) {
    throw new Error('사진은 5장 이상 필요해요.');
  }
  const job: ScanJob = {
    id: makeId(),
    source: 'photos',
    status: 'queued',
    progress: 0,
    stageLabel: '대기 중',
    createdAt: Date.now(),
  };
  jobs.set(job.id, job);
  void simulatePipeline(job.id);
  return job;
};

/** 영상 캡쳐(여러 프레임) 업로드 → 새 ScanJob 등록 */
export const submitVideoScan = async (frames: Blob[]): Promise<ScanJob> => {
  if (frames.length === 0) {
    throw new Error('캡쳐된 프레임이 없어요.');
  }
  const job: ScanJob = {
    id: makeId(),
    source: 'video',
    status: 'queued',
    progress: 0,
    stageLabel: '대기 중',
    createdAt: Date.now(),
  };
  jobs.set(job.id, job);
  void simulatePipeline(job.id);
  return job;
};

/** 단일 작업 상태 조회 */
export const getScanJob = async (id: string): Promise<ScanJob | null> => {
  return jobs.get(id) ?? null;
};

/** 폴링 헬퍼: status 변할 때마다 onUpdate 호출. completed/failed 면 정리. */
export const pollScanJob = (
  id: string,
  onUpdate: (job: ScanJob) => void,
  intervalMs = 700,
): (() => void) => {
  let cancelled = false;
  const tick = async () => {
    if (cancelled) return;
    const job = await getScanJob(id);
    if (!job) return;
    onUpdate(job);
    if (job.status === 'completed' || job.status === 'failed') return;
    window.setTimeout(tick, intervalMs);
  };
  void tick();
  return () => {
    cancelled = true;
  };
};

/** 목 파이프라인: stage 마다 일정 시간 진행 후 상태 업데이트 */
const simulatePipeline = async (id: string) => {
  for (const stage of STAGE_PIPELINE) {
    const job = jobs.get(id);
    if (!job) return;
    const next: ScanJob = {
      ...job,
      status: stage.status,
      stageLabel: stage.label,
      progress: stage.progress,
      modelUrl: stage.status === 'completed' ? '/mock/model.glb' : job.modelUrl,
    };
    jobs.set(id, next);
    await new Promise((r) => setTimeout(r, 900));
  }
};
