// API Types for KLEEREADER

export interface ComicListItem {
  title: string;
  link: string;
  image: string;
  chapter: string;
}

export interface TrendingComic extends ComicListItem {
  views: number | null;
  trending_score: number;
  timeframe: string;
}

export interface Genre {
  name: string;
  slug: string;
  link: string;
}

export interface Chapter {
  chapter: string;
  slug: string;
  link: string;
  date: string;
}

export interface ComicDetail {
  creator: string;
  slug: string;
  title: string;
  title_indonesian: string;
  image: string;
  synopsis: string;
  synopsis_full: string;
  summary: string;
  background_story: string;
  metadata: {
    type: string;
    author: string;
    status: string;
    concept: string;
    age_rating: string;
    reading_direction: string;
  };
  genres: Genre[];
  chapters: Chapter[];
}

export interface ChapterData {
  creator: string;
  manga_title: string;
  chapter_title: string;
  navigation: {
    previousChapter: string | null;
    nextChapter: string | null;
    chapterList: string | null;
  };
  images: string[];
}

export interface HomepageData {
  creator: string;
  popular: ComicListItem[];
  latest: ComicListItem[];
  ranking: ComicListItem[];
}

export interface TrendingData {
  creator: string;
  trending: TrendingComic[];
  timeframe: string;
  count: number;
  last_updated: string;
}

export interface GenreList {
  [key: string]: {
    value: string;
    name: string;
  };
  creator: string;
}

export interface SearchResult {
  creator: string;
  results: ComicListItem[];
  total: number;
  page: number;
  limit: number;
}

export interface GenreComicsData {
  creator: string;
  genre: string;
  comics: ComicListItem[];
  total: number;
  page: number;
  limit: number;
}

// Frontend Types
export interface ComicCardProps {
  title: string;
  image: string;
  chapter: string;
  slug: string;
}

export interface ReadingProgress {
  slug: string;
  chapterSlug: string;
  title: string;
  chapterTitle: string;
  image?: string;
  lastRead: string;
}
