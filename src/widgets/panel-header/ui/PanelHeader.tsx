import Setting from '@/assets/icon/setting.svg';
import Logo from '@/assets/logo-haichi.svg';

type Props = {
  username?: string;
  onOpenSettings?: () => void;
};

/**
 * 상단 헤더 (Figma node 2219:340).
 * - bg gray-100, drop-shadow-under-2, p-8, w-full
 * - 좌: 配置 로고 (size-48, rounded-[6.5px])
 * - 우: 프로필 pill (bg gray-100, ds-all-12, gap-12, px-8 py-12, rounded-8)
 *      - 아바타(bg functional-indigo, size-28) · 이름(label-m) · 세로 디바이더 · 설정 아이콘(size-28)
 */
const PanelHeader = ({ username = 's0meri', onOpenSettings }: Props) => {
  return (
    <header className="
      flex w-full items-center justify-between bg-gray-100 p-8 ds-under-2
    ">
      {/* 좌측 로고 (配置) */}
      <div className="size-48 overflow-clip rounded-[6.5px]">
        <img
          src={Logo}
          alt="HICHI"
          className="size-full object-contain"
        />
      </div>

      {/* 우측 프로필 pill */}
      <div className="
        flex-center gap-12 rounded-8 border border-gray-400 bg-gray-100 p-8
      ">
        {/* 아바타 */}
        <div className="
          flex-center size-28 shrink-0 rounded-max bg-functional-indigo
        ">
          {/* TODO: 아바타 이미지 (avatar.svg / user-thumbnail) */}
          <img
            src=""
            alt=""
            aria-hidden="true"
            className="size-full rounded-max object-cover"
          />
        </div>

        <span className="label-m text-gray-800">{username}</span>

        {/* 세로 디바이더 */}
        <span className="h-20 w-px shrink-0 bg-gray-400" />

        {/* 설정 (system) */}
        <button
          type="button"
          onClick={onOpenSettings}
          aria-label="설정"
          className="flex-center size-28 shrink-0"
        >
          <img
            src={Setting}
            alt="setting"
            aria-hidden="true"
            className="size-full"
          />
        </button>
      </div>
    </header>
  );
};

export default PanelHeader;
