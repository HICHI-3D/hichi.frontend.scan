/**
 * `<model-viewer>` 웹 컴포넌트의 JSX 타입.
 *
 * 실제 스크립트는 index.html 에서 CDN 으로 로드되며, 여기서는 TS 가 JSX 사용을 막지 않도록
 * 최소한의 타입만 선언한다. (camera-controls, auto-rotate 등 모든 속성을 단순히 string 으로
 * 받아도 무방하다 — 런타임에서 어차피 web component 가 직접 해석함.)
 */
import type * as React from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          src?: string;
          alt?: string;
          poster?: string;
          'camera-controls'?: boolean | string;
          'auto-rotate'?: boolean | string;
          'auto-rotate-delay'?: number | string;
          'rotation-per-second'?: string;
          'interaction-prompt'?: 'auto' | 'none';
          'shadow-intensity'?: number | string;
          exposure?: number | string;
          loading?: 'auto' | 'lazy' | 'eager';
          reveal?: 'auto' | 'interaction' | 'manual';
          'disable-zoom'?: boolean | string;
          'disable-pan'?: boolean | string;
          'disable-tap'?: boolean | string;
          'touch-action'?: string;
          'environment-image'?: string;
        },
        HTMLElement
      >;
    }
  }
}

export {};
