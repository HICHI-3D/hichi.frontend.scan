import RecordBadge from './RecordBadge';

type Props = {
  framesCaptured: number;
  /** useVideoFrameCapture 의 maxFrames 와 맞춰야 진행률이 정확함. 기본값 25. */
  maxFrames?: number;
  onStop: () => void;
};

const DEFAULT_MAX = 25;

/** 진행률(0~1)에 따라 단계별 안내 문구 반환. */
function getHint(pct: number): string {
  if (pct < 0.25) return '가구 정면에서 시작해주세요';
  if (pct < 0.5)  return '천천히 옆으로 이동해주세요';
  if (pct < 0.8)  return '반대편까지 계속 이동해주세요';
  return '거의 완료됐어요!';
}

/**
 * 영상 캡쳐 중 풀스크린 오버레이.
 *
 * 개선된 항목:
 *  1. 뷰파인더 코너 브라켓 + 타원 스캔 경로 → 카메라 이동 방향 안내
 *  2. 정지 버튼 주위 원형 진행률 아크 → 몇 프레임 찍었는지 한눈에
 *  3. 진행률 기반 단계별 힌트 텍스트 (4단계)
 */
const VideoScanOverlay = ({
  framesCaptured,
  maxFrames = DEFAULT_MAX,
  onStop,
}: Props) => {
  const pct = Math.min(framesCaptured / maxFrames, 1);
  const hint = getHint(pct);

  // 원형 진행률 (stop 버튼 주위, r=38)
  const R = 38;
  const circ = 2 * Math.PI * R;
  const dashOffset = circ * (1 - pct);

  return (
    <div className="fixed inset-0 z-50 col items-stretch justify-between bg-black/30 py-48">
      {/* 상단: REC 배지 */}
      <div className="flex-center w-full">
        <RecordBadge framesCaptured={framesCaptured} />
      </div>

      {/* 중앙: 뷰파인더 (flex-1 로 남은 공간 전부) */}
      <div className="flex-center flex-1 w-full">
        <ScanViewfinder pct={pct} />
      </div>

      {/* 하단: 힌트 + 원형 진행률 + 정지 버튼 */}
      <div className="col flex-center w-full gap-10">
        {/* 단계별 힌트 */}
        <span className="label-m text-white rounded-max bg-black/50 px-14 py-5">
          {hint}
        </span>

        {/* 정지 버튼 + 원형 아크 */}
        <div className="relative flex-center" style={{ width: R * 2 + 16, height: R * 2 + 16 }}>
          <svg
            width={R * 2 + 16}
            height={R * 2 + 16}
            style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)' }}
          >
            {/* 배경 링 */}
            <circle
              cx={R + 8} cy={R + 8} r={R}
              fill="none"
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="3"
            />
            {/* 진행 아크 */}
            <circle
              cx={R + 8} cy={R + 8} r={R}
              fill="none"
              stroke="rgba(255,255,255,0.9)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={circ}
              strokeDashoffset={dashOffset}
              style={{ transition: 'stroke-dashoffset 0.15s ease' }}
            />
          </svg>

          <button
            type="button"
            onClick={onStop}
            aria-label="촬영 종료"
            className="flex-center size-72 rounded-max border-4 border-gray-200 bg-[#e94747]"
          >
            <span className="block size-12 rounded-[2px] bg-white" />
          </button>
        </div>

        <span className="label-m text-white/70">
          {framesCaptured} / {maxFrames} 프레임
        </span>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*  뷰파인더 컴포넌트                                                          */
/* -------------------------------------------------------------------------- */

/**
 * 코너 브라켓 + 타원 스캔 경로 안내.
 *
 *  - 코너 브라켓: 가구를 프레임 중앙에 맞추도록 유도
 *  - 하단 타원 점선: 사용자가 걸어야 할 스캔 경로 시각화
 *  - 타원 위의 흰 점: 현재 진행 위치 표시 (pct 에 따라 이동)
 */
const ScanViewfinder = ({ pct }: { pct: number }) => {
  const W = 240;
  const H = 300;
  const BL = 26;   // 브라켓 arm 길이
  const BW = 2.5;  // 브라켓 선 두께

  // 타원 스캔 경로 (W/2 중앙, 하단 여유)
  const EX = W / 2;
  const EY = H - 36;
  const ERX = 88;
  const ERY = 20;
  // 타원 둘레 근사 (Ramanujan)
  const ellipsePerim = Math.PI * (3 * (ERX + ERY) - Math.sqrt((3 * ERX + ERY) * (ERX + 3 * ERY)));
  const filled = ellipsePerim * pct;
  const empty  = ellipsePerim * (1 - pct);

  // 현재 위치 점: 12시 방향(위쪽) 에서 시계 방향으로 이동
  const angle = -Math.PI / 2 + 2 * Math.PI * pct;
  const dotX = EX + ERX * Math.cos(angle);
  const dotY = EY + ERY * Math.sin(angle);

  return (
    <svg
      width={W}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* ── 코너 브라켓 ─────────────────────────────── */}
      {/* 왼쪽 위 */}
      <path
        d={`M ${BL} 4 L 4 4 L 4 ${BL}`}
        stroke="white" strokeWidth={BW} strokeLinecap="round"
      />
      {/* 오른쪽 위 */}
      <path
        d={`M ${W - BL} 4 L ${W - 4} 4 L ${W - 4} ${BL}`}
        stroke="white" strokeWidth={BW} strokeLinecap="round"
      />
      {/* 왼쪽 아래 */}
      <path
        d={`M ${BL} ${H - 64} L 4 ${H - 64} L 4 ${H - 64 - BL}`}
        stroke="white" strokeWidth={BW} strokeLinecap="round"
      />
      {/* 오른쪽 아래 */}
      <path
        d={`M ${W - BL} ${H - 64} L ${W - 4} ${H - 64} L ${W - 4} ${H - 64 - BL}`}
        stroke="white" strokeWidth={BW} strokeLinecap="round"
      />

      {/* ── 중앙 크로스헤어 ──────────────────────────── */}
      <line
        x1={W / 2 - 10} y1={H / 2 - 60}
        x2={W / 2 + 10} y2={H / 2 - 60}
        stroke="rgba(255,255,255,0.45)" strokeWidth="1.5" strokeLinecap="round"
      />
      <line
        x1={W / 2} y1={H / 2 - 70}
        x2={W / 2} y2={H / 2 - 50}
        stroke="rgba(255,255,255,0.45)" strokeWidth="1.5" strokeLinecap="round"
      />

      {/* ── 타원 스캔 경로 ───────────────────────────── */}
      {/* 회색 점선 (전체 경로) */}
      <ellipse
        cx={EX} cy={EY} rx={ERX} ry={ERY}
        stroke="rgba(255,255,255,0.25)"
        strokeWidth="1.5"
        strokeDasharray="5 4"
      />
      {/* 흰색 실선 (완료된 구간) — 12시 방향에서 시계 방향 */}
      {pct > 0 && (
        <ellipse
          cx={EX} cy={EY} rx={ERX} ry={ERY}
          stroke="rgba(255,255,255,0.85)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray={`${filled} ${empty}`}
          strokeDashoffset={ellipsePerim * 0.25}
        />
      )}

      {/* 현재 위치 점 */}
      <circle cx={dotX} cy={dotY} r="5" fill="white" />
      <circle cx={dotX} cy={dotY} r="5" fill="white" opacity="0.4">
        <animate attributeName="r" values="5;9;5" dur="1.2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.4;0;0.4" dur="1.2s" repeatCount="indefinite" />
      </circle>

      {/* 안내 문구 */}
      <text
        x={EX} y={EY + ERY + 16}
        textAnchor="middle"
        fontSize="10"
        fill="rgba(255,255,255,0.55)"
        fontFamily="system-ui, -apple-system, sans-serif"
      >
        가구 주위를 한 바퀴 돌아주세요
      </text>
    </svg>
  );
};

export default VideoScanOverlay;
