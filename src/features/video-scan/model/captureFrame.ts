/**
 * 현재 비디오 프레임을 오프스크린 canvas 에 그려 Blob 으로 반환.
 *
 * - 사이즈는 video.videoWidth / videoHeight 기준 (실제 해상도).
 * - videoWidth 가 0 이면 아직 메타데이터 미준비 → reject.
 * - canvas.toBlob() 결과를 Promise 로 래핑.
 */
export const captureFrame = (video: HTMLVideoElement): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const width = video.videoWidth;
    const height = video.videoHeight;

    if (width === 0 || height === 0) {
      reject(new Error('비디오 프레임이 아직 준비되지 않았어요.'));
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      reject(new Error('Canvas 2D 컨텍스트를 만들 수 없어요.'));
      return;
    }

    ctx.drawImage(video, 0, 0, width, height);

    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error('Blob 변환에 실패했어요.'));
      }
    }, 'image/jpeg', 0.9);
  });
};
