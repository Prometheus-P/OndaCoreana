/**
 * RSS Feed Sources Configuration
 * Categories: kpop, korea_life, korea_info
 */

export type Category = "kpop" | "korea_life" | "korea_info";

export interface RSSSource {
  name: string;
  url: string;
  category: Category;
  language?: string;
}

export const RSS_SOURCES: RSSSource[] = [
  // K-Pop Sources
  {
    name: "Soompi K-Pop",
    url: "https://www.soompi.com/feed/kpop",
    category: "kpop",
  },
  {
    name: "AllKPop",
    url: "https://www.allkpop.com/rss",
    category: "kpop",
  },
  {
    name: "KoreaBoo",
    url: "https://www.koreaboo.com/feed/",
    category: "kpop",
  },

  // Korea Life Sources
  {
    name: "Korea Herald Lifestyle",
    url: "https://www.koreaherald.com/common/rss_xml.php?ct=108",
    category: "korea_life",
  },
  {
    name: "Korea JoongAng Daily Life",
    url: "https://koreajoongangdaily.joins.com/section/rss/life-style",
    category: "korea_life",
  },

  // Korea Info Sources
  {
    name: "Korea Herald National",
    url: "https://www.koreaherald.com/common/rss_xml.php?ct=102",
    category: "korea_info",
  },
  {
    name: "Yonhap News English",
    url: "https://en.yna.co.kr/RSS/news.xml",
    category: "korea_info",
  },
];

export function getSourcesByCategory(category: Category): RSSSource[] {
  return RSS_SOURCES.filter((source) => source.category === category);
}
