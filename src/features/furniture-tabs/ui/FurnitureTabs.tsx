export type FurnitureTab = '전체' | '즐겨찾기';

type Props = {
  active: FurnitureTab;
  onChange: (tab: FurnitureTab) => void;
};

const tabs: FurnitureTab[] = ['전체', '즐겨찾기'];

/**
 * 가구 리스트 탭 (Figma node 2217:236).
 * - py-6 인접 컨테이너, 각 탭 p-6, 활성 탭만 하단 1.5px 인디고 border
 * - label-m (12px / line 16 / 600)
 *
 * 스캔 화면은 배치 기능이 없으므로 '배치된 가구' 탭은 노출하지 않는다.
 */
const FurnitureTabs = ({ active, onChange }: Props) => {
  return (
    <div className="flex w-full items-center py-6">
      {tabs.map((tab) => {
        const isActive = tab === active;
        return (
          <button
            key={tab}
            type="button"
            onClick={() => onChange(tab)}
            className={[
              'flex items-center p-6 label-m transition-colors',
              isActive
                ? 'border-b-[1.5px] border-functional-indigo text-functional-indigo'
                : 'text-black',
            ].join(' ')}
          >
            {tab}
          </button>
        );
      })}
    </div>
  );
};

export default FurnitureTabs;
