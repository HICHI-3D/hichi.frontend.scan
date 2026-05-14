import type { FurnitureItem } from '@entities/furniture';

/** 퍼블리싱 단계용 임시 mock 가구 목록. */
export const MOCK_FURNITURE: FurnitureItem[] = Array.from({ length: 8 }).map(
  (_, i) => ({
    id: `bed-${i + 1}`,
    name: '침대',
    category: '침대',
    favorite: i === 0,
  }),
);
