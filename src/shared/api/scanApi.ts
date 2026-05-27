import type { ScanJob, ScanJobStatus } from '@entities/scan-job';

import { buildUrl } from './config';
import {
  type FurnitureResponse,
  mapStatusLabel,
  toScanJob,
} from './furnitureApi';

/**
 * 스캔 API 클라이언트 (실제 백엔드 호출).
 *
 *   POST /api/furniture/scan       (multipart: files[], name, category)
 *   GET  /api/furniture/{id}
 *   DELETE /api/furniture/{id}
 *
 * 영상 캡쳐(여러 프레임 Blob) 도 같은 엔드포인트로 사진 5장 이상으로 변환해 전송한다.
 * 백엔드가 사진/영상 입력을 구분하지 않으므로 source 는 프론트 상태로만 보관.
 */

const SCAN_ENDPOINT = '/api/furniture/scan';
const FURNITURE_BASE = '/api/furniture';

const MIN_PHOTOS = 5;

/** 사진 5장+ 업로드 → 새 ScanJob */
export const submitPhotoScan = async (files: File[]): Promise<ScanJob> => {
  if (files.length < MIN_PHOTOS) {
    throw new Error(`사진은 ${MIN_PHOTOS}장 이상 필요해요.`);
  }

  const form = new FormData();
  for (const f of files) form.append('files', f);

  const res = await fetch(buildUrl(SCAN_ENDPOINT), {
    method: 'POST',
    body: form,
  });

  if (!res.ok) {
    throw new Error(await readError(res, '스캔 요청에 실패했어요.'));
  }
  const data = (await res.json()) as FurnitureResponse;
  return toScanJob(data, 'photos');
};

/** 영상 프레임(여러 Blob) → 새 ScanJob. 백엔드는 이미지 파일로 받는다. */
export const submitVideoScan = async (frames: Blob[]): Promise<ScanJob> => {
  if (frames.length === 0) {
    throw new Error('캡쳐된 프레임이 없어요.');
  }
  if (frames.length < MIN_PHOTOS) {
    throw new Error(
      `프레임은 ${MIN_PHOTOS}장 이상 필요해요. (현재 ${frames.length}장)`,
    );
  }

  const form = new FormData();
  frames.forEach((blob, i) => {
    const file = new File([blob], `frame_${i.toString().padStart(3, '0')}.jpg`, {
      type: blob.type || 'image/jpeg',
    });
    form.append('files', file);
  });

  const res = await fetch(buildUrl(SCAN_ENDPOINT), {
    method: 'POST',
    body: form,
  });

  if (!res.ok) {
    throw new Error(await readError(res, '영상 스캔 요청에 실패했어요.'));
  }
  const data = (await res.json()) as FurnitureResponse;
  return toScanJob(data, 'video');
};

/** 단일 작업 상태 조회 (= 단일 가구 조회). */
export const getScanJob = async (id: string): Promise<ScanJob | null> => {
  const res = await fetch(buildUrl(`${FURNITURE_BASE}/${id}`));
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(await readError(res, '스캔 상태 조회 실패'));
  }
  const data = (await res.json()) as FurnitureResponse;
  return toScanJob(data, 'photos');
};

/** 한국어 단계 라벨 매핑은 furnitureApi 에서 재사용 가능하도록 export. */
export { mapStatusLabel };

// ─── 내부 ───────────────────────────────────────────────────────────

async function readError(res: Response, fallback: string): Promise<string> {
  try {
    const j = (await res.json()) as { detail?: unknown };
    if (typeof j.detail === 'string') return j.detail;
    if (Array.isArray(j.detail) && j.detail[0]?.msg) return String(j.detail[0].msg);
  } catch {
    /* ignore */
  }
  return `${fallback} (HTTP ${res.status})`;
}

// 사용 안 함 (타입만 다시 노출). 외부에서 ScanJobStatus 가 필요할 때 import 편의용.
export type { ScanJobStatus };
