// types.ts

export interface BangumiSubject {
  id: number;
  name: string;
  name_cn: string;
  date: string; // Air date, e.g., "2006-04-03"
  images: {
    small: string;
    grid: string;
    large: string;
    medium: string;
    common: string;
  };
  score?: number;
  user_rate?: number; // User's personal rating from collection
}

export interface BangumiCollectionItem {
  subject_id: number;
  subject_type: number;
  rate: number;
  type: number; // 2 = Watched
  subject: BangumiSubject;
}

export interface BangumiUser {
  id: number;
  username: string;
  nickname: string;
  avatar: {
    large: string;
    medium: string;
    small: string;
  };
}

export interface GroupedAnime {
  [year: string]: BangumiSubject[];
}

export interface ChartDataPoint {
  year: string;
  count: number;
}