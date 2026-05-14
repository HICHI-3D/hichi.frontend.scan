export type FurnitureCategory = '침대' | '책상' | '의자' | '소파' | '수납장' | '기타';

export type FurnitureItem = {
  id: string;
  name: string;
  category: FurnitureCategory;
  thumbnailUrl?: string;
  /** 즐겨찾기 여부 */
  favorite?: boolean;
};
