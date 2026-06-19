// lib/hooks/usePostsByCategories.js
import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import {
  getPostsMeta,
  getPostsByCategoriesMeta,
} from '@/lib/api/rest';

/**
 * Module-level cache — survives client-side navigation.
 * Only written after a successful fetch, never with empty data.
 * Key: queryKey  →  { posts, page, hasMore }
 */
const STATE_CACHE = new Map();

export default function usePostsByCategories(
  selectedIds = [],
  perPage = 10,
  initialPosts = [],
) {
  const queryKey = useMemo(
    () => [...selectedIds].sort((a, b) => a - b).join(','),
    [selectedIds],
  );

  // Seed from cache on first render — gives scroll-restoration a stable layout
  const canUseInitialPosts = queryKey === '' && initialPosts.length > 0;
  const initialSeed = canUseInitialPosts
    ? { posts: initialPosts, page: 1, hasMore: true }
    : null;
  const cached = STATE_CACHE.get(queryKey) ?? initialSeed;

  const [posts,   setPosts]   = useState(cached?.posts   ?? []);
  const [page,    setPage]    = useState(cached?.page    ?? 1);
  const [loading, setLoading] = useState(!cached);
  const [error,   setError]   = useState('');
  const [hasMore, setHasMore] = useState(cached?.hasMore ?? true);
  const [pageQueryKey, setPageQueryKey] = useState(queryKey);
  const queryVersion = useRef(0);

  /* Reset when filter changes */
  useEffect(() => {
    queryVersion.current += 1;
    setPageQueryKey(queryKey);

    const hit = STATE_CACHE.get(queryKey);
    if (hit) {
      setPosts(hit.posts);
      setPage(hit.page);
      setHasMore(hit.hasMore);
      setLoading(false);
      setError('');
    } else {
      setPage(1);
      setHasMore(true);
      setLoading(true);
      setError('');
    }
  }, [queryKey]);

  /* Fetch — skipped when cache already covers this page */
  useEffect(() => {
    if (pageQueryKey !== queryKey) return;

    const hit = STATE_CACHE.get(queryKey);
    if (hit && hit.page >= page) return;
    if (!hasMore && page > 1) return;

    setLoading(true);
    setError('');
    let active = true;
    const version = queryVersion.current;

    const fetcher =
      queryKey === ''
        ? getPostsMeta(perPage, { page })
        : getPostsByCategoriesMeta(queryKey.split(',').map(Number), perPage, {
            page,
          });

    fetcher
      .then(({ data, totalPages }) => {
        if (!active || version !== queryVersion.current) return;

        setPosts(prev => {
          const next = page === 1 ? data : [...prev, ...data];
          // Write to cache only after a successful fetch
          STATE_CACHE.set(queryKey, { posts: next, page, hasMore: page < totalPages });
          return next;
        });
        setHasMore(page < totalPages);
      })
      .catch(err => {
        if (active && version === queryVersion.current) {
          setError('Помилка завантаження.');
        }
      })
      .finally(() => {
        if (active && version === queryVersion.current) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [queryKey, pageQueryKey, page, perPage, hasMore]);

  const loadNextPage = useCallback(
    () => hasMore && !loading && setPage(p => p + 1),
    [hasMore, loading],
  );

  return { posts, loading, error, loadNextPage, hasMore };
}
