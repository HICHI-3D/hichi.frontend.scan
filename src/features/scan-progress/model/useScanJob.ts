import type { ScanJob } from '@entities/scan-job';
import { getScanJob } from '@shared/api';
import { useQuery } from '@tanstack/react-query';

/**
 * 단일 스캔 잡의 진행률을 추적하는 훅.
 *
 *   queryKey = ['furniture', jobId] — ScanPage 에 마운트된 useFurnitureList 가
 *   EventSource 로 SSE 를 상시 구독하고, furniture_updated 이벤트마다
 *   ['furniture'] prefix 전체를 invalidate 한다.
 *   → 이 훅도 자동으로 최신 데이터를 받으므로 refetchInterval 불필요.
 *
 *   백엔드 scan_poller 가 1초마다 AI → DB 동기화 + SSE broadcast 를 담당한다.
 */
const useScanJob = (jobId: string | null | undefined): ScanJob | null => {
  const enabled = Boolean(jobId);
  const query = useQuery({
    queryKey: ['furniture', jobId] as const,
    queryFn: async () => {
      // enabled=false 면 호출되지 않으므로 jobId 는 여기서 항상 truthy.
      const job = await getScanJob(jobId as string);
      // null 을 RQ data 로 두면 후속 invalidation 에서 다루기 까다로워 빈 상태로 throw.
      if (!job) throw new Error('잡을 찾을 수 없어요.');
      return job;
    },
    enabled,
  });

  return query.data ?? null;
};

export default useScanJob;
