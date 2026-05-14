import { FurnitureListPanel } from '@widgets/furniture-list-panel';
import { ScanView } from '@widgets/scan-view';

import { MOCK_FURNITURE } from '../model/mockFurniture';

/**
 * 가구 스캔 페이지.
 *
 * 좌측: 사용자가 이미 스캔/저장해 둔 가구 라이브러리.
 * 우측: 실시간 카메라 + (가능하면) depth 스트림으로 가구를 캡쳐하는 뷰.
 */
const ScanPage = () => {
  return (
    <main className="flex size-full bg-gray-100">
      <FurnitureListPanel items={MOCK_FURNITURE} />

      <div className="min-w-0 flex-1">
        <ScanView />
      </div>
    </main>
  );
};

export default ScanPage;
