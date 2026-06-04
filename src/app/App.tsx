import type { FurnitureItem } from '@entities/furniture';
import { FurnitureListPanel } from '@widgets/furniture-list-panel';
import { ScanResultDemo } from '@widgets/scan-result-demo';
import { ScanView } from '@widgets/scan-view';
import { useState } from 'react';

import AppProviders from './providers';

type View = 'furniture' | 'scan' | 'demo';

/**
 * 졸전 배너/시연용 임시 가구 시드.
 * 카테고리/이름을 다양화해 "실제 사용중인 라이브러리" 느낌이 나도록 한다.
 * (이전: 같은 침대 8개)
 */
/**
 * 실제 가구 사진 mock 자산.
 * `public/mock-furniture/` 에 파일을 떨구면 카드 썸네일이 SVG 일러스트 대신
 * 이 사진으로 자동 교체됨. 파일이 없으면 404 가 떨어지지만 FurnitureCard 가
 * 이미지 로드 실패시 카테고리 SVG 로 fallback 하도록 두면 그래도 그림은 뜸.
 * (자세한 가이드는 public/mock-furniture/README.md)
 */
const MOCK_PHOTO = {
  bed: '/mock-furniture/bed.png',
  chair: '/mock-furniture/chair.png',
} as const;

const furnitureItems: FurnitureItem[] = [
  { id: 'demo-bed-queen', name: '퀸 침대', category: '침대', favorite: true, thumbnailUrl: MOCK_PHOTO.bed },
  { id: 'demo-sofa-3p', name: '3인 가죽 소파', category: '소파' },
  { id: 'demo-desk-oak', name: '원목 책상', category: '책상' },
  { id: 'demo-chair-lounge', name: '라운지 의자', category: '의자', thumbnailUrl: MOCK_PHOTO.chair },
  { id: 'demo-shelf-5', name: '5단 책장', category: '수납장' },
  { id: 'demo-bed-single', name: '싱글 침대', category: '침대', thumbnailUrl: MOCK_PHOTO.bed },
  { id: 'demo-table-dining', name: '다이닝 테이블', category: '책상' },
  { id: 'demo-chair-office', name: '사무용 의자', category: '의자', thumbnailUrl: MOCK_PHOTO.chair },
];

const App = () => {
  const [view, setView] = useState<View>('furniture');

  return (
    <AppProviders>
      <main className="min-h-dvh w-full bg-gray-100">
        {view === 'scan' && <ScanView onExit={() => setView('furniture')} />}
        {view === 'demo' && (
          <ScanResultDemo
            onExit={() => setView('furniture')}
            photoUrl={MOCK_PHOTO.chair}
          />
        )}
        {view === 'furniture' && (
          <FurnitureListPanel
            items={furnitureItems}
            onAddFurniture={() => setView('scan')}
          />
        )}

        {/* 졸전 배너 촬영용 데모 진입점. 우상단 작은 칩으로만 노출. */}
        {view !== 'demo' && (
          <button
            type="button"
            onClick={() => setView('demo')}
            className="
              shadow-sm fixed top-12 left-12 z-50 rounded-max
              bg-functional-indigo/90 px-12 py-6 label-s text-white
              hover:bg-functional-indigo
            "
          >
            데모
          </button>
        )}
      </main>
    </AppProviders>
  );
};

export default App;
