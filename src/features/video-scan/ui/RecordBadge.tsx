type Props = {
  framesCaptured: number;
};

/**
 * 녹화 표시 pill (Figma 미정 — 자체 디자인).
 *
 * - 빨간 점(animate-pulse) + "REC" + "N프레임"
 * - label-s 사이즈, bg black/60 위 흰 텍스트
 */
const RecordBadge = ({ framesCaptured }: Props) => {
  return (
    <div
      className="
        flex-center gap-6 rounded-max bg-black/60 px-12 py-6 text-white
      "
    >
      <span className="animate-pulse block size-8 rounded-max bg-[#e94747]" />
      <span className="label-s">REC</span>
      <span className="label-s">{framesCaptured}프레임</span>
    </div>
  );
};

export default RecordBadge;
