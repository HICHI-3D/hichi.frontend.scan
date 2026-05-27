import type { FurnitureItem } from '@entities/furniture';
import { FurnitureListPanel } from '@widgets/furniture-list-panel';
import { ScanView } from '@widgets/scan-view';
import { useState } from 'react';

import AppProviders from './providers';

type View = 'furniture' | 'scan';

const furnitureItems: FurnitureItem[] = Array.from({ length: 8 }).map(
  (_, i) => ({
    id: `bed-${i + 1}`,
    name: '침대',
    category: '침대' as const,
    favorite: i === 0,
  }),
);

const App = () => {
  const [view, setView] = useState<View>('furniture');

  return (
    <AppProviders>
      <main className="min-h-dvh w-full bg-gray-100">
        {view === 'scan' ? (
          <ScanView onExit={() => setView('furniture')} />
        ) : (
          <FurnitureListPanel
            items={furnitureItems}
            onAddFurniture={() => setView('scan')}
          />
        )}
      </main>
    </AppProviders>
  );
};

export default App;
