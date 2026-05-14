import type { ScanJob } from '@entities/scan-job';

type Props = {
  job: ScanJob;
  onDismiss?: () => void;
};

/**
 * 스캔 작업 진행 상태 풀스크린 오버레이.
 *
 * - 단계별 한국어 라벨 + 진행률 바
 * - 완료 시 "확인" 버튼 노출 → onDismiss
 * - 실패 시 메시지 노출 (역시 onDismiss 로 닫기)
 */
const ScanProgressOverlay = ({ job, onDismiss }: Props) => {
  const pct = Math.round(job.progress * 100);
  const done = job.status === 'completed';
  const failed = job.status === 'failed';

  return (
    <div className="fixed inset-0 z-50 flex-center bg-black/70 px-24">
      <div className="
        col w-full max-w-[360px] gap-20 rounded-24 bg-gray-100 px-24 py-32
      ">
        <h3 className="text-center body-s text-black">
          {done
            ? '스캔 완료!'
            : failed
              ? '스캔 실패'
              : '3D 모델 만드는 중...'}
        </h3>

        {failed ? (
          <p className="text-center label-l text-red-500">
            {job.error ?? '알 수 없는 오류가 발생했어요.'}
          </p>
        ) : (
          <div className="col gap-12">
            <p className="text-center label-l text-gray-700">{job.stageLabel}</p>
            <div className="h-8 w-full overflow-clip rounded-max bg-gray-300">
              <div
                className="
                  h-full bg-functional-indigo transition-all duration-300
                "
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="text-center label-m text-gray-600">{pct}%</p>
          </div>
        )}

        {(done || failed) && (
          <button
            type="button"
            onClick={onDismiss}
            className="
              flex-center w-full rounded-16 bg-functional-indigo px-24 py-12
              body-s text-gray-200
            "
          >
            확인
          </button>
        )}
      </div>
    </div>
  );
};

export default ScanProgressOverlay;
