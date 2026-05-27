import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { type ReactNode, useState } from 'react';

/**
 * 앱 전역 providers.
 *
 * 현재는 TanStack Query 만 감싼다. SSE 이벤트가 invalidation 을 담당하므로
 * 자동 refetch 는 보수적으로 둔다 — 윈도우 포커스/네트워크 복귀 시 자동
 * refetch 는 끄고, stale time 도 짧게 잡아둔다.
 */
const AppProviders = ({ children }: { children: ReactNode }) => {
  // useState 로 한 번만 만들어진 인스턴스를 유지 (HMR / StrictMode 에서도 새로 만들지 않음).
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: 1,
            staleTime: 5_000,
          },
        },
      }),
  );
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
};

export default AppProviders;
