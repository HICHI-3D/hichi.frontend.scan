import Search from '@/assets/icon/search.svg';

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

/**
 * 가구 검색 인풋 (Figma node 2217:243).
 * - bg gray-200, border gray-400, rounded-8, p-12, gap-8
 * - placeholder text label-l, gray-500
 */
const FurnitureSearch = ({
  value,
  onChange,
  placeholder = '가구명을 입력하세요',
}: Props) => {
  return (
    <label
      className="
        flex w-full items-center gap-8 rounded-8 border border-gray-400
        bg-gray-200 p-12 transition-colors
        focus-within:border-functional-indigo
      "
    >
      <span className="sr-only">가구 검색</span>

      <img
        src={Search}
        alt="검색"
        aria-hidden="true"
        className="size-[18px] shrink-0"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="
          w-full bg-transparent label-l text-gray-800
          placeholder:text-gray-500
          focus:outline-none
        "
      />
    </label>
  );
};

export default FurnitureSearch;
