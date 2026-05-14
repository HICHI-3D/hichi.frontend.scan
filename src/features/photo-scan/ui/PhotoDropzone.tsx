import { type DragEvent, useRef, useState } from 'react';

type Props = {
  onFilesAdded: (files: File[]) => void;
};

/**
 * 사진 업로드 드롭존.
 *
 * - 큰 dashed border 영역을 클릭하거나 사진을 드래그&드롭하면 파일 선택 다이얼로그 열림
 * - 숨겨진 `<input type="file" multiple accept="image/*">` 를 트리거
 * - 선택/드롭된 File 들을 `onFilesAdded` 로 전달
 */
const PhotoDropzone = ({ onFilesAdded }: Props) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const openPicker = () => {
    inputRef.current?.click();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = e.target.files;
    if (!list) return;
    const arr = Array.from(list);
    if (arr.length > 0) onFilesAdded(arr);
    // 같은 파일을 다시 골라도 change 가 나도록 reset
    e.target.value = '';
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const list = e.dataTransfer.files;
    if (!list) return;
    const arr = Array.from(list).filter((f) => f.type.startsWith('image/'));
    if (arr.length > 0) onFilesAdded(arr);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  return (
    <div
      onClick={openPicker}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      role="button"
      tabIndex={0}
      aria-label="사진 추가"
      className={[
        'col flex-1 cursor-pointer items-center justify-center gap-12',
        'rounded-24 border-2 border-dashed border-gray-400 bg-gray-200 p-24',
        'transition-colors',
        isDragOver ? 'border-functional-indigo bg-gray-100' : '',
      ].join(' ')}
    >
      {/* TODO: icon-photo-add.svg (사진 + 플러스) */}
      <img
        src=""
        alt=""
        aria-hidden="true"
        className="block size-[48px] opacity-60"
      />

      <div className="col items-center gap-4">
        <span className="body-s text-gray-800">
          사진을 드래그하거나 클릭해서 추가하세요
        </span>
        <span className="label-m text-gray-600">최소 5장 필요</span>
      </div>

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

export default PhotoDropzone;
