import RecordBadge from './RecordBadge';

type Props = {
  framesCaptured: number;
  onStop: () => void;
};

/**
 * 영상 캡쳐 중 표시되는 풀블리드 오버레이.
 *
 * - 반투명 검정 (bg-black/30) — 아래 카메라 미리보기가 비침.
 * - 상단 중앙: RecordBadge (REC + 프레임 수)
 * - 하단 중앙: 정지 버튼 + "촬영 종료" 텍스트
 */
const VideoScanOverlay = ({ framesCaptured, onStop }: Props) => {
  return (
    <div className="
      fixed inset-0 z-50 col items-stretch justify-between bg-black/30 py-48
    ">
      {/* 상단: REC 배지 */}
      <div className="flex-center w-full">
        <RecordBadge framesCaptured={framesCaptured} />
      </div>

      {/* 하단: 정지 버튼 + 안내 텍스트 */}
      <div className="col flex-center w-full gap-12">
        <button
          type="button"
          onClick={onStop}
          aria-label="촬영 종료"
          className="
            flex-center size-72 rounded-max border-4 border-gray-200
            bg-[#e94747]
          "
        >
          <span className="block size-12 rounded-[2px] bg-white" />
        </button>
        <span className="label-m text-white">촬영 종료 ({framesCaptured}프레임)</span>
      </div>
    </div>
  );
};

export default VideoScanOverlay;
