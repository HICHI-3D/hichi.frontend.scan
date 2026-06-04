import { PanelHeader } from '@widgets/panel-header';
import { useState } from 'react';

type Props = {
  onExit?: () => void;
  /**
   * 원본 사진 자리에 표시할 실제 사진 URL.
   * public/mock-furniture/chair.png 같은 경로를 넘기면 됨.
   * 비어있거나 로드 실패하면 자동으로 ChairPhotoIllustration (SVG) fallback.
   */
  photoUrl?: string;
};

/**
 * 졸전 배너/시연 전용 "스캔 → 3D 모델" 결과 화면.
 *
 * 실제 AI 추론과 연결되지 않은 정적 화면이다. 목적은 두 가지:
 *   1) 배너용 깔끔한 스크린샷 한 장 확보
 *   2) "사진 1장이 어떻게 3D 데이터가 되는가" 의 사용자 멘탈 모델 시연
 *
 * 화면 구성:
 *   - 원본 사진 카드 (photoUrl 있으면 <img>, 없으면 SVG 일러스트 fallback)
 *   - "→ AI 변환" 단계 인디케이터 (3 단계 ✓ 표시)
 *   - 3D 모델 카드 (CSS 3D transform 으로 자체 렌더한 회전하는 의자 — 외부 .glb 의존 없음)
 *   - 추정 치수 표 + CTA
 *
 * `<model-viewer>` 와 실제 .glb 가 준비되면 `Rotating3DChair` 부분만 교체하면 된다.
 */
const ScanResultDemo = ({ onExit, photoUrl }: Props) => {
  return (
    <section className="col size-full items-center gap-8 bg-gray-100 pt-32">
      <PanelHeader />

      <div className="
        col w-full max-w-[440px] shrink-0 items-stretch gap-16 px-12 py-8
      ">
        {/* 제목 */}
        <div className="col gap-4 px-12 py-8">
          <span className="label-s text-functional-indigo">스캔 완료</span>
          <h2 className="body-s text-black">
            사진 1장이 3D 모델로 변환되었어요
          </h2>
        </div>

        <span className="block h-px w-full bg-gray-400" />

        {/* 원본 사진 카드 */}
        <div className="col gap-8 px-12">
          <div className="flex items-center justify-between">
            <span className="label-l text-gray-800">원본 사진</span>
            <span className="label-s text-gray-500">photo.jpg</span>
          </div>
          <div
            className="
              relative aspect-4/3 w-full overflow-clip rounded-12 border
              border-gray-400 bg-gray-200
            "
          >
            <OriginalPhoto photoUrl={photoUrl} />
          </div>
        </div>

        {/* 단계 인디케이터 */}
        <PipelineSteps />

        {/* 3D 모델 카드 */}
        <div className="col gap-8 px-12">
          <div className="flex items-center justify-between">
            <span className="label-l text-gray-800">3D 모델</span>
            <span className="label-s text-functional-indigo">자동 회전 중</span>
          </div>
          <div
            className="
              flex-center aspect-4/3 w-full overflow-clip rounded-12 border
              border-gray-400 bg-linear-to-b from-gray-100 to-gray-200
            "
            style={{ perspective: '900px' }}
          >
            <Rotating3DChair />
          </div>
        </div>

        {/* 치수 추정 */}
        <div className="col gap-8 px-12">
          <span className="label-l text-gray-800">치수 추정</span>
          <div
            className="
              grid grid-cols-3 gap-8 rounded-12 border border-gray-400
              bg-gray-200 p-12
            "
          >
            <Dimension label="너비" value="750" unit="mm" />
            <Dimension label="깊이" value="800" unit="mm" />
            <Dimension label="높이" value="920" unit="mm" />
          </div>
        </div>

        {/* CTA */}
        <div className="col items-center gap-8 px-12 py-16">
          <button
            type="button"
            className="
              flex-center rounded-16 bg-functional-indigo px-38 py-12 ds-under-2
              transition-colors
              hover:bg-functional-indigo-60
              active:scale-[0.99]
            "
          >
            <span className="body-m text-gray-200">
              라이브러리에 추가
            </span>
          </button>
          {onExit && (
            <button
              type="button"
              onClick={onExit}
              className="
                label-m text-gray-500
                hover:text-gray-800
              "
            >
              ← 돌아가기
            </button>
          )}
        </div>
      </div>
    </section>
  );
};

/* -------------------------------------------------------------------------- */
/*  내부 컴포넌트                                                              */
/* -------------------------------------------------------------------------- */

/**
 * 원본 사진 자리. photoUrl 이 주어지면 <img>, 로드 실패시 SVG fallback.
 */
const OriginalPhoto = ({ photoUrl }: { photoUrl?: string }) => {
  const [failed, setFailed] = useState(false);
  if (!photoUrl || failed) return <ChairPhotoIllustration />;
  return (
    <img
      src={photoUrl}
      alt="스캔한 가구 원본 사진"
      onError={() => setFailed(true)}
      className="size-full object-contain"
    />
  );
};

/**
 * photoUrl swap 전까지 쓰는 SVG 일러스트.
 * 벽지·바닥·의자 윤곽으로 "방 안에서 찍은 가구 사진" 느낌을 낸다.
 */
const ChairPhotoIllustration = () => (
  <svg
    viewBox="0 0 400 300"
    xmlns="http://www.w3.org/2000/svg"
    className="size-full"
    preserveAspectRatio="xMidYMid slice"
  >
    {/* 벽지 */}
    <rect x="0" y="0" width="400" height="190" fill="#eae3d5" />
    <pattern
      id="wall-pattern"
      width="22"
      height="22"
      patternUnits="userSpaceOnUse"
    >
      <circle cx="11" cy="11" r="1" fill="#d6cdb7" opacity="0.6" />
    </pattern>
    <rect x="0" y="0" width="400" height="190" fill="url(#wall-pattern)" />

    {/* 바닥 (마룻결) */}
    <rect x="0" y="190" width="400" height="110" fill="#cdb59a" />
    <g stroke="#a4886a" strokeWidth="0.8" opacity="0.4">
      <line x1="0" y1="210" x2="400" y2="208" />
      <line x1="0" y1="230" x2="400" y2="232" />
      <line x1="0" y1="252" x2="400" y2="250" />
      <line x1="0" y1="275" x2="400" y2="278" />
    </g>

    {/* 베이스보드 */}
    <rect x="0" y="186" width="400" height="6" fill="#bda284" />

    {/* 콘센트 */}
    <rect x="60" y="160" width="22" height="14" rx="2" fill="#fff" stroke="#cbb89c" />
    <circle cx="67" cy="167" r="1.5" fill="#5b4a36" />
    <circle cx="76" cy="167" r="1.5" fill="#5b4a36" />

    {/* 의자 */}
    <g>
      {/* 의자 그림자 */}
      <ellipse cx="220" cy="278" rx="74" ry="9" fill="#8c7256" opacity="0.35" />

      {/* 등받이 */}
      <path
        d="M170 110 Q170 78 220 78 Q270 78 270 110 L270 200 Q220 210 170 200 Z"
        fill="#c8a78b"
      />
      <path
        d="M178 116 Q178 88 220 88 Q262 88 262 116 L262 192 Q220 200 178 192 Z"
        fill="#d6b89e"
      />

      {/* 좌석 */}
      <ellipse cx="220" cy="210" rx="78" ry="22" fill="#a88566" />
      <ellipse cx="220" cy="206" rx="76" ry="20" fill="#c19778" />

      {/* 다리 */}
      <line x1="170" y1="215" x2="158" y2="272" stroke="#3a2f24" strokeWidth="3" strokeLinecap="round" />
      <line x1="270" y1="215" x2="282" y2="272" stroke="#3a2f24" strokeWidth="3" strokeLinecap="round" />
      <line x1="200" y1="222" x2="195" y2="276" stroke="#3a2f24" strokeWidth="3" strokeLinecap="round" />
      <line x1="240" y1="222" x2="245" y2="276" stroke="#3a2f24" strokeWidth="3" strokeLinecap="round" />
    </g>

    {/* 오른쪽 창 (커튼) 힌트 */}
    <rect x="310" y="0" width="90" height="180" fill="#dccfb8" />
    <rect x="310" y="0" width="90" height="180" fill="url(#wall-pattern)" />
    <rect x="320" y="20" width="68" height="150" rx="2" fill="#2f3540" opacity="0.65" />
    <g stroke="#3b4250" strokeWidth="0.8" opacity="0.5">
      <line x1="334" y1="22" x2="334" y2="168" />
      <line x1="350" y1="22" x2="350" y2="168" />
      <line x1="370" y1="22" x2="370" y2="168" />
    </g>
  </svg>
);

/**
 * CSS 3D transform 만으로 만든 라운지 의자.
 * 외부 .glb / WebGL 없이도 회전하는 "3D 모델" 느낌을 낸다.
 *
 * 좌표계: 의자 좌석면이 평면, 등받이가 뒤로 일어선 형태.
 *   - Y축으로 천천히 회전 (16s/rev) — 카드 안에서 자연스러운 미리보기.
 *   - 카드 부모에 perspective 900px 설정.
 */
const Rotating3DChair = () => (
  <>
    <style>{`
      @keyframes hichi-chair-spin {
        from { transform: rotateX(-22deg) rotateY(0deg); }
        to { transform: rotateX(-22deg) rotateY(360deg); }
      }
      .hichi-chair-stage {
        width: 200px;
        height: 200px;
        position: relative;
        transform-style: preserve-3d;
        animation: hichi-chair-spin 16s linear infinite;
      }
      .hichi-face {
        position: absolute;
        transform-style: preserve-3d;
        backface-visibility: visible;
      }
    `}</style>

    <div className="hichi-chair-stage">
      {/* 좌석 (윗면) — 두께 14, 가로세로 120 */}
      <div
        className="hichi-face rounded-md"
        style={{
          width: '120px',
          height: '120px',
          left: '40px',
          top: '70px',
          background:
            'linear-gradient(135deg, #d8b89c 0%, #b8916f 100%)',
          transform: 'rotateX(90deg) translateZ(0px)',
          boxShadow:
            'inset 0 0 12px rgba(80, 50, 30, 0.25), 0 2px 6px rgba(0,0,0,0.18)',
        }}
      />
      {/* 좌석 두께 (옆면 4장) */}
      {[
        { side: 'front', transform: 'translateZ(60px)' },
        { side: 'back', transform: 'translateZ(-60px) rotateY(180deg)' },
        { side: 'left', transform: 'translateX(-60px) rotateY(-90deg)' },
        { side: 'right', transform: 'translateX(60px) rotateY(90deg)' },
      ].map((f) => (
        <div
          key={f.side}
          className="hichi-face rounded-sm"
          style={{
            width: '120px',
            height: '14px',
            left: '40px',
            top: '0px',
            background: '#9b7754',
            transform: `translateY(70px) ${f.transform}`,
          }}
        />
      ))}

      {/* 등받이 — 가로 120 × 세로 80, 좌석 뒤쪽에서 위로 일어섬 */}
      <div
        className="hichi-face rounded-md"
        style={{
          width: '120px',
          height: '80px',
          left: '40px',
          top: '0px',
          background:
            'linear-gradient(180deg, #d8b89c 0%, #b8916f 100%)',
          transform: 'translateZ(-60px) translateY(0px)',
          boxShadow: 'inset 0 0 12px rgba(80, 50, 30, 0.25)',
        }}
      />
      {/* 등받이 뒷면 (살짝 어둡게) */}
      <div
        className="hichi-face rounded-md"
        style={{
          width: '120px',
          height: '80px',
          left: '40px',
          top: '0px',
          background: '#8a6a4d',
          transform: 'translateZ(-66px) translateY(0px)',
        }}
      />

      {/* 다리 4개 (얇은 박스) */}
      {[
        { left: 42, top: 80, z: 54 },
        { left: 154, top: 80, z: 54 },
        { left: 42, top: 80, z: -54 },
        { left: 154, top: 80, z: -54 },
      ].map((leg, i) => (
        <div
          key={i}
          className="hichi-face"
          style={{
            width: '6px',
            height: '60px',
            left: `${leg.left}px`,
            top: `${leg.top}px`,
            background: '#2f261b',
            transform: `translateZ(${leg.z}px)`,
            borderRadius: '2px',
          }}
        />
      ))}

      {/* 좌석 정면에 살짝 밝은 하이라이트 */}
      <div
        className="hichi-face"
        style={{
          width: '120px',
          height: '6px',
          left: '40px',
          top: '70px',
          background:
            'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)',
          transform: 'translateZ(60.5px)',
          borderRadius: '3px',
        }}
      />
    </div>
  </>
);

const PipelineSteps = () => {
  const steps = [
    { label: '객체 인식', sub: 'YOLOv8 + SAM' },
    { label: '윤곽선 추출', sub: 'OpenCV' },
    { label: '3D 메시 생성', sub: 'TripoSR' },
  ];
  return (
    <div className="col gap-8 px-12">
      <span className="label-l text-gray-800">변환 단계</span>
      <div className="col gap-6">
        {steps.map((s) => (
          <div
            key={s.label}
            className="
              flex items-center gap-12 rounded-8 border border-gray-400
              bg-gray-200 px-12 py-8
            "
          >
            <span
              className="
                flex-center size-20 shrink-0 rounded-max bg-functional-indigo
                text-white
              "
              aria-hidden="true"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path
                  d="M2.5 6.2 L5 8.5 L9.5 3.5"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <div className="col gap-0">
              <span className="label-m text-gray-800">{s.label}</span>
              <span className="label-s text-gray-500">{s.sub}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const Dimension = ({
  label,
  value,
  unit,
}: {
  label: string;
  value: string;
  unit: string;
}) => (
  <div className="col items-center gap-4">
    <span className="label-s text-gray-500">{label}</span>
    <span className="label-l text-gray-800">
      {value}
      <span className="label-s text-gray-500"> {unit}</span>
    </span>
  </div>
);

export default ScanResultDemo;
