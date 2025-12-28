import { useEffect, useState } from 'react';
import { getPostsByAuthorMeta } from '@/lib/api/rest';

export default function usePostsByAuthor(authorId, excludeId, perPage = 3) {
  const [posts, setPosts]   = useState([]);
  const [loading, setLoad]  = useState(true);
  const [error, setError]   = useState('');

  useEffect(() => {
    if (!authorId) return;
    setLoad(true); setError('');

    const ctrl = new AbortController();
    getPostsByAuthorMeta(authorId, perPage, {
      exclude: excludeId,
      signal:  ctrl.signal,
    })
      .then(({ data }) => setPosts(data))
      .catch((e) => { if (e.name !== 'AbortError') setError('Помилка завантаження.'); })
      .finally(() => setLoad(false));

    return () => ctrl.abort();
  }, [authorId, excludeId, perPage]);

  return { posts, loading, error };
}