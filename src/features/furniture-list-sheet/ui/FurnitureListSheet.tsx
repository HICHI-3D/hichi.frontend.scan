import { FurnitureCard, type FurnitureItem } from '@entities/furniture';

import SheetBackdrop from './SheetBackdrop';
import SheetHandle from './SheetHandle';

type Props = {
  open: boolean;
  items: FurnitureItem[];
  onClose: () => void;
};

/**
 * 스캔 뷰 위에 슬라이드업으로 올라오는 가구 리스트 바텀 시트.
 * - 패널: fixed inset-x-0 bottom-0 max-h-[80dvh] gray-100, rounded-t-32, z-50
 * - 열림/닫힘: translate-y-0 / translate-y-full + transition-transform duration-300
 * - 백드롭(z-40) + 패널(z-50) 의 z-index 위계
 */
const FurnitureListSheet = ({ open, items, onClose }: Props) => {
  const count = items.length;

  return (
    <>
      <SheetBackdrop visible={open} onClick={onClose} />

      <div
        role="dialog"
        aria-modal="true"
        aria-hidden={!open}
        className={[
          'fixed inset-x-0 bottom-0 z-50 flex max-h-[80dvh] flex-col',
          'rounded-t-32 bg-gray-100',
          'transition-transform duration-300',
          open ? 'translate-y-0' : 'translate-y-full',
        ].join(' ')}
      >
        {/* Header */}
        <div className="shrink-0">
          <SheetHandle />
          <div className="flex items-center gap-6 px-20 pb-12">
            <span className="label-l text-gray-800">내 스캔 가구</span>
            <span className="body-s text-gray-600">({count}개)</span>
          </div>
        </div>

        {/* Body */}
        {count === 0 ? (
          <div className="flex-center flex-1 px-20 pb-24">
            <span className="body-s text-gray-600">아직 스캔한 가구가 없어요</span>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-20 pb-24">
            <div className="grid grid-cols-2 gap-12">
              {items.map((item) => (
                <FurnitureCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default FurnitureListSheet;
