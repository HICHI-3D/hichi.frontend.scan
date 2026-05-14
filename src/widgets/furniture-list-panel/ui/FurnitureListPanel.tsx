import { FurnitureCard, type FurnitureItem } from '@entities/furniture';
import { FurnitureSearch } from '@features/furniture-search';
import { type FurnitureTab, FurnitureTabs } from '@features/furniture-tabs';
import { PanelHeader } from '@widgets/panel-header';
import { useMemo, useState } from 'react';

type Props = {
  items: FurnitureItem[];
  onAddFurniture?: () => void;
  onSelectFurniture?: (item: FurnitureItem) => void;
  onOpenSettings?: () => void;
};

/**
 * 가구 리스트 패널 전체 (Figma node 2156:6426).
 *
 * 구조: PanelHeader → "가구 리스트" 타이틀 → 디바이더 → 탭/검색 그룹 → 디바이더 → 3열 그리드 → 새로운 가구 추가
 * 페이지 배경은 gray-100. 카드 영역은 gray-100 위에 gray-200 카드가 떠 있는 형태.
 */
const FurnitureListPanel = ({
  items,
  onAddFurniture,
  onSelectFurniture,
  onOpenSettings,
}: Props) => {
  const [activeTab, setActiveTab] = useState<FurnitureTab>('전체');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    return items.filter((item) => {
      if (activeTab === '즐겨찾기' && !item.favorite) return false;
      if (query && !item.name.includes(query)) return false;
      return true;
    });
  }, [items, activeTab, query]);

  return (
    <section className="col size-full items-center gap-8 bg-gray-100 pt-32">
      <PanelHeader onOpenSettings={onOpenSettings} />

      {/* 메인 컬럼 (w-440, px-12 py-8) */}
      <div className="
        col w-full max-w-[440px] shrink-0 items-center gap-8 px-12 py-8
      ">
        {/* "가구 리스트" 타이틀 행 */}
        <div className="flex w-full items-center justify-between px-12 py-8">
          <h2 className="body-s text-black">가구 리스트</h2>
        </div>

        {/* 상단 디바이더 */}
        <span className="block h-px w-full bg-gray-400" />

        <div className="col w-full items-center gap-12">
          <div className="col w-full items-start gap-12">
            {/* 탭 + 검색 */}
            <div className="col w-full items-start gap-4">
              <FurnitureTabs active={activeTab} onChange={setActiveTab} />
              <FurnitureSearch value={query} onChange={setQuery} />
            </div>

            {/* 검색 아래 디바이더 */}
            <span className="block h-px w-full bg-gray-400" />

            {/* 3열 그리드 */}
            <div className="grid w-full grid-cols-3 gap-12">
              {filtered.map((item) => (
                <FurnitureCard
                  key={item.id}
                  item={item}
                  onClick={onSelectFurniture}
                />
              ))}
            </div>
          </div>

          {/* 새로운 가구 추가 버튼 (중앙, fit-content) */}
          <div className="col items-start py-26">
            <button
              type="button"
              onClick={onAddFurniture}
              className="
                flex-center rounded-16 bg-functional-indigo px-38 py-12
                ds-under-2 transition-colors
                hover:bg-functional-indigo-60
                active:scale-[0.99]
              "
            >
              <span className="body-m text-gray-200">새로운 가구 추가</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FurnitureListPanel;
