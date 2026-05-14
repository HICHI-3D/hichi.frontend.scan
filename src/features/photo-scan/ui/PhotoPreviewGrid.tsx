import { useRef } from 'react';

import PhotoPreviewTile from './PhotoPreviewTile';

type Props = {
  files: File[];
  onRemove: (index: number) => void;
  onFilesAdded: (files: File[]) => void;
};

/**
 * 사진 프리뷰 그리드.
 *
 * - 3열 그리드로 `PhotoPreviewTile` 을 배치
 * - 마지막 칸은 "+ 추가" 타일 — 클릭 시 숨겨진 파일 인풋을 열어 더 담을 수 있음
 */
const PhotoPreviewGrid = ({ files, onRemove, onFilesAdded }: Props) => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const openPicker = () => {
    inputRef.current?.click();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = e.target.files;
    if (!list) return;
    const arr = Array.from(list);
    if (arr.length > 0) onFilesAdded(arr);
    e.target.value = '';
  };

  return (
    <div className="grid grid-cols-3 gap-12">
      {files.map((file, index) => (
        <PhotoPreviewTile
          key={`${file.name}-${file.lastModified}-${index}`}
          file={file}
          onRemove={() => onRemove(index)}
        />
      ))}

      <button
        type="button"
        onClick={openPicker}
        aria-label="사진 더 추가"
        className="
          flex-center aspect-square rounded-12 border-2 border-dashed
          border-gray-400 bg-gray-200 transition-colors
          hover:border-functional-indigo
        "
      >
        {/* TODO: icon-plus.svg (+ 아이콘) */}
        <img
          src=""
          alt=""
          aria-hidden="true"
          className="block size-[24px] opacity-60"
        />
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleInputChange}
        className="hidden"
      />
    </div>
  );
};

export default PhotoPreviewGrid;
