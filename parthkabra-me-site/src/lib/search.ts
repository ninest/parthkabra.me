import MiniSearch, { type SearchResult } from "minisearch";
import { stopWords } from "../utils/language";

export type SearchDoc = {
  id: string;
  type: string;
  title: string;
  description: string;
  body: string;
  createdAt: string;
  url?: string;
  external?: boolean;
};

export type SearchHit = {
  id: string;
  title: string;
  type: string;
  description: string;
  createdAt: string;
  score: number;
  url?: string;
  external?: boolean;
};

let miniSearch: MiniSearch<SearchDoc> | null = null;

export async function search(query: string): Promise<SearchHit[]> {
  if (!miniSearch) {
    const res = await fetch("/search-index.json");
    const docs: SearchDoc[] = await res.json();
    miniSearch = new MiniSearch<SearchDoc>({
      fields: ["title", "description", "body"],
      storeFields: ["title", "description", "type", "createdAt", "url", "external"],
      processTerm: (term, _fieldName) => {
        const lower = term.toLowerCase();
        // _fieldName is undefined during search — only filter stop words at index time
        if (_fieldName && stopWords.has(lower)) return null;
        return lower;
      },
      searchOptions: {
        boost: { title: 3, description: 2, body: 1 },
        prefix: true,
        fuzzy: 0.2,
      },
    });
    miniSearch.addAll(docs);
  }
  const results = miniSearch.search(query) as SearchHit[];
  results.sort((a, b) => {
    if (!a.createdAt && !b.createdAt) return 0;
    if (!a.createdAt) return 1;
    if (!b.createdAt) return -1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
  return results;
}
