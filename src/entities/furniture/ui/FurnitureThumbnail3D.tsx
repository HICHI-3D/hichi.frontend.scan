/**
 * 가구 카드의 3D 썸네일 — `<model-viewer>` 웹 컴포넌트로 .glb 를 렌더.
 *
 * index.html 에서 CDN 으로 model-viewer 가 로드된 상태를 가정한다.
 * 컴포넌트 자체는 단순한 wrapper — 카드 안에서 size-108 박스에 들어갈 정사각형이다.
 */

type Props = {
  modelUrl: string;
  alt?: string;
  size?: number;
};

const FurnitureThumbnail3D = ({ modelUrl, alt, size = 108 }: Props) => {
  // model-viewer 는 boolean 속성을 빈 문자열 ("") 로 켠다.
  // 카드 썸네일은 시각적 미리보기 용도라 사용자 입력은 막아두고 회전만 자동.
  return (
    <model-viewer
      src={modelUrl}
      alt={alt ?? '3D 가구 미리보기'}
      auto-rotate=""
      rotation-per-second="20deg"
      interaction-prompt="none"
      disable-zoom=""
      disable-pan=""
      disable-tap=""
      touch-action="none"
      shadow-intensity={1}
      exposure={1}
      loading="lazy"
      reveal="auto"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: 'transparent',
        // 사용자 드래그/줌 등 제스처가 카드 전체 클릭을 가리지 않도록.
        pointerEvents: 'none',
      }}
    />
  );
};

export default FurnitureThumbnail3D;
