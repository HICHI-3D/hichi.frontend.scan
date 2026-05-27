import type {
  FurnitureCategory,
  FurnitureItem,
} from '@entities/furniture';
import type {
  ScanJob,
  ScanJobStatus,
  ScanSource,
} from '@entities/scan-job';

import { API_BASE_URL, buildUrl } from './config';

/**
 * 백엔드 FurnitureResponse 스키마 (hichi.server/app/schemas/furniture.py).
 * field 명을 그대로 받아온다.
 */
export type FurnitureResponse = {
  id: number;
  name: string;
  category: string | null;
  width_mm: number | null;
  depth_mm: number | null;
  height_mm: number | null;
  scan_status: string;
  scan_progress: number;
  scan_stage: string | null;
  ai_job_id: string | null;
  error: string | null;
  model_url: string | null;
  created_at: string;
};

const VALID_CATEGORIES: FurnitureCategory[] = [
  '침대',
  '책상',
  '의자',
  '소파',
  '수납장',
  '기타',
];

const normalizeCategory = (raw: string | null | undefined): FurnitureCategory => {
  if (!raw) return '기타';
  return (VALID_CATEGORIES as string[]).includes(raw)
    ? (raw as FurnitureCategory)
    : '기타';
};

const toAbsoluteUrl = (path: string | null | undefined): string | undefined => {
  if (!path) return undefined;
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
};

/** 백엔드 status → 프론트 ScanJobStatus 로 정규화 (값이 다를 가능성 대비). */
const normalizeStatus = (raw: string | null | undefined): ScanJobStatus => {
  switch (raw) {
    case 'queued':
    case 'running':
    case 'completed':
    case 'failed':
    case 'cancelled':
      return raw;
    default:
      // 진행 중인 세부 단계 (preprocessing 등) 가 status 자리에 잘못 들어와도
      // 사용자 입장에선 'running' 으로 보여주는 게 자연스럽다.
      return 'running';
  }
};

/** AI 의 stage 문자열을 사용자용 한국어 라벨로 매핑. 모르면 그대로 보여줌. */
export const mapStatusLabel = (
  status: ScanJobStatus,
  stage: string | null | undefined,
): string => {
  if (status === 'queued') return '대기 중';
  if (status === 'completed') return '완료';
  if (status === 'failed') return '실패';
  if (status === 'cancelled') return '취소됨';

  switch (stage) {
    case 'preparing':
      return '이미지 준비 중';
    case 'feature_extraction':
      return '특징점 추출 (COLMAP)';
    case 'matching':
      return '매칭 중';
    case 'sfm_mapping':
      return '카메라 위치 추정 (SfM)';
    case 'exporting_pointcloud':
      return '포인트 클라우드 추출';
    case 'meshing':
      return '메시 생성';
    case 'starting':
      return '시작 중';
    default:
      return stage ? `진행 중 (${stage})` : '진행 중';
  }
};

/** FurnitureResponse → ScanJob (스캔 진행 오버레이 등에서 사용). */
export const toScanJob = (
  data: FurnitureResponse,
  source: ScanSource,
): ScanJob => {
  const status = normalizeStatus(data.scan_status);
  return {
    id: String(data.id),
    source,
    status,
    progress: data.scan_progress ?? 0,
    stageLabel: mapStatusLabel(status, data.scan_stage),
    modelUrl: toAbsoluteUrl(data.model_url),
    error: data.error ?? undefined,
    createdAt: data.created_at ? Date.parse(data.created_at) : Date.now(),
  };
};

/** FurnitureResponse → FurnitureItem (좌측 패널/시트 카드용). */
export const toFurnitureItem = (data: FurnitureResponse): FurnitureItem => ({
  id: String(data.id),
  name: data.name,
  category: normalizeCategory(data.category),
  modelUrl: toAbsoluteUrl(data.model_url),
  scanStatus: data.scan_status,
  scanProgress: data.scan_progress,
  scanStage: data.scan_stage ?? undefined,
});

/** GET /api/furniture/ — 사용자의 전체 가구 목록. */
export const fetchFurnitureList = async (): Promise<FurnitureItem[]> => {
  const res = await fetch(buildUrl('/api/furniture/'));
  if (!res.ok) {
    throw new Error(`가구 목록 조회 실패 (HTTP ${res.status})`);
  }
  const list = (await res.json()) as FurnitureResponse[];
  return list.map(toFurnitureItem);
};

/**
 * SSE 구독: 백엔드의 `/api/furniture/events/stream` 으로 EventSource 를 열고
 * `furniture_updated` 이벤트가 올 때마다 onChange 를 호출한다.
 *
 * 반환값은 구독 해제 함수.
 */
export const subscribeFurnitureEvents = (
  onChange: (furnitureId: string) => void,
): (() => void) => {
  const url = buildUrl('/api/furniture/events/stream');
  const es = new EventSource(url);

  const handle = (e: MessageEvent) => onChange(String(e.data));
  es.addEventListener('furniture_updated', handle as EventListener);

  // 일반 message 도 일부 환경에서 떨어질 수 있어 fallback 으로.
  es.onmessage = handle;

  return () => {
    es.removeEventListener('furniture_updated', handle as EventListener);
    es.close();
  };
};
