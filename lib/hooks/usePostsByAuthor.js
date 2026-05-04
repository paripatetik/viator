import { useEffect, useState } from 'react';
import { getPostsByAuthorMeta } from '@/lib/api/rest';

export default function usePostsByAuthor(authorId, excludeId, perPage = 3) {
  const [posts, setPosts]   = useState([]);
  const [loading, setLoad]  = useState(true);
  const [error, setError]   = useState('');

  useEffect(() => {
    if (!authorId) {
      setPosts([]);
      setLoad(false);
      return;
    }

    setLoad(true); setError('');

    let active = true;

    getPostsByAuthorMeta(authorId, perPage, {
      exclude: excludeId,
    })
      .then(({ data }) => {
        if (active) setPosts(data);
      })
      .catch(() => {
        if (active) setError('Помилка завантаження.');
      })
      .finally(() => {
        if (active) setLoad(false);
      });

    return () => {
      active = false;
    };
  }, [authorId, excludeId, perPage]);

  return { posts, loading, error };
}
