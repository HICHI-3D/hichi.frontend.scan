import { useFurnitureList } from '@features/furniture-list';
import { FurnitureListPanel } from '@widgets/furniture-list-panel';
import { ScanView } from '@widgets/scan-view';

/**
 * 가구 스캔 페이지.
 *
 * 좌측: 사용자가 이미 스캔/저장해 둔 가구 라이브러리 (백엔드 GET /api/furniture/).
 *       SSE (`/api/furniture/events/stream`) 로 실시간 갱신 — 스캔 완료/진행 변경이
 *       오면 즉시 새 항목으로 카드가 뜬다.
 * 우측: 실시간 카메라 + (가능하면) depth 스트림으로 가구를 캡쳐하는 뷰.
 *       하단 우측 버튼으로 같은 목록을 바텀시트로도 볼 수 있다.
 */
const ScanPage = () => {
  const { items } = useFurnitureList();

  return (
    <main className="flex size-full bg-gray-100">
      <FurnitureListPanel items={items} />

      <div className="min-w-0 flex-1">
        <ScanView scannedItems={items} />
      </div>
    </main>
  );
};

export default ScanPage;
