import type { ScanJob } from '@entities/scan-job';
import { getScanJob } from '@shared/api';
import { useQuery } from '@tanstack/react-query';

const POLL_INTERVAL_MS = 1000;

/**
 * 단일 스캔 잡의 진행률을 추적하는 훅.
 *
 *   queryKey = ['furniture', jobId] — useFurnitureList 의 ['furniture'] prefix
 *   invalidation 에 함께 잡힌다.
 *
 *   refetchInterval 이 setTimeout 기반 폴링(pollScanJob) 의 역할을 대체한다.
 *   `GET /api/furniture/{id}` 가 백엔드 hichi.ai 동기화 + SSE broadcast 를
 *   트리거하므로, 폴링 자체가 백엔드 동기화 트리거 역할도 같이 한다.
 *   잡이 completed / failed / cancelled 상태가 되면 자동으로 refetch 중단.
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
    refetchInterval: (q) => {
      const data = q.state.data;
      if (!data) return POLL_INTERVAL_MS;
      if (
        data.status === 'completed' ||
        data.status === 'failed' ||
        data.status === 'cancelled'
      ) {
        return false;
      }
      return POLL_INTERVAL_MS;
    },
  });

  return query.data ?? null;
};

export default useScanJob;
