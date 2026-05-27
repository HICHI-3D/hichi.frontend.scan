export type FurnitureCategory = '침대' | '책상' | '의자' | '소파' | '수납장' | '기타';

/**
 * 좌측 패널/시트에서 다루는 가구 도메인 모델.
 *
 * 백엔드 FurnitureResponse 와 동등하지만 프론트에서 쓰기 좋게 일부 필드를 변환한다.
 *   - id 는 백엔드 정수 id 를 문자열로 보관
 *   - thumbnailUrl 은 사용처가 없을 수 있고, modelUrl 이 있으면 카드에서 3D 미리보기로 사용
 *   - 진행 중인 스캔(scanStatus !== 'completed') 도 같은 타입으로 다루기 위해 progress/stageLabel 포함
 */
export type FurnitureItem = {
  id: string;
  name: string;
  category: FurnitureCategory;
  thumbnailUrl?: string;
  /** 완료된 가구의 .glb 다운로드 URL (백엔드가 절대 URL 로 만들어 준다) */
  modelUrl?: string;
  /** 즐겨찾기 여부 */
  favorite?: boolean;

  /** 'queued' | 'running' | 'completed' | 'failed' | 'cancelled' */
  scanStatus?: string;
  /** 0 ~ 1 */
  scanProgress?: number;
  /** AI 가 내려주는 단계 라벨 (preprocessing, feature_extraction, ...) */
  scanStage?: string;
};
