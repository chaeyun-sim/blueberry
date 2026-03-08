import { useQuery } from '@tanstack/react-query';
import { scoreQueries } from '@/api/score/queries';

export function useSongField(onSelect: (title: string, composer?: string) => void) {
  const { data: songs = [] } = useQuery(scoreQueries.getSongs());

  const songSuggestions = [...new Set(songs.map(s => s.title))];
  const composerSuggestions = [...new Set(songs.map(s => s.composer).filter(Boolean))] as string[];

  const handleSongSelect = (value: string) => {
    const matches = songs.filter(s => s.title === value);
    onSelect(value, matches.length === 1 ? matches[0].composer : undefined);
  };

  return { songSuggestions, composerSuggestions, handleSongSelect };
}
