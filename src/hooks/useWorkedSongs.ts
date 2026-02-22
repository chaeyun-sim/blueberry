import { useState, useCallback } from 'react';
import { recommendationPool } from '@/mock/recommendations';

export function useWorkedSongs() {
  const [workedSongs, setWorkedSongs] = useState<Set<number>>(new Set(recommendationPool.map(rec => rec.id)));

  const markAsWorked = useCallback((id: number) => {
    setWorkedSongs(prev => {
      const next = new Set(prev);
      next.add(id);
      // TODO: localStorage.setItem('workedSongs', JSON.stringify([...next]));
      return next;
    });
  }, []);

  const unmarkAsWorked = useCallback((id: number) => {
    setWorkedSongs(prev => {
      const next = new Set(prev);
      next.delete(id);
      // TODO: localStorage.setItem('workedSongs', JSON.stringify([...next]));
      return next;
    });
  }, []);

  return { workedSongs, markAsWorked, unmarkAsWorked };
}
