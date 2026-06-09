// ─── blur 감지용 소형 캔버스 (모듈 레벨 재사용) ──────────────────────────────
// 매 tick 마다 새로 만들면 GC 압박 → 한 번만 생성하고 크기만 조정한다.
const SHARP_W = 80; // 썸네일 가로 px (세로는 종횡비 유지)
let _sharpCanvas: HTMLCanvasElement | null = null;
let _sharpCtx: CanvasRenderingContext2D | null = null;

/**
 * 현재 비디오 프레임이 충분히 선명한지 판단한다.
 *
 * 80px 썸네일의 그레이스케일 분산(variance)을 blur 대리 지표로 사용.
 *   - 선명한 프레임: 엣지 대비가 커 분산 高 (보통 300+)
 *   - 흔들린 프레임: 경계가 뭉개져 분산 低 (보통 100 미만)
 *
 * @param threshold 분산 임계값. 낮출수록 더 많은 프레임이 통과된다. 기본값 80.
 */
export const isSharp = (video: HTMLVideoElement, threshold = 80): boolean => {
  if (video.videoWidth === 0 || video.videoHeight === 0) return false;

  const sw = SHARP_W;
  const sh = Math.round((sw * video.videoHeight) / video.videoWidth) || 45;

  if (!_sharpCanvas || !_sharpCtx) {
    _sharpCanvas = document.createElement('canvas');
    // willReadFrequently: getImageData 를 자주 호출한다고 브라우저에 힌트
    _sharpCtx = _sharpCanvas.getContext('2d', { willReadFrequently: true })!;
  }
  if (_sharpCanvas.width !== sw || _sharpCanvas.height !== sh) {
    _sharpCanvas.width = sw;
    _sharpCanvas.height = sh;
  }

  _sharpCtx.drawImage(video, 0, 0, sw, sh);
  const { data } = _sharpCtx.getImageData(0, 0, sw, sh);

  const n = sw * sh;
  let sum = 0;
  for (let i = 0; i < data.length; i += 4) {
    sum += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
  }
  const mean = sum / n;
  let sum2 = 0;
  for (let i = 0; i < data.length; i += 4) {
    const g = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    sum2 += (g - mean) * (g - mean);
  }
  return sum2 / n > threshold;
};

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
