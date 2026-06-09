import { type RefObject, useCallback, useEffect, useRef, useState } from 'react';

import { captureFrame, isSharp } from './captureFrame';

type Args = {
  videoRef: RefObject<HTMLVideoElement | null>;
  intervalMs?: number;
  maxFrames?: number;
  /**
   * blur 감지 임계값 (그레이스케일 분산).
   * 이 값 미만이면 흔들린 프레임으로 판단해 건너뜀.
   * 기본값 80. 0 이하면 blur 감지 비활성화.
   */
  sharpnessThreshold?: number;
};

type Result = {
  start: () => void;
  stop: () => void;
  frames: Blob[];
  capturing: boolean;
};

/**
 * 비디오 프레임 주기 캡쳐 훅.
 *
 * - start(): 이전 frames 비우고 capturing=true, setInterval 시작.
 * - 매 tick 마다 isSharp() 로 blur 체크 → 흔들린 프레임은 건너뜀.
 * - 선명한 프레임만 captureFrame() 으로 저장 → frames 배열에 push.
 * - maxFrames 도달 시 자동 stop.
 * - stop(): interval 정리, capturing=false.
 * - 언마운트 시 interval cleanup.
 */
export const useVideoFrameCapture = ({
  videoRef,
  intervalMs = 200,
  maxFrames = 25,
  sharpnessThreshold = 80,
}: Args): Result => {
  const [frames, setFrames] = useState<Blob[]>([]);
  const [capturing, setCapturing] = useState(false);

  const intervalIdRef = useRef<number | null>(null);

  const clearTimer = useCallback(() => {
    if (intervalIdRef.current !== null) {
      window.clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }
  }, []);

  const stop = useCallback(() => {
    clearTimer();
    setCapturing(false);
  }, [clearTimer]);

  const start = useCallback(() => {
    clearTimer();
    setFrames([]);
    setCapturing(true);

    intervalIdRef.current = window.setInterval(() => {
      const video = videoRef.current;
      if (!video) return;

      // blur 감지: 흔들린 프레임은 건너뛰고 다음 tick 대기
      if (sharpnessThreshold > 0 && !isSharp(video, sharpnessThreshold)) return;

      captureFrame(video)
        .then((blob) => {
          setFrames((prev) => {
            const next = [...prev, blob];
            if (next.length >= maxFrames) {
              clearTimer();
              setCapturing(false);
            }
            return next;
          });
        })
        .catch(() => {
          /* 메타데이터 미준비 등 일시 오류는 무시하고 다음 tick 대기 */
        });
    }, intervalMs);
  }, [videoRef, intervalMs, maxFrames, sharpnessThreshold, clearTimer]);

  useEffect(() => {
    return () => {
      clearTimer();
    };
  }, [clearTimer]);

  return { start, stop, frames, capturing };
};
