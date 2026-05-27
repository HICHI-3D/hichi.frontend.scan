import { fetchFurnitureList, subscribeFurnitureEvents } from '@shared/api';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

export const FURNITURE_QUERY_KEY = ['furniture'] as const;

/**
 * 백엔드의 가구 목록을 실시간으로 추적하는 훅.
 *
 *   1. TanStack Query 가 GET /api/furniture/ 결과를 캐시.
 *   2. EventSource('/api/furniture/events/stream') 로 furniture_updated 이벤트 구독.
 *      → 어떤 가구가 변했는지 관계없이 ['furniture'] prefix 의 모든 쿼리를 invalidate.
 *        (리스트 + 개별 가구 쿼리 useScanJob 까지 함께 갱신됨)
 *
 * 호출처(`ScanPage`) 가 `{ items }` 만 쓰는 인터페이스를 유지하기 위해 RQ
 * 반환값을 얇게 래핑한다.
 */
const useFurnitureList = () => {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: FURNITURE_QUERY_KEY,
    queryFn: fetchFurnitureList,
  });

  // SSE 가 invalidation 트리거 — RQ 가 알아서 dedupe + refetch.
  useEffect(() => {
    const unsubscribe = subscribeFurnitureEvents(() => {
      void queryClient.invalidateQueries({ queryKey: FURNITURE_QUERY_KEY });
    });
    return unsubscribe;
  }, [queryClient]);

  return {
    items: query.data ?? [],
    loading: query.isPending,
    error: query.error
      ? query.error instanceof Error
        ? query.error.message
        : '가구 목록을 불러오지 못했어요.'
      : null,
    refetch: () => {
      void query.refetch();
    },
  };
};

export default useFurnitureList;
