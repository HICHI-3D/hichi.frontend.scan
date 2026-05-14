import List from "@/assets/icon/list.svg";
import Photo from "@/assets/icon/photo.svg";

type Props = {
  onToggleScan?: () => void;
  onOpenSettings?: () => void;
  onOpenGallery?: () => void;
};

/**
 * 스캔 뷰 하단 컨트롤 (Figma node 2156:6403).
 *
 *  - 좌: 옵션 (bg gray-400, 4px gray-200 border, p-16 → 안에 size-40 아이콘 SVG `<img/>`)
 *  - 중: 캡쳐 (bg gray-400, 4px gray-200 border, size-72 plain 원형 — 아이콘 없음)
 *  - 우: 갤러리 (좌측과 동일한 형태, p-16 + size-40 아이콘)
 */
const ScanControls = ({
  onToggleScan,
  onOpenSettings,
  onOpenGallery,
}: Props) => {
  return (
    <div className="flex-center w-full gap-[10px] py-16">
      {/* 좌측: 스캔 옵션 */}
      <button
        type="button"
        onClick={onOpenSettings}
        aria-label="스캔 옵션"
        className="
          flex-center rounded-max border-4 border-gray-200 bg-gray-400 p-16
        "
      >
        <img
          src={Photo}
          alt="사진으로 스캔"
          aria-hidden="true"
          className="block size-[40px]"
        />
      </button>

      {/* 중앙: 캡쳐 (plain 원형) */}
      <button
        type="button"
        onClick={onToggleScan}
        aria-label="스캔 시작"
        className="
          flex-center size-72 rounded-max border-4 border-gray-200 bg-gray-400
        "
      />

      {/* 우측: 갤러리 */}
      <button
        type="button"
        onClick={onOpenGallery}
        aria-label="가구 목록"
        className="
          flex-center rounded-max border-4 border-gray-200 bg-gray-400 p-16
        "
      >
        <img
          src={List}
          alt="가구 목록"
          aria-hidden="true"
          className="block size-[40px]"
        />
      </button>
    </div>
  );
};

export default ScanControls;
