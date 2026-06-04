import type { FurnitureItem } from '../model/types';
import FurnitureThumbnail from './FurnitureThumbnail';
import FurnitureThumbnail3D from './FurnitureThumbnail3D';

type Props = {
  item: FurnitureItem;
  onClick?: (item: FurnitureItem) => void;
};

const isInProgress = (item: FurnitureItem) => {
  // scanStatus 가 비어있으면 (= 기존 더미 데이터) 진행 중 아님으로 본다.
  if (!item.scanStatus) return false;
  return !(
    item.scanStatus === 'completed' ||
    item.scanStatus === 'failed' ||
    item.scanStatus === 'cancelled'
  );
};

/**
 * 가구 리스트 그리드의 단일 카드.
 *
 * hichi.client.web의 FurniturePanel 카드와 동일한 비주얼:
 *   - bg-gray-200, border border-gray-400, rounded-12
 *   - p-8 gap-6, text-left
 *   - hover 시 bg-gray-300 + shadow
 *   - 라벨(label-l, gray-800) 위, size-108 gray-100 썸네일 박스 아래
 *
 * 썸네일은 다음 우선순위로 렌더:
 *   1. modelUrl(.glb) 있음           → `<model-viewer>` 로 3D 회전 미리보기
 *   2. thumbnailUrl(이미지) 있음     → <img>
 *   3. 그 외 (카테고리 일러스트)     → SVG FurnitureThumbnail
 *
 * 진행 중(running, queued, preprocessing ...) 가구는 진행률 오버레이를 덮어쓴다.
 */
const FurnitureCard = ({ item, onClick }: Props) => {
  const inProgress = isInProgress(item);
  const progressPct = Math.round((item.scanProgress ?? 0) * 100);

  return (
    <button
      type="button"
      onClick={() => onClick?.(item)}
      className="
        hover:shadow-sm
        col gap-6 rounded-12 border border-gray-400 bg-gray-200 p-8 text-left
        transition-all
        hover:bg-gray-300
      "
    >
      <span className="label-l text-gray-800">{item.name}</span>

      {/* 썸네일 박스 (size-108, gray-100).
          parent 는 `relative` 만 — `flex-center` 를 쓰면 <img> 가 flex item
          으로 잡혀 `size-full` 이 무시되고 자연 크기로 튀어나오는 이슈가 있어,
          Figma (2156:6426) 와 동일하게 자식 쪽을 absolute / flex 로 분기.  */}
      <div className="relative size-[108px] overflow-clip rounded-8 bg-gray-100">
        {item.modelUrl ? (
          <div className="flex-center size-full">
            <FurnitureThumbnail3D modelUrl={item.modelUrl} alt={item.name} size={108} />
          </div>
        ) : item.thumbnailUrl ? (
          <img
            src={item.thumbnailUrl}
            alt={item.name}
            className="
              absolute inset-0 block size-full max-w-none object-contain p-4
            "
          />
        ) : (
          <div className="flex-center size-full">
            <FurnitureThumbnail category={item.category} size={108} />
          </div>
        )}

        {/* 진행 중 오버레이 — 카드 위에 progress 와 stage 라벨을 띄움 */}
        {inProgress && (
          <div
            className="
              absolute inset-0 col items-center justify-end gap-4 bg-black/55
              p-6 text-center
            "
          >
            <span className="label-s text-white">{item.scanStage ?? '진행 중'}</span>
            <div className="h-1.5 rounded-sm w-full overflow-hidden bg-white/30">
              <div
                className="h-full bg-white transition-all"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <span className="label-s text-white">{progressPct}%</span>
          </div>
        )}

        {/* 실패/취소 표시 */}
        {!inProgress && item.scanStatus === 'failed' && (
          <div
            className="
              absolute inset-0 flex-center bg-red-500/70 px-6 text-center
              text-white
            "
          >
            <span className="label-s">스캔 실패</span>
          </div>
        )}
      </div>
    </button>
  );
};

export default FurnitureCard;
