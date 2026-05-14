import type { ScanJob } from '@entities/scan-job';

import usePhotoScan from '../model/usePhotoScan';
import PhotoDropzone from './PhotoDropzone';
import PhotoPreviewGrid from './PhotoPreviewGrid';

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmitted?: (job: ScanJob) => void;
};

const MIN_FILES = 5;

/**
 * 사진으로 가구를 스캔하는 풀스크린 모달.
 *
 * - 헤더: 타이틀 "사진으로 스캔" + 닫기(×) 버튼
 * - 본문: 파일이 없으면 `PhotoDropzone`, 있으면 `PhotoPreviewGrid`
 * - 푸터: "스캔 시작" 버튼 (5장 미만이면 비활성), 카운트 헬퍼 텍스트
 */
const PhotoScanModal = ({ open, onClose, onSubmitted }: Props) => {
  const { files, addFiles, removeFile, submit, submitting } = usePhotoScan();

  if (!open) return null;

  const hasFiles = files.length > 0;
  const enough = files.length >= MIN_FILES;
  const canSubmit = enough && !submitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    const job = await submit();
    onSubmitted?.(job);
  };

  return (
    <div className="fixed inset-0 z-50 flex-center bg-black/60 p-16">
      <div
        className="
          col size-full max-h-[90dvh] max-w-[440px] overflow-clip rounded-24
          bg-gray-100
        "
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between px-20 py-16">
          <h2 className="body-m text-gray-900">사진으로 스캔</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="flex-center size-[32px] rounded-max bg-gray-200"
          >
            {/* TODO: icon-close-x.svg (모달 닫기 ×) */}
            <img
              src=""
              alt=""
              aria-hidden="true"
              className="block size-[16px]"
            />
          </button>
        </div>

        {/* 본문 */}
        <div className="col min-h-0 flex-1 gap-12 px-20 pb-16">
          {hasFiles ? (
            <PhotoPreviewGrid
              files={files}
              onRemove={removeFile}
              onFilesAdded={addFiles}
            />
          ) : (
            <PhotoDropzone onFilesAdded={addFiles} />
          )}
        </div>

        {/* 푸터 */}
        <div className="col gap-8 px-20 py-16">
          <p className="text-center label-m">
            <span className={enough ? 'text-gray-700' : 'text-red-500'}>
              {files.length}
            </span>
            <span className="text-gray-700">/{MIN_FILES}장 이상</span>
          </p>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={[
              'flex-center w-full rounded-16 bg-functional-indigo px-16 py-16',
              'body-m text-gray-200 transition-opacity',
              canSubmit ? '' : 'cursor-not-allowed opacity-40',
            ].join(' ')}
          >
            스캔 시작
          </button>
        </div>
      </div>
    </div>
  );
};

export default PhotoScanModal;
