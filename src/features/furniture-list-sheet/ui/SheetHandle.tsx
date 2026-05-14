/**
 * 바텀 시트 상단의 시각적 드래그 핸들.
 * - w-48 h-4 rounded-max gray-400, 중앙 정렬
 * - 실제 드래그 동작은 없음 (순수 시각 요소)
 */
const SheetHandle = () => {
  return <span className="mx-auto my-12 block h-4 w-48 rounded-max bg-gray-400" />;
};

export default SheetHandle;
