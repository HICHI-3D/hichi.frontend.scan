import type { FurnitureItem } from '@entities/furniture';
import type { ScanJob } from '@entities/scan-job';
import { FurnitureListSheet } from '@features/furniture-list-sheet';
import { PhotoScanModal } from '@features/photo-scan';
import { ScanControls } from '@features/scan-controls';
import { ScanProgressOverlay, useScanJob } from '@features/scan-progress';
import { useVideoFrameCapture, VideoScanOverlay } from '@features/video-scan';
import { submitVideoScan } from '@shared/api';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState, useCallback } from 'react';

type Props = {
  /** 우측 가구목록 버튼 → 보통 가구 리스트로 복귀. */
  onExit?: () => void;
  /** 시트에서 보여줄 사용자의 스캔된 가구 목록. */
  scannedItems?: FurnitureItem[];
};

type CameraStatus = 'requesting' | 'granted' | 'denied' | 'unsupported';

const isCameraSupported = () =>
  typeof navigator !== 'undefined' &&
  typeof navigator.mediaDevices?.getUserMedia === 'function';

/**
 * 가구 스캔 뷰 (Figma node 2156:6399).
 *
 *  - 풀스크린 카메라 (후면 카메라 우선).
 *  - 하단 3개 버튼:
 *      좌: 사진 5장+ 업로드 모달 (PhotoScanModal)
 *      중: 영상느낌 연속 프레임 캡쳐 (VideoScanOverlay)
 *      우: 내 스캔 가구 목록 시트 (FurnitureListSheet)
 *  - 제출 후 ScanProgressOverlay 로 단계(YOLO+SAM → OpenCV → COLMAP → MeshLab) 표시.
 *  - 카메라 권한은 HTTPS / localhost 에서만 떨어짐.
 */
const ScanView = ({ onExit, scannedItems = [] }: Props) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState<CameraStatus>(() =>
    isCameraSupported() ? 'requesting' : 'unsupported',
  );

  // 모달 / 시트 / 진행 오버레이 상태
  const [photoOpen, setPhotoOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const errorTimerRef = useRef<number | null>(null);

  const showError = useCallback((msg: string) => {
    setVideoError(msg);
    if (errorTimerRef.current !== null) window.clearTimeout(errorTimerRef.current);
    errorTimerRef.current = window.setTimeout(() => setVideoError(null), 4000);
  }, []);
  // jobId 만 state 로 보관하고, 진행률 데이터는 useScanJob (RQ) 이 캐시 + refetchInterval 로 관리.
  const [jobId, setJobId] = useState<string | null>(null);
  const activeJob = useScanJob(jobId);
  const queryClient = useQueryClient();

  // 영상 캡쳐 훅 — maxFrames 를 상수로 분리해 VideoScanOverlay 에도 전달
  const VIDEO_MAX_FRAMES = 25;
  const capture = useVideoFrameCapture({ videoRef, intervalMs: 200, maxFrames: VIDEO_MAX_FRAMES });

  /* 카메라 스트림 연결 */
  useEffect(() => {
    if (!isCameraSupported()) return;
    const video = videoRef.current;
    if (!video) return;

    let cancelled = false;
    let activeStream: MediaStream | null = null;

    navigator.mediaDevices
      .getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false,
      })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        activeStream = stream;
        video.srcObject = stream;
        setStatus('granted');
      })
      .catch(() => {
        if (!cancelled) setStatus('denied');
      });

    return () => {
      cancelled = true;
      activeStream?.getTracks().forEach((t) => t.stop());
      if (video.srcObject) {
        video.srcObject = null;
      }
    };
  }, []);

  /* 새 잡이 시작되면 RQ 캐시에 prefill + jobId 저장 + 결과 시트 열기.
     활성 작업 폴링은 useScanJob 의 refetchInterval 이 담당 — 백엔드 GET /furniture/{id}
     호출이 곁가지로 AI 폴링 + SSE broadcast 를 트리거하므로 좌측 패널/시트도 같이 갱신된다. */
  const startJob = (job: ScanJob) => {
    queryClient.setQueryData(['furniture', job.id], job);
    setJobId(job.id);
    setSheetOpen(true);
  };

  /* 영상 캡쳐가 끝나면 (capturing false 로 전환되고 frames 채워져 있으면) 자동 submit. */
  useEffect(() => {
    if (capture.capturing) return;
    if (capture.frames.length === 0) return;
    let cancelled = false;
    submitVideoScan(capture.frames).then((job) => {
      if (!cancelled) startJob(job);
    }).catch((e) => {
      console.error('[ScanView] submitVideoScan error:', e);
      const msg = e instanceof Error ? e.message : '영상 스캔 요청에 실패했어요.';
      if (!cancelled) showError(msg);
    });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [capture.capturing, capture.frames]);

  // 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (errorTimerRef.current !== null) window.clearTimeout(errorTimerRef.current);
    };
  }, []);

  const handleStartVideo = () => {
    if (status !== 'granted') return;
    setVideoError(null);
    capture.start();
  };

  const handlePhotoSubmitted = (job: ScanJob) => {
    setPhotoOpen(false);
    startJob(job);
  };

  return (
    <section className="relative h-dvh w-full overflow-hidden bg-black">
      {/* 카메라 스트림 */}
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="size-full object-cover"
      />

      {/* 권한 상태 안내 */}
      {status !== 'granted' && (
        <div className="
          absolute inset-0 flex-center px-24 text-center text-white
        ">
          <p className="body-s">
            {status === 'requesting' && '카메라를 켜는 중...'}
            {status === 'denied' &&
              '카메라 권한이 필요해요. 브라우저 설정에서 허용해 주세요.'}
            {status === 'unsupported' &&
              '이 환경에서는 카메라를 사용할 수 없어요. https 또는 localhost 에서 열어 주세요.'}
          </p>
        </div>
      )}

      {/* 에러 토스트 — 영상 스캔 제출 실패 시 4초간 표시 */}
      {videoError && (
        <div className="absolute top-20 inset-x-0 flex-center px-24 pointer-events-none z-40">
          <div
            role="alert"
            className="
              flex items-center gap-10 rounded-16 bg-[#e94747]/90
              px-16 py-10 pointer-events-auto
            "
          >
            <span className="label-m text-white">{videoError}</span>
            <button
              type="button"
              aria-label="닫기"
              onClick={() => setVideoError(null)}
              className="flex-center size-18 shrink-0 rounded-max bg-white/20 text-white label-s"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* 촬영 전 안내 뱃지 — 카메라 권한 있고, 캡쳐/잡 없을 때만 표시 */}
      {status === 'granted' && !capture.capturing && !activeJob && (
        <div className="absolute top-16 inset-x-0 flex-center pointer-events-none">
          <span className="label-s text-white bg-black/50 rounded-max px-14 py-6">
            중앙 버튼을 눌러 가구 주위를 촬영하세요
          </span>
        </div>
      )}

      {/* 영상 캡쳐 중 오버레이 */}
      {capture.capturing && (
        <VideoScanOverlay
          framesCaptured={capture.frames.length}
          maxFrames={VIDEO_MAX_FRAMES}
          onStop={capture.stop}
        />
      )}

      {/* 하단 3개 버튼 — 좌: 사진 / 중: 영상 / 우: 시트 */}
      {!capture.capturing && !activeJob && (
        <div className="absolute inset-x-0 bottom-0">
          <ScanControls
            onOpenSettings={() => setPhotoOpen(true)}
            onToggleScan={handleStartVideo}
            onOpenGallery={() => setSheetOpen(true)}
          />
        </div>
      )}

      {/* 사진 스캔 모달 */}
      <PhotoScanModal
        open={photoOpen}
        onClose={() => setPhotoOpen(false)}
        onSubmitted={handlePhotoSubmitted}
      />

      {/* 가구 목록 시트 */}
      <FurnitureListSheet
        open={sheetOpen}
        items={scannedItems}
        onClose={() => setSheetOpen(false)}
      />

      {/* 진행 상태 오버레이 */}
      {activeJob && (
        <ScanProgressOverlay
          job={activeJob}
          onDismiss={() => setJobId(null)}
        />
      )}

      {/* 별도 종료 버튼: 우측 가구목록 버튼은 시트 열기로 바뀌었으므로
          외부 onExit 콜백은 가구 목록 시트에서 "닫기" 동작과 결합하지 않고
          별도 트리거가 필요한 경우 호출하도록 노출만 함. */}
      {onExit && status === 'denied' && (
        <button
          type="button"
          onClick={onExit}
          className="
            absolute top-16 right-16 rounded-max bg-white/90 px-16 py-8 label-l
            text-gray-800
          "
        >
          돌아가기
        </button>
      )}
    </section>
  );
};

export default ScanView;
