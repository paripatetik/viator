// lib/hooks/usePostsByCategories.js
import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import {
  getPostsMeta,
  getPostsByCategoriesMeta,
} from '@/lib/api/rest';

/**
 * Paginated WordPress posts on the client.
 *
 * @param {number[]} selectedIds ― category IDs (empty ⇒ “all”)
 * @param {number}   perPage     ― items per page
 */
export default function usePostsByCategories(selectedIds = [], perPage = 10) {
  /* ─────────────── state ─────────────── */
  const [posts,   setPosts]   = useState([]);
  const [page,    setPage]    = useState(1);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [hasMore, setHasMore] = useState(true);

  const abort = useRef(null);

  /* ───────── memo key: stable & SORTED ───────── */
  const queryKey = useMemo(
    () => [...selectedIds].sort((a, b) => a - b).join(','),
    [selectedIds],
  );

  /* ───────── reset when the filter changes ───── */
  useEffect(() => {
    setPosts([]);
    setPage(1);
    setHasMore(true);
  }, [queryKey]);

  /* ───────── fetch whenever page/filter changes ─ */
  useEffect(() => {
    if (!hasMore) return;

    setLoading(true);
    setError('');
    abort.current?.abort();
    abort.current = new AbortController();

    const fetcher =
      queryKey === ''
        ? getPostsMeta(perPage, { page, signal: abort.current.signal })
        : getPostsByCategoriesMeta(queryKey.split(',').map(Number), perPage, {
            page,
            signal: abort.current.signal,
          });

    fetcher
      .then(({ data, totalPages }) => {
        setPosts(prev => (page === 1 ? data : [...prev, ...data]));
        setHasMore(page < totalPages);
      })
      .catch(err => {
        if (err.name !== 'AbortError') setError('Помилка завантаження.');
      })
      .finally(() => setLoading(false));

    return () => abort.current?.abort();
  }, [queryKey, page, perPage, hasMore]);

  /* ───────── public API ─────── */
  const loadNextPage = useCallback(
    () => hasMore && !loading && setPage(p => p + 1),
    [hasMore, loading],
  );

  return { posts, loading, error, loadNextPage, hasMore };
}