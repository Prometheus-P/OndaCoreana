export type Category = 'kpop' | 'korea_life' | 'korea_info';

export interface SourceConfig {
  name: string;
  url: string;
  category: Category;
}

export const sources: SourceConfig[] = [
  {
    name: 'Soompi',
    url: 'https://www.soompi.com/feed',
    category: 'kpop',
  },
  {
    name: 'The Korea Herald - Life',
    url: 'https://www.koreaherald.com/rss/020202000000.xml',
    category: 'korea_life',
  },
  {
    name: 'VisitKorea',
    url: 'https://english.visitkorea.or.kr/feed.rss',
    category: 'korea_info',
  },
];
