import type { FurnitureItem } from '../model/types';
import FurnitureThumbnail from './FurnitureThumbnail';

type Props = {
  item: FurnitureItem;
  onClick?: (item: FurnitureItem) => void;
};

/**
 * 가구 리스트 그리드의 단일 카드.
 *
 * hichi.client.web의 FurniturePanel 카드와 동일한 비주얼:
 *   - bg-gray-200, border border-gray-400, rounded-12
 *   - p-8 gap-6, text-left
 *   - hover 시 bg-gray-300 + shadow
 *   - 라벨(label-l, gray-800) 위, size-108 gray-100 썸네일 박스 아래
 */
const FurnitureCard = ({ item, onClick }: Props) => {
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

      {/* 썸네일 박스 (size-108, gray-100) */}
      <div className="
        flex-center size-[108px] overflow-clip rounded-8 bg-gray-100
      ">
        {item.thumbnailUrl ? (
          <img
            src={item.thumbnailUrl}
            alt={item.name}
            className="size-full object-cover"
          />
        ) : (
          <FurnitureThumbnail category={item.category} size={108} />
        )}
      </div>
    </button>
  );
};

export default FurnitureCard;
