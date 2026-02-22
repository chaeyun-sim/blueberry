import { useState, useCallback } from 'react';
import { loadWorkedSongs, saveWorkedSongs } from '@/utils/worked-songs';

export function useWorkedSongs() {
  const [workedSongs, setWorkedSongs] = useState<Set<number>>(loadWorkedSongs);

  const markAsWorked = useCallback((id: number) => {
    setWorkedSongs(prev => {
      const next = new Set(prev);
      next.add(id);
      saveWorkedSongs(next);
      return next;
    });
  }, []);

  const unmarkAsWorked = useCallback((id: number) => {
    setWorkedSongs(prev => {
      const next = new Set(prev);
      next.delete(id);
      saveWorkedSongs(next);
      return next;
    });
  }, []);

  return { workedSongs, markAsWorked, unmarkAsWorked };
}
