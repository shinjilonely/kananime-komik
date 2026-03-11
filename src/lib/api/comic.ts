// Comic API utility functions - Multi-source support

const API_BASE = 'https://www.sankavollerei.com/comic';

// Source types
export type ComicSource = 'bacakomik' | 'komikstation' | 'maid' | 'komikindo' | 'bacaman' | 'meganei' | 'softkomik';

export interface SourceConfig {
  id: ComicSource;
  name: string;
  color: string;
  gradient: string;
}

export const SOURCES: SourceConfig[] = [
  { id: 'bacakomik', name: 'Baca Komik', color: 'emerald', gradient: 'from-emerald-600 to-teal-600' },
  { id: 'komikstation', name: 'Komik Station', color: 'blue', gradient: 'from-blue-600 to-cyan-600' },
  { id: 'maid', name: 'Maid', color: 'pink', gradient: 'from-pink-600 to-rose-600' },
  { id: 'komikindo', name: 'Komik Indo', color: 'purple', gradient: 'from-purple-600 to-violet-600' },
  { id: 'bacaman', name: 'Baca Man', color: 'orange', gradient: 'from-orange-600 to-amber-600' },
  { id: 'meganei', name: 'Meganei', color: 'indigo', gradient: 'from-indigo-600 to-blue-600' },
  { id: 'softkomik', name: 'Soft Komik', color: 'cyan', gradient: 'from-cyan-600 to-sky-600' },
];

// ============ BACAKOMIK ============
export async function fetchBacakomikHome() {
  const res = await fetch(`${API_BASE}/bacakomik/latest`, { next: { revalidate: 180 } });
  if (!res.ok) throw new Error('Failed to fetch bacakomik home');
  return res.json();
}

export async function fetchBacakomikPopular() {
  const res = await fetch(`${API_BASE}/bacakomik/populer`, { next: { revalidate: 300 } });
  if (!res.ok) throw new Error('Failed to fetch bacakomik popular');
  return res.json();
}

export async function fetchBacakomikLatest(page = 1) {
  const res = await fetch(`${API_BASE}/bacakomik/latest?page=${page}`, { next: { revalidate: 180 } });
  if (!res.ok) throw new Error('Failed to fetch bacakomik latest');
  return res.json();
}

export async function fetchBacakomikTop() {
  const res = await fetch(`${API_BASE}/bacakomik/top`, { next: { revalidate: 300 } });
  if (!res.ok) throw new Error('Failed to fetch bacakomik top');
  return res.json();
}

export async function fetchBacakomikList(page = 1) {
  const res = await fetch(`${API_BASE}/bacakomik/list?page=${page}`, { next: { revalidate: 180 } });
  if (!res.ok) throw new Error('Failed to fetch bacakomik list');
  return res.json();
}

export async function fetchBacakomikSearch(query: string) {
  const res = await fetch(`${API_BASE}/bacakomik/search/${encodeURIComponent(query)}`, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error('Failed to search bacakomik');
  return res.json();
}

export async function fetchBacakomikGenres() {
  const res = await fetch(`${API_BASE}/bacakomik/genres`, { next: { revalidate: 86400 } });
  if (!res.ok) throw new Error('Failed to fetch bacakomik genres');
  return res.json();
}

export async function fetchBacakomikGenre(genre: string, page = 1) {
  const res = await fetch(`${API_BASE}/bacakomik/genre/${genre}?page=${page}`, { next: { revalidate: 300 } });
  if (!res.ok) throw new Error('Failed to fetch bacakomik genre');
  return res.json();
}

export async function fetchBacakomikDetail(slug: string) {
  const res = await fetch(`${API_BASE}/bacakomik/detail/${slug}`, { next: { revalidate: 600 } });
  if (!res.ok) throw new Error('Failed to fetch bacakomik detail');
  return res.json();
}

export async function fetchBacakomikChapter(slug: string) {
  const res = await fetch(`${API_BASE}/bacakomik/chapter/${slug}`, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error('Failed to fetch bacakomik chapter');
  return res.json();
}

export async function fetchBacakomikRecommend() {
  const res = await fetch(`${API_BASE}/bacakomik/recomen`, { next: { revalidate: 300 } });
  if (!res.ok) throw new Error('Failed to fetch bacakomik recommend');
  return res.json();
}

export async function fetchBacakomikColored(page = 1) {
  const res = await fetch(`${API_BASE}/bacakomik/komikberwarna/${page}`, { next: { revalidate: 300 } });
  if (!res.ok) throw new Error('Failed to fetch bacakomik colored');
  return res.json();
}

export async function fetchBacakomikOnlyManga() {
  const res = await fetch(`${API_BASE}/bacakomik/only/manga`, { next: { revalidate: 300 } });
  if (!res.ok) throw new Error('Failed to fetch bacakomik manga only');
  return res.json();
}

// ============ KOMIKSTATION ============
export async function fetchKomikstationHome() {
  const res = await fetch(`${API_BASE}/komikstation/home`, { next: { revalidate: 180 } });
  if (!res.ok) throw new Error('Failed to fetch komikstation home');
  return res.json();
}

export async function fetchKomikstationList(page = 1, type?: string, status?: string, order?: string) {
  const params = new URLSearchParams();
  if (type) params.set('type', type);
  if (status) params.set('status', status);
  if (order) params.set('order', order);
  params.set('page', String(page));
  
  const res = await fetch(`${API_BASE}/komikstation/list?${params.toString()}`, { next: { revalidate: 180 } });
  if (!res.ok) throw new Error('Failed to fetch komikstation list');
  return res.json();
}

export async function fetchKomikstationPopular(page = 1) {
  const res = await fetch(`${API_BASE}/komikstation/popular?page=${page}`, { next: { revalidate: 300 } });
  if (!res.ok) throw new Error('Failed to fetch komikstation popular');
  return res.json();
}

export async function fetchKomikstationRecommendation() {
  const res = await fetch(`${API_BASE}/komikstation/recommendation`, { next: { revalidate: 300 } });
  if (!res.ok) throw new Error('Failed to fetch komikstation recommendation');
  return res.json();
}

export async function fetchKomikstationTopWeekly() {
  const res = await fetch(`${API_BASE}/komikstation/top-weekly`, { next: { revalidate: 300 } });
  if (!res.ok) throw new Error('Failed to fetch komikstation top weekly');
  return res.json();
}

export async function fetchKomikstationOngoing(page = 1) {
  const res = await fetch(`${API_BASE}/komikstation/ongoing?page=${page}`, { next: { revalidate: 180 } });
  if (!res.ok) throw new Error('Failed to fetch komikstation ongoing');
  return res.json();
}

export async function fetchKomikstationAZList(letter: string, page = 1) {
  const res = await fetch(`${API_BASE}/komikstation/az-list/${letter}?page=${page}`, { next: { revalidate: 300 } });
  if (!res.ok) throw new Error('Failed to fetch komikstation az list');
  return res.json();
}

export async function fetchKomikstationGenres() {
  const res = await fetch(`${API_BASE}/komikstation/genres`, { next: { revalidate: 86400 } });
  if (!res.ok) throw new Error('Failed to fetch komikstation genres');
  return res.json();
}

export async function fetchKomikstationGenre(genre: string, page = 1) {
  const res = await fetch(`${API_BASE}/komikstation/genre/${genre}?page=${page}`, { next: { revalidate: 300 } });
  if (!res.ok) throw new Error('Failed to fetch komikstation genre');
  return res.json();
}

export async function fetchKomikstationSearch(query: string) {
  const res = await fetch(`${API_BASE}/komikstation/search/${encodeURIComponent(query)}`, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error('Failed to search komikstation');
  return res.json();
}

export async function fetchKomikstationManga(slug: string) {
  const res = await fetch(`${API_BASE}/komikstation/manga/${slug}`, { next: { revalidate: 600 } });
  if (!res.ok) throw new Error('Failed to fetch komikstation manga');
  return res.json();
}

export async function fetchKomikstationChapter(slug: string) {
  const res = await fetch(`${API_BASE}/komikstation/chapter/${slug}`, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error('Failed to fetch komikstation chapter');
  return res.json();
}

// ============ MAID ============
export async function fetchMaidList() {
  const res = await fetch(`${API_BASE}/maid/list`, { next: { revalidate: 180 } });
  if (!res.ok) throw new Error('Failed to fetch maid list');
  return res.json();
}

export async function fetchMaidApi() {
  const res = await fetch(`${API_BASE}/maid/api`, { next: { revalidate: 180 } });
  if (!res.ok) throw new Error('Failed to fetch maid api');
  return res.json();
}

export async function fetchMaidLatest(page = 1) {
  const res = await fetch(`${API_BASE}/maid/latest?page=${page}`, { next: { revalidate: 180 } });
  if (!res.ok) throw new Error('Failed to fetch maid latest');
  return res.json();
}

export async function fetchMaidManga(slug: string) {
  const res = await fetch(`${API_BASE}/maid/manga/${slug}`, { next: { revalidate: 600 } });
  if (!res.ok) throw new Error('Failed to fetch maid manga');
  return res.json();
}

export async function fetchMaidChapter(slug: string) {
  const res = await fetch(`${API_BASE}/maid/chapter/${slug}`, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error('Failed to fetch maid chapter');
  return res.json();
}

export async function fetchMaidGenres() {
  const res = await fetch(`${API_BASE}/maid/genres`, { next: { revalidate: 86400 } });
  if (!res.ok) throw new Error('Failed to fetch maid genres');
  return res.json();
}

export async function fetchMaidGenre(genre: string, page = 1) {
  const res = await fetch(`${API_BASE}/maid/genres/${genre}?page=${page}`, { next: { revalidate: 300 } });
  if (!res.ok) throw new Error('Failed to fetch maid genre');
  return res.json();
}

export async function fetchMaidSearch(query: string, page = 1) {
  const res = await fetch(`${API_BASE}/maid/search?title=${encodeURIComponent(query)}&page=${page}`, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error('Failed to search maid');
  return res.json();
}

// ============ KOMIKINDO ============
export async function fetchKomikindoLatest(page = 1) {
  const res = await fetch(`${API_BASE}/komikindo/latest/${page}`, { next: { revalidate: 180 } });
  if (!res.ok) throw new Error('Failed to fetch komikindo latest');
  return res.json();
}

export async function fetchKomikindoDetail(slug: string) {
  const res = await fetch(`${API_BASE}/komikindo/detail/${slug}`, { next: { revalidate: 600 } });
  if (!res.ok) throw new Error('Failed to fetch komikindo detail');
  return res.json();
}

export async function fetchKomikindoChapter(slug: string) {
  const res = await fetch(`${API_BASE}/komikindo/chapter/${slug}`, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error('Failed to fetch komikindo chapter');
  return res.json();
}

export async function fetchKomikindoLibrary(page = 1) {
  const res = await fetch(`${API_BASE}/komikindo/library?page=${page}`, { next: { revalidate: 180 } });
  if (!res.ok) throw new Error('Failed to fetch komikindo library');
  return res.json();
}

export async function fetchKomikindoGenres() {
  const res = await fetch(`${API_BASE}/komikindo/genres`, { next: { revalidate: 86400 } });
  if (!res.ok) throw new Error('Failed to fetch komikindo genres');
  return res.json();
}

export async function fetchKomikindoSearch(query: string, page = 1) {
  const res = await fetch(`${API_BASE}/komikindo/search/${encodeURIComponent(query)}/${page}`, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error('Failed to search komikindo');
  return res.json();
}

// ============ BACAMAN ============
export async function fetchBacamanHome() {
  const res = await fetch(`${API_BASE}/bacaman/home`, { next: { revalidate: 180 } });
  if (!res.ok) throw new Error('Failed to fetch bacaman home');
  return res.json();
}

export async function fetchBacamanList(page = 1) {
  const res = await fetch(`${API_BASE}/bacaman/list?page=${page}`, { next: { revalidate: 180 } });
  if (!res.ok) throw new Error('Failed to fetch bacaman list');
  return res.json();
}

export async function fetchBacamanSearch(query: string) {
  const res = await fetch(`${API_BASE}/bacaman/search/${encodeURIComponent(query)}`, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error('Failed to search bacaman');
  return res.json();
}

export async function fetchBacamanDetail(slug: string) {
  const res = await fetch(`${API_BASE}/bacaman/detail/${slug}`, { next: { revalidate: 600 } });
  if (!res.ok) throw new Error('Failed to fetch bacaman detail');
  return res.json();
}

export async function fetchBacamanChapter(slug: string) {
  const res = await fetch(`${API_BASE}/bacaman/chapter/${slug}`, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error('Failed to fetch bacaman chapter');
  return res.json();
}

export async function fetchBacamanPopular() {
  const res = await fetch(`${API_BASE}/bacaman/popular`, { next: { revalidate: 300 } });
  if (!res.ok) throw new Error('Failed to fetch bacaman popular');
  return res.json();
}

export async function fetchBacamanLatest() {
  const res = await fetch(`${API_BASE}/bacaman/latest`, { next: { revalidate: 180 } });
  if (!res.ok) throw new Error('Failed to fetch bacaman latest');
  return res.json();
}

export async function fetchBacamanGenres() {
  const res = await fetch(`${API_BASE}/bacaman/genres`, { next: { revalidate: 86400 } });
  if (!res.ok) throw new Error('Failed to fetch bacaman genres');
  return res.json();
}

export async function fetchBacamanGenre(genre: string, page = 1) {
  const res = await fetch(`${API_BASE}/bacaman/genre/${genre}?page=${page}`, { next: { revalidate: 300 } });
  if (!res.ok) throw new Error('Failed to fetch bacaman genre');
  return res.json();
}

export async function fetchBacamanType(type: 'manga' | 'manhwa' | 'manhua') {
  const res = await fetch(`${API_BASE}/bacaman/type/${type}`, { next: { revalidate: 300 } });
  if (!res.ok) throw new Error('Failed to fetch bacaman type');
  return res.json();
}

// ============ MEGANEI ============
export async function fetchMeganeiHome(page = 1) {
  const res = await fetch(`${API_BASE}/meganei/home/${page}`, { next: { revalidate: 180 } });
  if (!res.ok) throw new Error('Failed to fetch meganei home');
  return res.json();
}

export async function fetchMeganeiList(page = 1) {
  const res = await fetch(`${API_BASE}/meganei/list?page=${page}`, { next: { revalidate: 180 } });
  if (!res.ok) throw new Error('Failed to fetch meganei list');
  return res.json();
}

export async function fetchMeganeiSearch(query: string) {
  const res = await fetch(`${API_BASE}/meganei/search/${encodeURIComponent(query)}`, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error('Failed to search meganei');
  return res.json();
}

export async function fetchMeganeiInfo(slug: string) {
  const res = await fetch(`${API_BASE}/meganei/info/${slug}`, { next: { revalidate: 600 } });
  if (!res.ok) throw new Error('Failed to fetch meganei info');
  return res.json();
}

// ============ SOFTKOMIK ============
export async function fetchSoftkomikHome() {
  const res = await fetch(`${API_BASE}/softkomik/home`, { next: { revalidate: 180 } });
  if (!res.ok) throw new Error('Failed to fetch softkomik home');
  return res.json();
}

export async function fetchSoftkomikList(page = 1) {
  const res = await fetch(`${API_BASE}/softkomik/list?page=${page}`, { next: { revalidate: 180 } });
  if (!res.ok) throw new Error('Failed to fetch softkomik list');
  return res.json();
}

export async function fetchSoftkomikUpdate() {
  const res = await fetch(`${API_BASE}/softkomik/update`, { next: { revalidate: 180 } });
  if (!res.ok) throw new Error('Failed to fetch softkomik update');
  return res.json();
}

export async function fetchSoftkomikOngoing(page = 1) {
  const res = await fetch(`${API_BASE}/softkomik/ongoing?page=${page}`, { next: { revalidate: 180 } });
  if (!res.ok) throw new Error('Failed to fetch softkomik ongoing');
  return res.json();
}

export async function fetchSoftkomikLibrary(page = 1, sort = 'newKomik') {
  const res = await fetch(`${API_BASE}/softkomik/library?page=${page}&sort=${sort}`, { next: { revalidate: 180 } });
  if (!res.ok) throw new Error('Failed to fetch softkomik library');
  return res.json();
}

export async function fetchSoftkomikType(type: 'manga' | 'manhwa' | 'manhua', page = 1) {
  const res = await fetch(`${API_BASE}/softkomik/type/${type}?page=${page}`, { next: { revalidate: 300 } });
  if (!res.ok) throw new Error('Failed to fetch softkomik type');
  return res.json();
}

export async function fetchSoftkomikGenres() {
  const res = await fetch(`${API_BASE}/softkomik/genres`, { next: { revalidate: 86400 } });
  if (!res.ok) throw new Error('Failed to fetch softkomik genres');
  return res.json();
}

export async function fetchSoftkomikGenre(genre: string, page = 1) {
  const res = await fetch(`${API_BASE}/softkomik/genre/${genre}?page=${page}`, { next: { revalidate: 300 } });
  if (!res.ok) throw new Error('Failed to fetch softkomik genre');
  return res.json();
}

export async function fetchSoftkomikDetail(slug: string) {
  const res = await fetch(`${API_BASE}/softkomik/detail/${slug}`, { next: { revalidate: 600 } });
  if (!res.ok) throw new Error('Failed to fetch softkomik detail');
  return res.json();
}

export async function fetchSoftkomikChapter(slug: string) {
  const res = await fetch(`${API_BASE}/softkomik/chapter/${slug}`, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error('Failed to fetch softkomik chapter');
  return res.json();
}

// ============ HELPER FUNCTIONS ============

// Extract slug from URL or link
export function extractSlug(linkOrUrl: string | undefined): string {
  if (!linkOrUrl) return '';
  const parts = linkOrUrl.replace(/^\/|\/$/g, '').split('/');
  return parts[parts.length - 1] || parts[parts.length - 2] || '';
}

// Generic fetch with source parameter
export async function fetchFromSource(source: ComicSource, endpoint: string, params?: Record<string, string>) {
  const url = new URL(`${API_BASE}/${source}/${endpoint}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
  }
  
  const res = await fetch(url.toString(), { next: { revalidate: 180 } });
  if (!res.ok) throw new Error(`Failed to fetch from ${source}`);
  return res.json();
}
