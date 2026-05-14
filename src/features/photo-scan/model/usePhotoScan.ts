import type { ScanJob } from '@entities/scan-job';
import { submitPhotoScan } from '@shared/api';
import { useCallback, useState } from 'react';

/**
 * 사진 스캔 상태 훅.
 *
 * 사용자가 고른 사진 파일들을 모았다가 `submit()` 으로 백엔드에 업로드한다.
 * - `addFiles` / `removeFile` 로 파일 목록을 편집
 * - `submit()` 은 `submitPhotoScan` 을 호출해 새 ScanJob 을 반환 (5장 미만이면 throw)
 * - `submitting` 으로 전송 중 상태를 표시할 수 있음
 */
const usePhotoScan = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const addFiles = useCallback((next: File[]) => {
    if (next.length === 0) return;
    setFiles((prev) => [...prev, ...next]);
  }, []);

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const submit = useCallback(async (): Promise<ScanJob> => {
    setSubmitting(true);
    try {
      const job = await submitPhotoScan(files);
      return job;
    } finally {
      setSubmitting(false);
    }
  }, [files]);

  return { files, addFiles, removeFile, submit, submitting };
};

export default usePhotoScan;
