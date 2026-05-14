type Props = {
  visible: boolean;
  onClick: () => void;
};

/**
 * 바텀 시트 뒤의 반투명 오버레이.
 * - fixed inset-0, bg-black/40, z-40
 * - visible=false 일 때 opacity-0 + pointer-events-none 으로 숨김 (페이드 트랜지션)
 */
const SheetBackdrop = ({ visible, onClick }: Props) => {
  return (
    <div
      onClick={onClick}
      aria-hidden="true"
      className={[
        'fixed inset-0 z-40 bg-black/40 transition-opacity duration-300',
        visible ? 'opacity-100' : 'pointer-events-none opacity-0',
      ].join(' ')}
    />
  );
};

export default SheetBackdrop;
