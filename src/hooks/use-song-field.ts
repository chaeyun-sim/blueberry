import { useQuery } from '@tanstack/react-query';
import { scoreQueries } from '@/api/score/queries';

export function useSongField(onSelect: (title: string, composer?: string) => void) {
  const { data: songs = [] } = useQuery(scoreQueries.getSongs());

  const songSuggestions = songs.map(s => s.title);
  const composerSuggestions = [...new Set(songs.map(s => s.composer).filter(Boolean))] as string[];

  const handleSongSelect = (value: string) => {
    const match = songs.find(s => s.title === value);
    onSelect(value, match?.composer);
  };

  return { songSuggestions, composerSuggestions, handleSongSelect };
}
