import { useEffect, useMemo } from 'react';

type Props = {
  file: File;
  onRemove: () => void;
};

/**
 * 사진 프리뷰 정사각형 타일.
 *
 * - `URL.createObjectURL` 로 썸네일 표시, 언마운트 시 revoke
 * - 우측 상단 작은 ✕ 버튼으로 제거
 */
const PhotoPreviewTile = ({ file, onRemove }: Props) => {
  // 동기 계산으로 effect 안 setState 회피
  const previewUrl = useMemo(() => URL.createObjectURL(file), [file]);

  useEffect(() => {
    return () => URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  return (
    <div className="relative aspect-square overflow-clip rounded-12 bg-gray-200">
      <img
        src={previewUrl}
        alt={file.name}
        className="size-full object-cover"
      />

      <button
        type="button"
        onClick={onRemove}
        aria-label="사진 제거"
        className="
          absolute top-6 right-6 flex-center size-[24px] rounded-max bg-black/60
        "
      >
        {/* TODO: icon-close-x.svg (작은 ✕) */}
        <img
          src=""
          alt=""
          aria-hidden="true"
          className="block size-[12px]"
        />
      </button>
    </div>
  );
};

export default PhotoPreviewTile;
