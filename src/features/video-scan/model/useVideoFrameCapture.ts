import { type RefObject, useCallback, useEffect, useRef, useState } from 'react';

import { captureFrame } from './captureFrame';

type Args = {
  videoRef: RefObject<HTMLVideoElement | null>;
  intervalMs?: number;
  maxFrames?: number;
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
 * - 매 tick 마다 captureFrame() 호출 → frames 배열에 push.
 * - maxFrames 도달 시 자동 stop.
 * - stop(): interval 정리, capturing=false.
 * - 언마운트 시 interval cleanup.
 */
export const useVideoFrameCapture = ({
  videoRef,
  intervalMs = 200,
  maxFrames = 25,
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
  }, [videoRef, intervalMs, maxFrames, clearTimer]);

  useEffect(() => {
    return () => {
      clearTimer();
    };
  }, [clearTimer]);

  return { start, stop, frames, capturing };
};
