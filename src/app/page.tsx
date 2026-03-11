'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Clock,
  Heart,
  ChevronRight,
  ChevronLeft,
  BookOpen,
  Flame,
  Grid3X3,
  History,
  Moon,
  Sun,
  Loader2,
  X,
  Bookmark,
  BookMarked,
  Globe,
  Home,
  Compass,
  Library,
  TrendingUp,
  Trash2,
  Star,
  Sparkles,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useComicStore } from '@/lib/store';
import { useTheme } from 'next-themes';
import { ComicSource } from '@/lib/api/comic';

// Types
interface ComicItem {
  title: string;
  slug?: string;
  link?: string;
  url?: string;
  detailUrl?: string;
  image?: string;
  imageSrc?: string;
  thumbnail?: string;
  cover?: string;
  chapter?: string;
  latestChapter?: string;
  type?: string;
  genre?: string;
  description?: string;
  stats?: string;
  rating?: string;
  views?: string;
  status?: string;
  date?: string;
  source?: ComicSource;
}

interface Genre {
  slug: string;
  name: string;
  link?: string;
}

interface ComicDetail {
  slug: string;
  title: string;
  title_indonesian?: string;
  alternative_title?: string;
  image?: string;
  thumbnail?: string;
  cover?: string;
  synopsis?: string;
  description?: string;
  // Direct fields from API
  type?: string;
  status?: string;
  author?: string;
  artist?: string;
  rating?: string;
  reader?: string;
  release?: string;
  // Also support nested metadata for compatibility
  metadata?: {
    type?: string;
    author?: string;
    status?: string;
    age_rating?: string;
    artist?: string;
  };
  genres?: Genre[];
  chapters?: { chapter: string; slug: string; link?: string; date?: string; title?: string; url?: string }[];
}

interface ChapterData {
  manga_title?: string;
  comic_title?: string;
  chapter_title?: string;
  navigation?: {
    previousChapter?: string | null;
    prev?: string | null;
    nextChapter?: string | null;
    next?: string | null;
    chapterList?: string | null;
  };
  images?: string[];
  pages?: { url: string }[];
}

// All available sources
const ALL_SOURCES: ComicSource[] = ['bacakomik', 'komikstation', 'maid', 'komikindo', 'bacaman', 'meganei', 'softkomik'];

// Sources that support /type/ endpoint
const TYPE_SOURCES: ComicSource[] = ['komikstation', 'bacaman', 'softkomik'];

// Sources that support /popular/ endpoint  
const POPULAR_SOURCES: ComicSource[] = ['bacakomik', 'komikstation', 'bacaman'];

// Helper function to process chapters from API response
function processChapters(chaptersData: unknown[]): { chapter: string; slug: string; date: string }[] {
  if (!Array.isArray(chaptersData)) return [];
  
  return chaptersData.map((ch: unknown, idx: number) => {
    const chapter = ch as Record<string, unknown>;
    // Get chapter title from various fields or extract from slug
    let chapterTitle = (chapter.title as string) || (chapter.chapter as string) || (chapter.name as string) || '';
    const chSlug = (chapter.slug as string) || (chapter.url as string) || '';
    
    // If title is empty, extract chapter number from slug
    if (!chapterTitle && chSlug) {
      const match = chSlug.match(/chapter[-_]?(\d+)/i);
      if (match) {
        chapterTitle = `Chapter ${match[1]}`;
      } else {
        chapterTitle = `Chapter ${idx + 1}`;
      }
    }
    
    return {
      chapter: chapterTitle,
      slug: chSlug,
      date: (chapter.date as string) || '',
    };
  });
}

// Helper functions
function extractSlug(comic: ComicItem): string {
  if (comic.slug) return comic.slug;
  const linkOrUrl = comic.link || comic.url || comic.detailUrl;
  if (!linkOrUrl) return comic.title?.toLowerCase().replace(/\s+/g, '-') || '';
  const parts = linkOrUrl.replace(/^\/|\/$/g, '').split('/');
  const lastPart = parts[parts.length - 1] || parts[parts.length - 2] || '';
  return lastPart.split('?')[0];
}

function getImageUrl(comic: ComicItem | ComicDetail): string {
  const url = comic.image || (comic as ComicItem).imageSrc || comic.thumbnail || comic.cover || '';
  if (!url || url === '' || url === 'null' || url === 'undefined') {
    return 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="180" height="240" viewBox="0 0 180 240"><rect fill="%231c1c26" width="180" height="240"/><text fill="%23555" font-family="sans-serif" font-size="12" text-anchor="middle" x="90" y="120">No Image</text></svg>';
  }
  return url;
}

function getChapterText(comic: ComicItem): string {
  if (comic.latestChapter) return comic.latestChapter;
  if (comic.chapter) return comic.chapter;
  return 'Chapter 1';
}

function normalizeComic(comic: ComicItem, source: ComicSource): ComicItem & { source: ComicSource } {
  return {
    ...comic,
    source,
    slug: comic.slug || extractSlug(comic),
    link: comic.link || comic.url || comic.detailUrl || `/${comic.slug}`,
    image: getImageUrl(comic),
    chapter: getChapterText(comic),
    type: comic.type?.toLowerCase() || 'manga',
  };
}

function transformApiResponse(data: Record<string, unknown>): ComicItem[] {
  if (Array.isArray(data)) return data;
  
  if (data.komikList && Array.isArray(data.komikList)) {
    return data.komikList.map((c: Record<string, unknown>) => ({
      title: c.title as string,
      slug: c.slug as string,
      cover: c.cover as string,
      image: c.cover as string,
      chapter: c.chapter as string,
      type: c.type as string,
      date: c.date as string,
    }));
  }
  
  if (data.trending && Array.isArray(data.trending)) {
    return data.trending.map((c: Record<string, unknown>) => ({
      title: c.title as string,
      slug: c.slug as string,
      image: c.imageSrc as string,
      imageSrc: c.imageSrc as string,
      rating: c.rating as string,
      chapter: c.latestChapter as string,
      latestChapter: c.latestChapter as string,
    }));
  }
  
  if (data.latest && Array.isArray(data.latest)) {
    return data.latest.map((c: Record<string, unknown>) => ({
      title: c.title as string,
      slug: c.slug as string,
      image: c.imageSrc as string,
      imageSrc: c.imageSrc as string,
      chapter: c.latestChapter as string,
      latestChapter: c.latestChapter as string,
    }));
  }
  
  const possibleKeys = ['results', 'data', 'comics', 'manga', 'list', 'comicList', 'update'];
  for (const key of possibleKeys) {
    if (data[key] && Array.isArray(data[key])) {
      return data[key];
    }
  }
  
  const values = Object.values(data);
  const arrays = values.filter((v): v is unknown[] => Array.isArray(v));
  if (arrays.length > 0) {
    return arrays[0];
  }
  
  return [];
}

// Type badge styles
const TYPE_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  manga: { bg: 'bg-sky-500', text: 'text-sky-400', border: 'border-sky-500' },
  manhwa: { bg: 'bg-blue-500', text: 'text-blue-400', border: 'border-blue-500' },
  manhua: { bg: 'bg-amber-500', text: 'text-amber-400', border: 'border-amber-500' },
};

// Horizontal Scroll Container with touch support
function HorizontalScroll({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDown, setIsDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDown(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseLeave = () => setIsDown(false);
  const handleMouseUp = () => setIsDown(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDown || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  return (
    <div 
      ref={scrollRef}
      className={`flex gap-2 overflow-x-auto scrollbar-hide cursor-grab active:cursor-grabbing ${className}`}
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      onMouseDown={handleMouseDown}
      onMouseLeave={handleMouseLeave}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
    >
      {children}
    </div>
  );
}

// Comic Card
function ComicCard({ 
  comic, 
  onClick, 
  index,
  source,
  compact = false,
}: { 
  comic: ComicItem; 
  onClick?: () => void; 
  index?: number;
  source: ComicSource;
  compact?: boolean;
}) {
  const slug = comic.slug || extractSlug(comic);
  const isFavorite = useComicStore((state) => state.isFavorite(`${source}-${slug}`));
  const imageUrl = getImageUrl(comic);
  const typeKey = comic.type?.toLowerCase() || 'manga';
  const typeStyle = TYPE_STYLES[typeKey] || TYPE_STYLES.manga;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min((index || 0) * 0.02, 0.3) }}
      className={`group cursor-pointer flex-shrink-0 ${compact ? 'w-[100px]' : ''}`}
      onClick={onClick}
    >
      <div className={`relative rounded-md overflow-hidden bg-card transition-all duration-200 group-hover:scale-[1.02] group-hover:ring-1 group-hover:ring-sky-500/30 ${compact ? 'w-[100px]' : ''}`}>
        <div className={`relative overflow-hidden ${compact ? 'aspect-[3/4] w-[100px]' : 'aspect-[3/4]'}`}>
          <img
            src={imageUrl}
            alt={comic.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              if (!target.src.includes('data:image/svg')) {
                target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="180" height="240" viewBox="0 0 180 240"><rect fill="%231c1c26" width="180" height="240"/><text fill="%23555" font-family="sans-serif" font-size="12" text-anchor="middle" x="90" y="120">No Image</text></svg>';
              }
            }}
          />
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          
          <div className="absolute top-1.5 left-1.5">
            <span className={`px-1.5 py-0.5 text-[9px] font-bold text-white rounded ${typeStyle.bg}`}>
              {typeKey.toUpperCase()}
            </span>
          </div>

          {isFavorite && (
            <div className="absolute top-1.5 right-1.5">
              <Heart className="w-3.5 h-3.5 text-sky-500 fill-sky-500" />
            </div>
          )}
        </div>

        {!compact && (
          <div className="p-2">
            <h3 className="text-[11px] font-medium text-foreground line-clamp-2 leading-tight group-hover:text-foreground">
              {comic.title}
            </h3>
          </div>
        )}
      </div>
      {compact && (
        <h3 className="text-[10px] font-medium text-foreground line-clamp-2 leading-tight mt-1 w-[100px]">
          {comic.title}
        </h3>
      )}
    </motion.div>
  );
}

// Library Card for History/Favorites
function LibraryCard({ 
  item,
  type,
  onClick,
  onRemove,
}: { 
  item: { slug: string; title: string; image?: string; chapter?: string; chapterTitle?: string };
  type: 'favorite' | 'history';
  onClick: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center gap-3 p-2 bg-card rounded-lg group">
      <div 
        className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
        onClick={onClick}
      >
        <img 
          src={item.image || ''} 
          alt={item.title}
          className="w-12 h-16 object-cover rounded"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="48" height="64" viewBox="0 0 48 64"><rect fill="%231c1c26" width="48" height="64"/></svg>';
          }}
        />
        <div className="flex-1 min-w-0">
          <h4 className="text-xs font-medium text-foreground truncate">{item.title}</h4>
          <p className="text-[10px] text-muted-foreground truncate">
            {type === 'history' ? item.chapterTitle : item.chapter}
          </p>
        </div>
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); onRemove(); }}
        className="p-1.5 text-muted-foreground hover:text-sky-500 transition-colors"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}

// Featured Banner with Search
function FeaturedBanner({ 
  comics, 
  onComicClick,
  searchQuery,
  onSearchChange 
}: { 
  comics: ComicItem[]; 
  onComicClick: (slug: string, source: ComicSource) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}) {
  const [current, setCurrent] = useState(0);
  const items = comics.filter(c => {
    const url = getImageUrl(c);
    return url && !url.includes('data:image/svg');
  }).slice(0, 5);

  useEffect(() => {
    if (items.length === 0) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % items.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [items.length]);

  if (items.length === 0) return null;

  return (
    <div className="relative overflow-hidden rounded-lg bg-card">
      {/* Banner Slider */}
      <div className="relative h-[180px] overflow-hidden">
        {items.map((comic, idx) => {
          const imgUrl = getImageUrl(comic);
          if (!imgUrl || imgUrl.includes('data:image/svg')) return null;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0 }}
              animate={{ opacity: idx === current ? 1 : 0 }}
              transition={{ duration: 0.5 }}
              className={`absolute inset-0 cursor-pointer ${idx === current ? 'z-10' : 'z-0'}`}
              onClick={() => onComicClick(comic.slug || extractSlug(comic), comic.source || 'bacakomik')}
            >
              <img
                src={imgUrl}
                alt={comic.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
              <div className="absolute bottom-2 left-3 right-3">
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[8px] font-bold bg-sky-500 text-white rounded mb-1">
                  <Star className="w-2.5 h-2.5" />
                  POPULER
                </span>
                <h3 className="text-sm font-bold text-foreground line-clamp-1">{comic.title}</h3>
              </div>
            </motion.div>
          );
        })}
        
        {/* Dots */}
        <div className="absolute bottom-2 right-3 z-20 flex gap-1">
          {items.map((_, idx) => (
            <button
              key={idx}
              onClick={(e) => { e.stopPropagation(); setCurrent(idx); }}
              className={`w-1.5 h-1.5 rounded-full ${idx === current ? 'bg-sky-500' : 'bg-white/30'}`}
            />
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-3 bg-muted">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Cari komik favoritmu..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-card border-0 pl-9 pr-4 h-9 text-xs text-foreground placeholder-muted-foreground rounded-lg"
          />
        </div>
      </div>
    </div>
  );
}

// View Terbanyak Section - Different content for each period
function ViewTerbanyakSection({ onComicClick, onMoreClick }: { onComicClick: (slug: string, source: ComicSource) => void; onMoreClick: (period: 'today' | 'weekly' | 'monthly') => void }) {
  const [period, setPeriod] = useState<'today' | 'weekly' | 'monthly'>('today');
  const [comicsData, setComicsData] = useState<Record<string, ComicItem[]>>({
    today: [],
    weekly: [],
    monthly: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const [todayRes, weeklyRes, monthlyRes] = await Promise.all([
          fetch('/api/comic/source/bacakomik/popular'),
          fetch('/api/comic/source/komikstation/popular'),
          fetch('/api/comic/source/bacaman/popular'),
        ]);

        const todayData = todayRes.ok ? await todayRes.json() : null;
        const weeklyData = weeklyRes.ok ? await weeklyRes.json() : null;
        const monthlyData = monthlyRes.ok ? await monthlyRes.json() : null;

        setComicsData({
          today: transformApiResponse(todayData).slice(0, 10).map(c => normalizeComic(c, 'bacakomik')),
          weekly: transformApiResponse(weeklyData).slice(0, 10).map(c => normalizeComic(c, 'komikstation')),
          monthly: transformApiResponse(monthlyData).slice(0, 10).map(c => normalizeComic(c, 'bacaman')),
        });
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, []);

  const comics = comicsData[period];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-sky-400" />
          <h2 className="text-sm font-semibold text-foreground">View Terbanyak</h2>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1 bg-card rounded-lg p-0.5">
            {(['today', 'weekly', 'monthly'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-2 py-1 text-[10px] font-medium rounded-md transition-colors ${
                  period === p ? 'bg-sky-500 text-white' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {p === 'today' ? 'Today' : p === 'weekly' ? 'Weekly' : 'Monthly'}
              </button>
            ))}
          </div>
          <button 
            onClick={() => onMoreClick(period)}
            className="text-[10px] text-sky-400 hover:text-sky-400 flex items-center gap-0.5"
          >
            More <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center py-6">
          <Loader2 className="w-5 h-5 animate-spin text-sky-500" />
        </div>
      ) : (
        <HorizontalScroll className="pb-2">
          {comics.map((comic, idx) => (
            <ComicCard 
              key={`view-${period}-${idx}`} 
              comic={comic} 
              index={idx} 
              source={comic.source || 'bacakomik'} 
              onClick={() => onComicClick(comic.slug || extractSlug(comic), (comic.source as ComicSource) || 'bacakomik')}
              compact 
            />
          ))}
        </HorizontalScroll>
      )}
    </div>
  );
}

// Populer Section
function PopulerSection({ onComicClick, onMoreClick }: { onComicClick: (slug: string, source: ComicSource) => void; onMoreClick: () => void }) {
  const [comics, setComics] = useState<ComicItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComics = async () => {
      setLoading(true);
      try {
        const promises = POPULAR_SOURCES.map(s => 
          fetch(`/api/comic/source/${s}/popular`).then(r => r.ok ? r.json() : null).catch(() => null)
        );
        
        const results = await Promise.all(promises);
        const allComics: ComicItem[] = [];
        
        results.forEach((data, idx) => {
          if (data) {
            const items = transformApiResponse(data);
            items.slice(0, 5).forEach(item => {
              allComics.push(normalizeComic(item, POPULAR_SOURCES[idx]));
            });
          }
        });
        
        setComics(allComics.slice(0, 15));
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    fetchComics();
  }, []);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-sky-400" />
          <h2 className="text-sm font-semibold text-foreground">Populer</h2>
        </div>
        <button 
          onClick={onMoreClick}
          className="text-[10px] text-sky-400 hover:text-sky-400 flex items-center gap-0.5"
        >
          More <ChevronRight className="w-3 h-3" />
        </button>
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center py-6">
          <Loader2 className="w-5 h-5 animate-spin text-sky-500" />
        </div>
      ) : (
        <HorizontalScroll className="pb-2">
          {comics.map((comic, idx) => (
            <ComicCard 
              key={`populer-${idx}`} 
              comic={comic} 
              index={idx} 
              source={comic.source || 'bacakomik'} 
              onClick={() => onComicClick(comic.slug || extractSlug(comic), comic.source || 'bacakomik')}
              compact 
            />
          ))}
        </HorizontalScroll>
      )}
    </div>
  );
}

// Update Terbaru Section with Type Tabs
function UpdateTerbaruSection({ onComicClick, onMoreClick }: { onComicClick: (slug: string, source: ComicSource) => void; onMoreClick: (type: 'manga' | 'manhwa' | 'manhua') => void }) {
  const [activeType, setActiveType] = useState<'manga' | 'manhwa' | 'manhua'>('manga');
  const [comics, setComics] = useState<ComicItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComics = async () => {
      setLoading(true);
      try {
        const promises = TYPE_SOURCES.map(s => 
          fetch(`/api/comic/source/${s}/type/${activeType}`).then(r => r.ok ? r.json() : null).catch(() => null)
        );
        
        const results = await Promise.all(promises);
        const allComics: ComicItem[] = [];
        
        results.forEach((data, idx) => {
          if (data) {
            const items = transformApiResponse(data);
            items.forEach(item => {
              allComics.push(normalizeComic(item, TYPE_SOURCES[idx]));
            });
          }
        });
        
        // Filter by type and take only matching comics
        const filteredComics = allComics
          .filter(c => c.type?.toLowerCase() === activeType)
          .slice(0, 15);
        
        setComics(filteredComics);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    fetchComics();
  }, [activeType]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">Update Terbaru</h2>
        <button 
          onClick={() => onMoreClick(activeType)}
          className="text-[10px] text-sky-400 hover:text-sky-400 flex items-center gap-0.5"
        >
          More <ChevronRight className="w-3 h-3" />
        </button>
      </div>
      
      <div className="flex gap-1">
        {(['manga', 'manhwa', 'manhua'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setActiveType(t)}
            className={`px-3 py-1.5 text-[10px] font-medium rounded-md transition-colors ${
              activeType === t 
                ? 'bg-sky-500 text-white' 
                : 'bg-card text-muted-foreground hover:text-sky-400'
            }`}
          >
            {t.toUpperCase()}
          </button>
        ))}
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center py-6">
          <Loader2 className="w-5 h-5 animate-spin text-sky-500" />
        </div>
      ) : comics.length === 0 ? (
        <div className="flex items-center justify-center py-6 text-muted-foreground text-xs">
          Tidak ada {activeType} ditemukan
        </div>
      ) : (
        <HorizontalScroll className="pb-2">
          {comics.map((comic, idx) => (
            <ComicCard 
              key={`update-${activeType}-${idx}`} 
              comic={comic} 
              index={idx} 
              source={comic.source || 'bacakomik'} 
              onClick={() => onComicClick(comic.slug || extractSlug(comic), (comic.source as ComicSource) || 'bacakomik')}
              compact 
            />
          ))}
        </HorizontalScroll>
      )}
    </div>
  );
}

// Detail View
function ComicDetailView({ 
  slug, 
  source, 
  onBack 
}: { 
  slug: string; 
  source: ComicSource;
  onBack: () => void;
}) {
  const [comic, setComic] = useState<ComicDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [readingChapter, setReadingChapter] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'chapters' | 'synopsis'>('chapters');

  const { addFavorite, removeFavorite, isFavorite, addToHistory } = useComicStore();
  const compositeKey = `${source}-${slug}`;
  const isFav = isFavorite(compositeKey);

  useEffect(() => {
    const fetchComic = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/comic/source/${source}/detail/${slug}`);
        if (res.ok) {
          const data = await res.json();
          const detail = data.detail || data.data || data.result || data.comic || data.manga || data;
          
          // Parse genres - handle both array and string formats
          let parsedGenres: Genre[] = [];
          if (detail.genres && Array.isArray(detail.genres)) {
            parsedGenres = detail.genres;
          } else if (detail.genreList && Array.isArray(detail.genreList)) {
            parsedGenres = detail.genreList;
          } else if (detail.genre && typeof detail.genre === 'string') {
            // Split genre string by common separators: . , / and spaces
            const genreStr = detail.genre as string;
            const genreNames = genreStr.split(/[.,\/\s]+/).map(g => g.trim()).filter(g => g.length > 0);
            parsedGenres = genreNames.map(name => ({ slug: name.toLowerCase().replace(/\s+/g, '-'), name }));
          }
          
          setComic({
            ...detail,
            slug: detail.slug || slug,
            title: detail.title || '',
            image: detail.image || detail.cover || detail.thumbnail,
            genres: parsedGenres,
            chapters: processChapters(detail.chapters || detail.chapterList || []),
          });
        }
      } catch (error) {
        console.error('Failed to fetch comic:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchComic();
  }, [slug, source]);

  const handleFavorite = () => {
    if (comic) {
      if (isFav) {
        removeFavorite(compositeKey);
      } else {
        addFavorite({
          slug: compositeKey,
          title: comic.title,
          image: comic.image || '',
          chapter: comic.chapters?.[0]?.chapter,
        });
      }
    }
  };

  if (readingChapter && comic) {
    return (
      <ChapterReader
        slug={readingChapter}
        source={source}
        onBack={() => setReadingChapter(null)}
        comicTitle={comic.title}
        comicSlug={slug}
        comicImage={comic.image}
        chapters={comic.chapters}
      />
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
      </div>
    );
  }

  if (!comic) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground text-sm">Komik tidak ditemukan</p>
        <Button onClick={onBack} size="sm" className="mt-3 bg-sky-500 hover:bg-sky-600">Kembali</Button>
      </div>
    );
  }

  const chapters = comic.chapters || [];
  const genres = comic.genres || [];
  const imageUrl = getImageUrl(comic);
  // Handle both direct type/status and metadata nested type/status
  const typeKey = (comic.type || comic.metadata?.type || 'manga').toLowerCase();
  const typeStyle = TYPE_STYLES[typeKey] || TYPE_STYLES.manga;
  const comicStatus = comic.status || comic.metadata?.status;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <button onClick={onBack} className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors">
        <ChevronLeft className="w-5 h-5" />
        <span className="text-sm">Kembali</span>
      </button>

      <div className="flex gap-3">
        <div className="flex-shrink-0">
          <div className="relative w-28 aspect-[3/4] rounded-md overflow-hidden shadow-lg">
            <img src={imageUrl} alt={comic.title} className="w-full h-full object-cover" />
          </div>
        </div>

        <div className="flex-1 min-w-0 space-y-2">
          <div>
            <div className="flex flex-wrap gap-1 mb-1">
              <span className={`px-1.5 py-0.5 text-[9px] font-bold text-white rounded ${typeStyle.bg}`}>
                {(typeKey.toUpperCase())}
              </span>
              {comicStatus && comicStatus !== 'Unknown' && (
                <span className={`px-1.5 py-0.5 text-[9px] font-medium rounded ${
                  comicStatus === 'Ongoing' ? 'bg-green-500/20 text-green-400' : 'bg-muted text-muted-foreground'
                }`}>
                  {comicStatus}
                </span>
              )}
            </div>
            <h1 className="text-base font-bold text-foreground leading-tight line-clamp-2">{comic.title}</h1>
          </div>

          {genres.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {genres.slice(0, 4).map((genre, idx) => (
                <span key={idx} className="px-1.5 py-0.5 text-[9px] bg-card text-muted-foreground rounded-full">
                  {genre.name}
                </span>
              ))}
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <Button
              size="sm"
              className="flex-1 bg-sky-500 hover:bg-sky-600 text-white h-8 text-xs"
              onClick={() => {
                const lastChapter = chapters[chapters.length - 1];
                if (lastChapter) {
                  const chapterSlug = lastChapter.slug || extractSlug(lastChapter.link || lastChapter.url);
                  addToHistory({
                    slug: compositeKey,
                    chapterSlug,
                    title: comic.title,
                    chapterTitle: lastChapter.chapter || lastChapter.title || '',
                    image: imageUrl,
                  });
                  setReadingChapter(chapterSlug);
                }
              }}
            >
              <BookOpen className="w-3.5 h-3.5 mr-1" />
              Baca
            </Button>
            <Button
              size="sm"
              variant="outline"
              className={`h-8 w-8 p-0 border-border ${isFav ? 'text-sky-500' : 'text-muted-foreground'}`}
              onClick={handleFavorite}
            >
              <Heart className={`w-4 h-4 ${isFav ? 'fill-sky-500' : ''}`} />
            </Button>
          </div>
        </div>
      </div>

      <div className="border-b border-border">
        <div className="flex gap-4">
          {(['chapters', 'synopsis'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2 text-xs font-medium relative ${
                activeTab === tab ? 'text-sky-400' : 'text-muted-foreground'
              }`}
            >
              {tab === 'chapters' ? `Chapter (${chapters.length})` : 'Sinopsis'}
              {activeTab === tab && (
                <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-500" />
              )}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'chapters' && (
          <motion.div key="chapters" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="bg-muted rounded-lg overflow-hidden">
              <ScrollArea className="h-[300px]">
                <div className="divide-y divide-border">
                  {chapters.map((chapter, idx) => {
                    const chapterSlug = chapter.slug || extractSlug(chapter.link || chapter.url);
                    const chapterNum = chapters.length - idx; // Chapters are usually listed newest first
                    const chapterTitle = chapter.chapter || chapter.title || '';
                    const displayTitle = chapterTitle.toLowerCase().includes('chapter') 
                      ? chapterTitle 
                      : `Chapter ${chapterNum}${chapterTitle ? ` - ${chapterTitle}` : ''}`;
                    return (
                      <div
                        key={idx}
                        className="flex items-center justify-between px-3 py-2 hover:bg-card cursor-pointer transition-colors"
                        onClick={() => {
                          addToHistory({
                            slug: compositeKey,
                            chapterSlug,
                            title: comic.title,
                            chapterTitle: displayTitle,
                            image: imageUrl,
                          });
                          setReadingChapter(chapterSlug);
                        }}
                      >
                        <span className="text-xs text-foreground">{displayTitle}</span>
                        {chapter.date && <span className="text-[10px] text-muted-foreground">{chapter.date}</span>}
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>
          </motion.div>
        )}

        {activeTab === 'synopsis' && (
          <motion.div key="synopsis" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="bg-muted rounded-lg p-3">
              <p className="text-xs text-foreground leading-relaxed whitespace-pre-line">
                {comic.synopsis || comic.description || 'Tidak ada sinopsis.'}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Chapter Reader - No bottom nav, just chapter navigation
function ChapterReader({
  slug,
  source,
  onBack,
  comicTitle,
  comicSlug,
  comicImage,
  chapters,
}: {
  slug: string;
  source: ComicSource;
  onBack: () => void;
  comicTitle?: string;
  comicSlug?: string;
  comicImage?: string;
  chapters?: { chapter: string; slug: string; link?: string; date?: string; title?: string; url?: string }[];
}) {
  const [chapter, setChapter] = useState<ChapterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentSlug, setCurrentSlug] = useState(slug);
  const [currentChapterTitle, setCurrentChapterTitle] = useState('');
  const [showChapterList, setShowChapterList] = useState(false);
  const { addToHistory } = useComicStore();
  const compositeKey = `${source}-${comicSlug}`;

  useEffect(() => {
    const fetchChapter = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/comic/source/${source}/chapter/${currentSlug}`);
        if (res.ok) {
          const data = await res.json();
          setChapter(data);
          setCurrentChapterTitle(data.chapter_title || '');
        }
      } catch (error) {
        console.error('Failed to fetch chapter:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchChapter();
  }, [currentSlug, source]);

  const goToChapter = useCallback((chapterSlug: string, chapterTitle?: string) => {
    if (comicTitle && comicSlug && comicImage) {
      addToHistory({
        slug: compositeKey,
        chapterSlug,
        title: comicTitle,
        chapterTitle: chapterTitle || '',
        image: comicImage,
      });
    }
    setCurrentSlug(chapterSlug);
    setShowChapterList(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [comicTitle, comicSlug, comicImage, addToHistory, compositeKey]);

  // Find current chapter index and prev/next
  const currentChapterIndex = chapters?.findIndex(ch => {
    const chSlug = ch.slug || extractSlug(ch.link || ch.url);
    return chSlug === currentSlug;
  }) ?? -1;

  const hasPrev = currentChapterIndex > 0;
  const hasNext = chapters && currentChapterIndex < chapters.length - 1;
  
  const prevChapter = hasPrev && chapters ? chapters[currentChapterIndex - 1] : null;
  const nextChapter = hasNext && chapters ? chapters[currentChapterIndex + 1] : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
      </div>
    );
  }

  if (!chapter) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <p className="text-muted-foreground text-sm">Chapter tidak ditemukan</p>
        <Button onClick={onBack} size="sm" className="mt-3 bg-sky-500 hover:bg-sky-600">Kembali</Button>
      </div>
    );
  }

  const images = chapter.images || chapter.pages?.map(p => p.url) || [];

  return (
    <div className="min-h-screen bg-background">
      {/* Top Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border px-3 py-2">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button onClick={onBack} className="p-1.5 hover:bg-card rounded-md">
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>
          <div className="text-center flex-1 px-3">
            <h2 className="font-medium text-foreground text-sm truncate">{chapter.manga_title || chapter.comic_title || comicTitle}</h2>
            <p className="text-[10px] text-muted-foreground">{chapter.chapter_title || currentChapterTitle}</p>
          </div>
          <div className="w-8" />
        </div>
      </div>

      {/* Images */}
      <div className="pt-14 pb-16">
        <div className="max-w-2xl mx-auto">
          {images.map((img, index) => (
            <img 
              key={index} 
              src={typeof img === 'string' ? img : (img as { url: string }).url} 
              alt={`Page ${index + 1}`} 
              className="w-full" 
              loading="lazy" 
            />
          ))}
        </div>
      </div>

      {/* Bottom Navigation - Prev/Chapter List/Next */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t border-border p-2">
        <div className="max-w-2xl mx-auto flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className={`flex-1 border-border h-9 ${hasPrev ? 'text-foreground hover:bg-card' : 'text-muted-foreground cursor-not-allowed'}`}
            disabled={!hasPrev}
            onClick={() => {
              if (prevChapter) {
                const chSlug = prevChapter.slug || extractSlug(prevChapter.link || prevChapter.url);
                goToChapter(chSlug, prevChapter.chapter || prevChapter.title);
              }
            }}
          >
            <ChevronLeft className="w-4 h-4 mr-1" /> Prev
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className="border-border text-foreground hover:bg-card h-9 w-auto px-3" 
            onClick={() => setShowChapterList(true)}
          >
            <Grid3X3 className="w-4 h-4 mr-1" /> Chapters
          </Button>
          <Button
            size="sm"
            variant="outline"
            className={`flex-1 border-border h-9 ${hasNext ? 'text-foreground hover:bg-card' : 'text-muted-foreground cursor-not-allowed'}`}
            disabled={!hasNext}
            onClick={() => {
              if (nextChapter) {
                const chSlug = nextChapter.slug || extractSlug(nextChapter.link || nextChapter.url);
                goToChapter(chSlug, nextChapter.chapter || nextChapter.title);
              }
            }}
          >
            Next <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>

      {/* Chapter List Modal */}
      <AnimatePresence>
        {showChapterList && chapters && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/80 flex items-end justify-center"
            onClick={() => setShowChapterList(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="w-full max-w-lg bg-muted rounded-t-xl max-h-[70vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-muted border-b border-border p-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">Pilih Chapter</h3>
                <button onClick={() => setShowChapterList(false)} className="p-1 hover:bg-card rounded">
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
              <ScrollArea className="h-[calc(70vh-60px)]">
                <div className="divide-y divide-border">
                  {chapters.map((ch, idx) => {
                    const chSlug = ch.slug || extractSlug(ch.link || ch.url);
                    const isActive = chSlug === currentSlug;
                    const chapterNum = idx + 1;
                    return (
                      <button
                        key={idx}
                        onClick={() => goToChapter(chSlug, ch.chapter || ch.title)}
                        className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors ${
                          isActive ? 'bg-sky-500/20 text-sky-400' : 'hover:bg-card text-foreground'
                        }`}
                      >
                        <span className="text-xs">
                          Chapter {chapterNum}
                          {ch.chapter || ch.title ? ` - ${ch.chapter || ch.title}` : ''}
                        </span>
                        {ch.date && <span className="text-[10px] text-muted-foreground">{ch.date}</span>}
                      </button>
                    );
                  })}
                </div>
              </ScrollArea>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Search Results View
function SearchResultsView({ 
  query, 
  onComicClick 
}: { 
  query: string; 
  onComicClick: (slug: string, source: ComicSource) => void;
}) {
  const [results, setResults] = useState<ComicItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query) { setResults([]); return; }
    const searchComics = async () => {
      setLoading(true);
      try {
        const promises = ALL_SOURCES.map(s => 
          fetch(`/api/comic/source/${s}/search?q=${encodeURIComponent(query)}`).then(r => r.ok ? r.json() : null).catch(() => null)
        );
        
        const resultsData = await Promise.all(promises);
        const allComics: ComicItem[] = [];
        
        resultsData.forEach((data, idx) => {
          if (data) {
            const items = transformApiResponse(data);
            items.forEach(item => {
              allComics.push(normalizeComic(item, ALL_SOURCES[idx]));
            });
          }
        });
        
        setResults(allComics.slice(0, 30));
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    const debounce = setTimeout(searchComics, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  if (!query) return null;

  return (
    <div className="mt-3">
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-sky-500" />
        </div>
      ) : results.length === 0 ? (
        <div className="text-center py-6 bg-muted rounded-lg">
          <p className="text-muted-foreground text-xs">Tidak ditemukan hasil untuk &quot;{query}&quot;</p>
        </div>
      ) : (
        <div>
          <p className="text-[10px] text-muted-foreground mb-2">Hasil pencarian ({results.length})</p>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
            {results.map((comic, idx) => (
              <ComicCard 
                key={`search-${idx}`} 
                comic={comic} 
                index={idx} 
                source={comic.source || 'bacakomik'} 
                onClick={() => onComicClick(comic.slug || extractSlug(comic), comic.source || 'bacakomik')} 
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Library View
function LibraryView({
  onComicClick,
}: {
  onComicClick: (slug: string, source: ComicSource) => void;
}) {
  const { favorites, history, removeFavorite, clearHistory } = useComicStore();
  const [activeTab, setActiveTab] = useState<'favorites' | 'history'>('favorites');

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button
          size="sm"
          variant={activeTab === 'favorites' ? 'default' : 'outline'}
          onClick={() => setActiveTab('favorites')}
          className={activeTab === 'favorites' ? 'bg-sky-500 hover:bg-sky-600 text-white h-8 text-xs' : 'border-border text-muted-foreground h-8 text-xs'}
        >
          <Heart className="w-3 h-3 mr-1" />
          Favorit ({favorites.length})
        </Button>
        <Button
          size="sm"
          variant={activeTab === 'history' ? 'default' : 'outline'}
          onClick={() => setActiveTab('history')}
          className={activeTab === 'history' ? 'bg-sky-500 hover:bg-sky-600 text-white h-8 text-xs' : 'border-border text-muted-foreground h-8 text-xs'}
        >
          <Clock className="w-3 h-3 mr-1" />
          Riwayat ({history.length})
        </Button>
      </div>

      <div className="space-y-2">
        {activeTab === 'favorites' && (
          <>
            {favorites.length === 0 ? (
              <div className="text-center py-10 bg-muted rounded-lg">
                <Heart className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground text-xs">Belum ada komik favorit</p>
              </div>
            ) : (
              <div className="space-y-2">
                {favorites.map((fav) => {
                  const parts = fav.slug.split('-');
                  const source = parts[0] as ComicSource;
                  const slug = parts.slice(1).join('-');
                  return (
                    <LibraryCard
                      key={fav.slug}
                      item={fav}
                      type="favorite"
                      onClick={() => onComicClick(slug || fav.slug, source)}
                      onRemove={() => removeFavorite(fav.slug)}
                    />
                  );
                })}
              </div>
            )}
          </>
        )}

        {activeTab === 'history' && (
          <>
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-muted-foreground">Riwayat baca terakhir</span>
              {history.length > 0 && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={clearHistory}
                  className="h-6 text-[10px] text-muted-foreground hover:text-sky-400"
                >
                  Hapus Semua
                </Button>
              )}
            </div>
            {history.length === 0 ? (
              <div className="text-center py-10 bg-muted rounded-lg">
                <Clock className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground text-xs">Belum ada riwayat baca</p>
              </div>
            ) : (
              <div className="space-y-2">
                {history.map((item, idx) => {
                  const parts = item.slug.split('-');
                  const source = parts[0] as ComicSource;
                  const slug = parts.slice(1).join('-');
                  return (
                    <LibraryCard
                      key={`${item.slug}-${idx}`}
                      item={item}
                      type="history"
                      onClick={() => onComicClick(slug || item.slug, source)}
                      onRemove={clearHistory}
                    />
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// Genre View
function GenreView({ genre, onComicClick }: { genre: string; onComicClick: (slug: string, source: ComicSource) => void }) {
  const [comics, setComics] = useState<ComicItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState<'manga' | 'manhwa' | 'manhua'>('manga');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => { 
    setComics([]); 
    setPage(1); 
    setHasMore(true);
  }, [genre, activeType]);

  useEffect(() => {
    const fetchComics = async () => {
      if (page === 1) setLoading(true);
      try {
        const promises = ALL_SOURCES.map(s => 
          fetch(`/api/comic/source/${s}/genre/${genre}?page=${page}`).then(r => r.ok ? r.json() : null).catch(() => null)
        );
        
        const results = await Promise.all(promises);
        const allComics: ComicItem[] = [];
        
        results.forEach((data, idx) => {
          if (data) {
            const items = transformApiResponse(data);
            items.forEach(item => {
              allComics.push(normalizeComic(item, ALL_SOURCES[idx]));
            });
          }
        });
        
        const filteredComics = allComics.filter(c => c.type?.toLowerCase() === activeType);
        
        if (filteredComics.length === 0 && page > 1) {
          setHasMore(false);
        } else if (page === 1) {
          setComics(filteredComics);
        } else {
          setComics((prev) => [...prev, ...filteredComics]);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    fetchComics();
  }, [genre, activeType, page]);

  return (
    <div className="space-y-3">
      {/* Type Filter */}
      <div className="flex gap-1 overflow-x-auto scrollbar-hide pb-1">
        {(['manga', 'manhwa', 'manhua'] as const).map((t) => (
          <button
            key={t}
            onClick={() => { setActiveType(t); setPage(1); setHasMore(true); }}
            className={`px-3 py-1.5 text-[10px] font-medium rounded-md transition-colors flex-shrink-0 ${
              activeType === t 
                ? 'bg-sky-500 text-white'
                : 'bg-card text-muted-foreground hover:text-sky-400'
            }`}
          >
            {t.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {loading && page === 1 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-sky-500 mb-2" />
          <p className="text-xs text-muted-foreground">Memuat komik {genre}...</p>
        </div>
      ) : comics.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <BookOpen className="w-8 h-8 text-muted-foreground mb-2" />
          <p className="text-xs text-muted-foreground">Tidak ada komik ditemukan</p>
          <p className="text-[10px] text-muted-foreground mt-1">Coba pilih filter lain</p>
        </div>
      ) : (
        <>
          {/* Comic Grid */}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
            {comics.map((comic, idx) => (
              <ComicCard 
                key={`genre-${genre}-${activeType}-${idx}`} 
                comic={comic} 
                index={idx} 
                source={comic.source || 'bacakomik'} 
                onClick={() => onComicClick(comic.slug || extractSlug(comic), (comic.source as ComicSource) || 'bacakomik')} 
              />
            ))}
          </div>
          
          {/* Load More Button */}
          {hasMore && comics.length > 0 && (
            <div className="text-center mt-4">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => setPage(p => p + 1)} 
                disabled={loading} 
                className="border-border text-muted-foreground h-8 text-xs hover:text-foreground"
              >
                {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Muat Lebih Banyak'}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// Genres List
function GenresListView({ 
  genres, 
  onGenreClick 
}: { 
  genres: Genre[]; 
  onGenreClick: (slug: string) => void;
}) {
  const popular = ['action', 'romance', 'comedy', 'fantasy', 'adventure', 'drama'];

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xs font-semibold text-foreground mb-3">Semua Genre</h3>
        <div className="flex flex-wrap gap-2">
          {genres.map((genre, idx) => {
            const isPopular = popular.includes(genre.slug?.toLowerCase() || genre.name?.toLowerCase());
            return (
              <button
                key={idx}
                onClick={() => onGenreClick(genre.slug || genre.name)}
                className={`px-4 py-2 rounded-full text-center transition-all text-xs font-medium ${
                  isPopular 
                    ? 'bg-gradient-to-r from-sky-500 to-blue-500 text-white shadow-lg shadow-sky-500/25 hover:shadow-sky-500/40 hover:scale-105' 
                    : 'bg-gradient-to-r from-sky-500/20 to-blue-500/20 text-sky-300 border border-sky-500/30 hover:border-sky-400 hover:text-sky-200'
                }`}
              >
                {genre.name}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Type View
function TypeView({ type, onComicClick }: { type: 'manga' | 'manhwa' | 'manhua'; onComicClick: (slug: string, source: ComicSource) => void }) {
  const [comics, setComics] = useState<ComicItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => { setComics([]); setPage(1); }, [type]);

  useEffect(() => {
    const fetchComics = async () => {
      setLoading(true);
      try {
        const promises = TYPE_SOURCES.map(s => 
          fetch(`/api/comic/source/${s}/type/${type}?page=${page}`).then(r => r.ok ? r.json() : null).catch(() => null)
        );
        
        const results = await Promise.all(promises);
        const allComics: ComicItem[] = [];
        
        results.forEach((data, idx) => {
          if (data) {
            const items = transformApiResponse(data);
            items.forEach(item => {
              allComics.push(normalizeComic(item, TYPE_SOURCES[idx]));
            });
          }
        });
        
        if (page === 1) {
          setComics(allComics);
        } else {
          setComics((prev) => [...prev, ...allComics]);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    fetchComics();
  }, [type, page]);

  if (loading && page === 1) {
    return <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-sky-500" /></div>;
  }

  return (
    <div>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
        {comics.map((comic, idx) => (
          <ComicCard 
            key={`type-${idx}`} 
            comic={comic} 
            index={idx} 
            source={comic.source || 'bacakomik'} 
            onClick={() => onComicClick(comic.slug || extractSlug(comic), comic.source || 'bacakomik')} 
          />
        ))}
      </div>
      {comics.length > 0 && (
        <div className="text-center mt-4">
          <Button size="sm" variant="outline" onClick={() => setPage(p => p + 1)} disabled={loading} className="border-border text-muted-foreground h-8 text-xs">
            {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Muat Lebih Banyak'}
          </Button>
        </div>
      )}
    </div>
  );
}

// Popular View for "More" button
function PopularView({ period, onComicClick }: { period: 'today' | 'weekly' | 'monthly'; onComicClick: (slug: string, source: ComicSource) => void }) {
  const [comics, setComics] = useState<ComicItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const sourceMap = {
    today: 'bacakomik',
    weekly: 'komikstation',
    monthly: 'bacaman'
  } as const;

  useEffect(() => { setComics([]); setPage(1); }, [period]);

  useEffect(() => {
    const fetchComics = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/comic/source/${sourceMap[period]}/popular?page=${page}`);
        if (res.ok) {
          const data = await res.json();
          const items = transformApiResponse(data).map(c => normalizeComic(c, sourceMap[period]));
          
          if (page === 1) {
            setComics(items);
          } else {
            setComics((prev) => [...prev, ...items]);
          }
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    fetchComics();
  }, [period, page]);

  return (
    <div className="space-y-3">
      {loading && page === 1 ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-sky-500" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
            {comics.map((comic, idx) => (
              <ComicCard 
                key={`popular-${period}-${idx}`} 
                comic={comic} 
                index={idx} 
                source={comic.source || 'bacakomik'} 
                onClick={() => onComicClick(comic.slug || extractSlug(comic), (comic.source as ComicSource) || 'bacakomik')} 
              />
            ))}
          </div>
          {comics.length > 0 && (
            <div className="text-center mt-4">
              <Button size="sm" variant="outline" onClick={() => setPage(p => p + 1)} disabled={loading} className="border-border text-muted-foreground h-8 text-xs">
                {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Muat Lebih Banyak'}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// Bottom Nav
function BottomNav({ currentView, onViewChange }: { currentView: string; onViewChange: (v: 'home' | 'library' | 'genres') => void }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t border-border">
      <div className="max-w-7xl mx-auto flex justify-around py-1">
        <button onClick={() => onViewChange('home')} className={`flex flex-col items-center gap-0.5 py-1.5 px-4 ${currentView === 'home' ? 'text-sky-500' : 'text-muted-foreground'}`}>
          <Home className="w-5 h-5" />
          <span className="text-[9px]">Home</span>
        </button>
        <button onClick={() => onViewChange('library')} className={`flex flex-col items-center gap-0.5 py-1.5 px-4 ${currentView === 'library' ? 'text-sky-500' : 'text-muted-foreground'}`}>
          <Library className="w-5 h-5" />
          <span className="text-[9px]">Library</span>
        </button>
        <button onClick={() => onViewChange('genres')} className={`flex flex-col items-center gap-0.5 py-1.5 px-4 ${currentView === 'genres' ? 'text-sky-500' : 'text-muted-foreground'}`}>
          <Compass className="w-5 h-5" />
          <span className="text-[9px]">Genre</span>
        </button>
      </div>
    </div>
  );
}

// Main Component
export default function KleeReader() {
  const [view, setView] = useState<'home' | 'detail' | 'library' | 'genre' | 'genres' | 'type' | 'popular' | 'tos' | 'dmca'>('home');
  const [previousView, setPreviousView] = useState<'home' | 'library' | 'genres' | 'type' | 'popular' | 'genre'>('home');
  const [selectedSlug, setSelectedSlug] = useState('');
  const [selectedSource, setSelectedSource] = useState<ComicSource>('bacakomik');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedType, setSelectedType] = useState<'manga' | 'manhwa' | 'manhua'>('manga');
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'weekly' | 'monthly'>('today');
  const [searchQuery, setSearchQuery] = useState('');

  const [genres, setGenres] = useState<Genre[]>([]);
  const [popularData, setPopularData] = useState<ComicItem[]>([]);
  const [loading, setLoading] = useState(true);

  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [genresRes, popularRes] = await Promise.all([
          fetch('/api/comic/source/bacakomik/genres'),
          fetch('/api/comic/source/bacakomik/popular'),
        ]);
        
        const genresData = await genresRes.json();
        const popularJson = await popularRes.json();
        
        let genresArray: Genre[] = [];
        if (Array.isArray(genresData)) {
          genresArray = genresData.map((g: Record<string, string>) => ({ slug: g.slug || g.value || g.name?.toLowerCase() || '', name: g.name || g.title || g.slug || '' }));
        } else if (genresData.genres) {
          genresArray = genresData.genres.map((g: Record<string, string>) => ({ slug: g.slug || g.value || g.name?.toLowerCase() || '', name: g.name || g.title || g.slug || '' }));
        }
        setGenres(genresArray.filter(g => g.name && g.slug).filter((g, i, a) => i === a.findIndex(x => x.slug === g.slug)));
        setPopularData(transformApiResponse(popularJson).map(c => normalizeComic(c, 'bacakomik')));
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleComicClick = (slug: string, source: ComicSource = 'bacakomik') => { 
    setSelectedSlug(slug); 
    setSelectedSource(source);
    setPreviousView(view as 'home' | 'library' | 'genres' | 'type' | 'popular' | 'genre');
    setView('detail'); 
  };
  
  const handleBack = () => { 
    const targetView = previousView || 'home';
    setView(targetView); 
    setSelectedSlug(''); 
    if (targetView === 'home') {
      setSelectedGenre(''); 
      setSearchQuery(''); 
    }
  };

  // Detail View - No bottom nav
  if (view === 'detail' && selectedSlug) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-3xl mx-auto p-3">
          <ComicDetailView slug={selectedSlug} source={selectedSource} onBack={handleBack} />
        </div>
      </div>
    );
  }

  if (view === 'library') {
    return (
      <div className="min-h-screen bg-background pb-14">
        <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border p-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <h1 className="text-base font-bold text-foreground flex items-center gap-2">
              <Library className="w-5 h-5 text-sky-400" />
              Perpustakaan
            </h1>
            <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="text-foreground h-8 w-8">
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
          </div>
        </div>
        <div className="max-w-7xl mx-auto p-3">
          <LibraryView onComicClick={handleComicClick} />
        </div>
        <BottomNav currentView={view} onViewChange={(v) => setView(v)} />
      </div>
    );
  }

  if (view === 'genres') {
    return (
      <div className="min-h-screen bg-background pb-14">
        <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border p-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <h1 className="text-base font-bold text-foreground flex items-center gap-2">
              <Compass className="w-5 h-5 text-sky-400" />
              Jelajahi
            </h1>
            <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="text-foreground h-8 w-8">
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
          </div>
        </div>
        <div className="max-w-7xl mx-auto p-3">
          <GenresListView 
            genres={genres} 
            onGenreClick={(g) => { setSelectedGenre(g); setView('genre'); }}
          />
        </div>
        <BottomNav currentView={view} onViewChange={(v) => setView(v)} />
      </div>
    );
  }

  if (view === 'genre') {
    return (
      <div className="min-h-screen bg-background pb-14">
        <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border p-3">
          <div className="max-w-7xl mx-auto flex items-center gap-2">
            <button onClick={() => setView('genres')} className="p-1.5 hover:bg-card rounded-md">
              <ChevronLeft className="w-5 h-5 text-foreground" />
            </button>
            <h1 className="text-base font-semibold text-foreground capitalize">{selectedGenre}</h1>
          </div>
        </div>
        <div className="max-w-7xl mx-auto p-3">
          <GenreView genre={selectedGenre} onComicClick={handleComicClick} />
        </div>
        <BottomNav currentView={view} onViewChange={(v) => setView(v)} />
      </div>
    );
  }

  if (view === 'type') {
    return (
      <div className="min-h-screen bg-background pb-14">
        <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border p-3">
          <div className="max-w-7xl mx-auto flex items-center gap-2">
            <button onClick={() => setView('home')} className="p-1.5 hover:bg-card rounded-md">
              <ChevronLeft className="w-5 h-5 text-foreground" />
            </button>
            <h1 className="text-base font-semibold text-foreground capitalize">{selectedType}</h1>
          </div>
        </div>
        <div className="max-w-7xl mx-auto p-3">
          <TypeView type={selectedType} onComicClick={handleComicClick} />
        </div>
        <BottomNav currentView={view} onViewChange={(v) => setView(v)} />
      </div>
    );
  }

  if (view === 'popular') {
    return (
      <div className="min-h-screen bg-background pb-14">
        <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border p-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button onClick={() => setView('home')} className="p-1.5 hover:bg-card rounded-md">
                <ChevronLeft className="w-5 h-5 text-foreground" />
              </button>
              <h1 className="text-base font-semibold text-foreground flex items-center gap-2">
                <Eye className="w-4 h-4 text-sky-400" />
                View Terbanyak
              </h1>
            </div>
            <div className="flex gap-1 bg-card rounded-lg p-0.5">
              {(['today', 'weekly', 'monthly'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setSelectedPeriod(p)}
                  className={`px-2 py-1 text-[10px] font-medium rounded-md transition-colors ${
                    selectedPeriod === p ? 'bg-sky-500 text-white' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {p === 'today' ? 'Today' : p === 'weekly' ? 'Weekly' : 'Monthly'}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto p-3">
          <PopularView period={selectedPeriod} onComicClick={handleComicClick} />
        </div>
        <BottomNav currentView={view} onViewChange={(v) => setView(v)} />
      </div>
    );
  }

  if (view === 'tos') {
    return (
      <div className="min-h-screen bg-background pb-14">
        <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border p-3">
          <div className="max-w-7xl mx-auto flex items-center gap-2">
            <button onClick={() => setView('home')} className="p-1.5 hover:bg-card rounded-md">
              <ChevronLeft className="w-5 h-5 text-foreground" />
            </button>
            <h1 className="text-base font-semibold text-foreground">Terms of Service</h1>
          </div>
        </div>
        <div className="max-w-3xl mx-auto p-4">
          <div className="space-y-6 text-foreground">
            <section>
              <h2 className="text-lg font-bold text-sky-400 mb-3">Syarat dan Ketentuan Pengguna</h2>
              <div className="space-y-4 text-sm text-muted-foreground">
                <p>Selamat datang di <strong>KANANIMEID</strong>. Dengan mengakses dan menggunakan layanan kami, Anda dianggap telah membaca, memahami, serta menyetujui untuk mematuhi syarat dan ketentuan berikut:</p>
                
                <h3 className="font-semibold text-foreground">1. Layanan yang Disediakan</h3>
                <p>KANANIMEID menyediakan layanan pembaca manga, manhwa, dan manhua secara gratis. Layanan ini bersif untuk penggunaan pribadi dan non-komersial.</p>
                
                <h3 className="font-semibold text-foreground">2. Kode Etik Pengguna</h3>
                <p>Pengguna diwajib untuk:</p>
                <ul className="list-disc list-inside ml-4 space-y-1 text-muted-foreground">
                  <li>Tidak menggunakan layanan untuk tujuan ilegal atau melanggar hukum</li>
                  <li>Tidak menyalah penyebaran malware atau virus</li>
                  <li>Tidak mencoba merusak atau mengganggu layanan</li>
                  <li>Menghormati hak kepatan dan privasi pengguna lain</li>
                </ul>
                
                <h3 className="font-semibold text-foreground">3. Batasan Tanggung Jawab</h3>
                <p>KANANIMEID tidak bertanggung jawab atas:</p>
                <ul className="list-disc list-inside ml-4 space-y-1 text-muted-foreground">
                  <li>Kerusugunan atau kehilangan data pengguna</li>
                  <li>Gangguan teknis atau masalah server</li>
                  <li>Tindakan pihak ketiga atau peretasan eksternal</li>
                </ul>
                
                <h3 className="font-semibold text-foreground">4. Perubahan Syarat dan Ketentuan</h3>
                <p>KANANIMEID berhak mengubah syarat dan ketentuan ini kapan saja. Perubahan akan diumumkan melalui pemberitahuan di website.</p>
                
                <h3 className="font-semibold text-foreground">5. Hukum yang Berlaku</h3>
                <p>Penggunaan layanan ini tunduk pada hukum Indonesia. Sengketa apapun yang tidak dapat diselesaikan akan diselesaikan sesuai dengan hukum yang berlaku.</p>
              </div>
            </section>
            
            <section>
              <h2 className="text-lg font-bold text-sky-400 mb-3">Kebijakan Privasi</h2>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>Kami menghormati privasi Anda dan berkomitmen untuk melindungi informasi pribadi Anda:</p>
                <ul className="list-disc list-inside ml-4 space-y-1 text-muted-foreground">
                  <li>Data pribadi hanya dikumpulkan untuk meningkatkan pengalaman pengguna</li>
                  <li>Kami tidak menjual atau membagikan data kepada pihak ketiga</li>
                  <li>Cookies digunakan untuk fungsi analitik</li>
                </ul>
              </div>
            </section>
          </div>
        </div>
        <BottomNav currentView={view} onViewChange={(v) => setView(v)} />
      </div>
    );
  }

  if (view === 'dmca') {
    return (
      <div className="min-h-screen bg-background pb-14">
        <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border p-3">
          <div className="max-w-7xl mx-auto flex items-center gap-2">
            <button onClick={() => setView('home')} className="p-1.5 hover:bg-card rounded-md">
              <ChevronLeft className="w-5 h-5 text-foreground" />
            </button>
            <h1 className="text-base font-semibold text-foreground">DMCA - Hak Cipta</h1>
          </div>
        </div>
        <div className="max-w-3xl mx-auto p-4">
          <div className="space-y-6 text-foreground">
            <section>
              <h2 className="text-lg font-bold text-sky-400 mb-3">Digital Millennium Copyright Act</h2>
              <div className="space-y-4 text-sm text-muted-foreground">
                <p>KANANIMEID menghormati hak kekayaan intelektual orang lain. Jika Anda adalah pemilik hak cipta atau agen yang berwenang, dan percaya bahwa konten di website ini melanggar hak cipta Anda, silakan hubungi kami.</p>
                
                <h3 className="font-semibold text-foreground">Prosedur Pengajuan Keluhan DMCA:</h3>
                <ol className="list-decimal list-inside ml-4 space-y-2 text-muted-foreground">
                  <li><strong>Identifikasi Konten:</strong> Berikan URL spesifik dari konten yang melanggar hak cipta</li>
                  <li><strong>Bukti Kepemilikan:</strong> Sertakan bukti bahwa Anda adalah pemilik hak cipta yang sah</li>
                  <li><strong>Informasi Kontak:</strong> Berikan nama, alamat email, dan nomor telepon Anda</li>
                  <li><strong>Pernyataan Resmi:</strong> Sertakan pernyataan bahwa informasi yang diberikan adalah akurat</li>
                </ol>
                
                <h3 className="font-semibold text-foreground">Apa yang Terjadi Setelah Pengajuan:</h3>
                <p>Setelah menerima keluhan yang valid, kami akan:</p>
                <ul className="list-disc list-inside ml-4 space-y-1 text-muted-foreground">
                  <li>Mereview konten yang dilaporkan dalam waktu 24-48 jam</li>
                  <li>Menghapus konten jika terbukti melanggar hak cipta</li>
                  <li>Menghubungi Anda untuk konfirmasi</li>
                </ul>
              </div>
            </section>
            
            <section>
              <h2 className="text-lg font-bold text-sky-400 mb-3">Hubungi Kami</h2>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>Untuk mengajukan keluhan DMCA atau pertanyaan terkait hak cipta, silakan hubungi kami melalui:</p>
                <div className="bg-card rounded-lg p-4 mt-4">
                  <p className="font-semibold text-foreground">Email:</p>
                  <p className="text-sky-400">dmca@kananimeid.com</p>
                  <p className="font-semibold text-foreground mt-3">Waktu Respon:</p>
                  <p>3-5 hari kerja</p>
                </div>
              </div>
            </section>
            
            <section>
              <h2 className="text-lg font-bold text-sky-400 mb-3">Disclaimer</h2>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>KANANIMEID adalah platform agregasi konten. Kami tidak menyimpan file manga, manhwa, atau manhua di server kami. Semua konten berasal dari sumber pihak ketiga dan hak ciptanya tetap menjadi milik masing-masing pemiliknya.</p>
                <p>Dengan menggunakan layanan ini, Anda memahami bahwa KANANIMEID tidak bertanggung jawab atas konten yang ditampilkan. Kami berkomitmen untuk merespons keluhan hak cipta dengan cepat dan profesional.</p>
              </div>
            </section>
          </div>
        </div>
        <BottomNav currentView={view} onViewChange={(v) => setView(v)} />
      </div>
    );
  }

  // Home
  return (
    <div className="min-h-screen bg-background pb-14">
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <img 
                src="https://files.catbox.moe/6rk19o.jpg" 
                alt="KANANIMEID" 
                className="w-7 h-7 rounded-md object-cover"
              />
              <h1 className="text-sm font-bold bg-gradient-to-r from-sky-400 to-blue-400 bg-clip-text text-transparent">KANANIMEID</h1>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="text-foreground h-7 w-7">
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto p-3">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-sky-500" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Featured Banner with Search */}
            <FeaturedBanner 
              comics={popularData} 
              onComicClick={handleComicClick}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />

            {/* Search Results */}
            {searchQuery && (
              <SearchResultsView query={searchQuery} onComicClick={handleComicClick} />
            )}

            {/* Update Terbaru Section - Moved to top */}
            <UpdateTerbaruSection 
              onComicClick={handleComicClick}
              onMoreClick={(type) => { setSelectedType(type); setPreviousView('home'); setView('type'); }}
            />

            {/* View Terbanyak Section */}
            <ViewTerbanyakSection 
              onComicClick={handleComicClick}
              onMoreClick={(period) => { setSelectedPeriod(period); setPreviousView('home'); setView('popular'); }}
            />

            {/* Populer Section */}
            <PopulerSection 
              onComicClick={handleComicClick}
              onMoreClick={() => { setSelectedPeriod('today'); setPreviousView('home'); setView('popular'); }}
            />
          </div>
        )}
      </main>

      {/* Footer with TOS/DMCA */}
      <footer className="max-w-7xl mx-auto px-3 py-4 border-t border-border mb-12">
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-2">
            <img 
              src="https://files.catbox.moe/6rk19o.jpg" 
              alt="KANANIMEID" 
              className="w-5 h-5 rounded object-cover"
            />
            <span className="text-xs font-bold bg-gradient-to-r from-sky-400 to-blue-400 bg-clip-text text-transparent">KANANIMEID</span>
          </div>
          <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
            <button 
              onClick={() => setView('tos')} 
              className="hover:text-sky-400 transition-colors"
            >
              TOS
            </button>
            <span>•</span>
            <button 
              onClick={() => setView('dmca')} 
              className="hover:text-sky-400 transition-colors"
            >
              DMCA
            </button>
            <span>•</span>
            <span>© 2024 KANANIMEID</span>
          </div>
          <p className="text-[9px] text-muted-foreground text-center max-w-md">
            Semua konten manga, manhwa, dan manhua diambil dari sumber pihak ketiga. 
            Kami tidak menyimpan file di server kami.
          </p>
        </div>
      </footer>

      <BottomNav currentView={view} onViewChange={(v) => { if (v === 'library') setView('library'); else if (v === 'genres') setView('genres'); else setView('home'); }} />
    </div>
  );
}
