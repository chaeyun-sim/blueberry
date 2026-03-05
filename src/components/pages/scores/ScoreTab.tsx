import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, FileMusic, Music, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Breadcrumb from './BreadCrumb';
import FolderRow from './FolderRow';
import { useAppQuery as useQuery } from '@/hooks/use-app-query';
import { scoreQueries } from '@/api/score/queries';
import { scoreMutations } from '@/api/score/mutations';
import { scoreKeys } from '@/api/score/queryKeys';
import { useMutation } from '@tanstack/react-query';
import { queryClient } from '@/utils/query-client';
import dayjs from 'dayjs';
import type { Song } from '@/types/score';

function ScoreTab() {
  const [search, setSearch] = useState('');
  const [openComposer, setOpenComposer] = useState<string | null>(null);
  const [openSongId, setOpenSongId] = useState<string | null>(null);
  const navigate = useNavigate();

  const { data: songs = [], isLoading, isError, refetch } = useQuery(scoreQueries.getSongs());
  const { mutate: deleteSong } = useMutation({
    ...scoreMutations.deleteSong(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: scoreKeys.list() }),
    onError: (e: Error) => toast.error('악보 삭제에 실패했습니다.', { description: e.message }),
  });

  if (isLoading && !songs.length) {
    return (
      <div className='space-y-4'>
        {[0, 1, 2, 3].map(i => (
          <div key={i} className='h-12 rounded-lg bg-muted animate-pulse' />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <Card className='border-destructive/50'>
        <CardContent className='p-6'>
          <div className='flex items-center gap-4'>
            <AlertCircle className='h-8 w-8 text-destructive flex-shrink-0' />
            <div className='flex-1'>
              <p className='font-medium text-destructive'>악보 목록을 불러올 수 없습니다</p>
              <p className='text-sm text-muted-foreground mt-1'>잠시 후 다시 시도해주세요.</p>
            </div>
            <Button onClick={() => refetch()}>다시 시도</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Group songs by composer
  const composerGroups = songs.reduce<Record<string, Song[]>>((acc, song) => {
    const key = song.composer || '(미상)';
    if (!acc[key]) acc[key] = [];
    acc[key].push(song);
    return acc;
  }, {});

  // Level 0: filtered composer list
  const filteredComposers = Object.entries(composerGroups).filter(
    ([composer, composerSongs]) =>
      !search ||
      composer.toLowerCase().includes(search.toLowerCase()) ||
      composerSongs.some(s => s.title.toLowerCase().includes(search.toLowerCase())),
  );

  // Level 1: songs for selected composer
  const composerSongs = openComposer
    ? (composerGroups[openComposer] ?? []).filter(
        s => !search || s.title.toLowerCase().includes(search.toLowerCase()),
      )
    : [];

  // Level 2: selected song for arrangement view
  const openSong = openSongId ? (songs.find(s => s.id === openSongId) ?? null) : null;

  const breadcrumb: { label: string; id: string | null }[] = [{ label: '전체 악보', id: null }];
  if (openComposer) breadcrumb.push({ label: openComposer, id: 'COMPOSER' });
  if (openSong) breadcrumb.push({ label: openSong.title, id: openSong.id });

  const handleNavigate = (id: string | null) => {
    if (id === null) {
      setOpenComposer(null);
      setOpenSongId(null);
    } else if (id === 'COMPOSER') {
      setOpenSongId(null);
    }
    setSearch('');
  };

  const placeholder = () => {
    if (openSong) return '편성명 검색...';
    if (openComposer) return '곡명 검색...';
    return '작곡가 또는 곡명 검색...';
  }

  return (
    <div className='space-y-4'>
      <div className='relative max-w-sm'>
        <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
        <Input
          placeholder={placeholder()}
          value={search}
          onChange={e => setSearch(e.target.value)}
          className='pl-9'
        />
      </div>

      <Breadcrumb path={breadcrumb} onNavigate={handleNavigate} />

      <Card className='border-border/50'>
        <CardContent className='p-2 md:p-5'>
          <AnimatePresence mode='wait'>
            {!openComposer ? (
              <motion.div
                key='list-composers'
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className='flex flex-col gap-0.5'
              >
                {filteredComposers.map(([composer, composerSongs]) => (
                  <FolderRow
                    key={composer}
                    label={composer}
                    count={composerSongs.length}
                    onClick={() => { setOpenComposer(composer); setSearch(''); }}
                  />
                ))}
                {filteredComposers.length === 0 && (
                  <div className='flex flex-col items-center justify-center py-16 text-muted-foreground'>
                    <Music className='h-12 w-12 mb-3 opacity-40' />
                    <p className='text-sm'>검색 결과가 없습니다</p>
                  </div>
                )}
              </motion.div>
            ) : !openSong ? (
              <motion.div
                key={`list-songs-${openComposer}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className='flex flex-col gap-0.5'
              >
                {composerSongs.map(song => (
                  <FolderRow
                    key={song.id}
                    label={song.title}
                    count={song.arrangements.length}
                    onClick={() => setOpenSongId(song.id)}
                    onDelete={song.arrangements.length === 0
                      ? () => deleteSong({ id: song.id })
                      : undefined
                    }
                  />
                ))}
                {composerSongs.length === 0 && (
                  <div className='flex flex-col items-center justify-center py-16 text-muted-foreground'>
                    <Music className='h-12 w-12 mb-3 opacity-40' />
                    <p className='text-sm'>검색 결과가 없습니다</p>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key={`table-files-${openSongId}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className='text-xs uppercase tracking-wider text-left'>편성명</TableHead>
                      <TableHead className='hidden md:block text-xs uppercase tracking-wider text-right'>등록일</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {openSong.arrangements.map(arr => (
                      <TableRow
                        key={arr.id}
                        className='cursor-pointer hover:bg-muted/50'
                        onClick={() => navigate(`/scores/${openSong.id}/arrangements/${arr.id}`)}
                      >
                        <TableCell className='font-medium flex items-center gap-2 text-left'>
                          <FileMusic className='h-4 w-4 text-muted-foreground/60 shrink-0 hidden md:flex' />
                          {arr.arrangement.split(',').length >= 10 ? 'Orchestra' : arr.arrangement}
                        </TableCell>
                        <TableCell className='hidden md:block text-right text-muted-foreground'>
                          {dayjs(arr.created_at).format('YYYY-MM-DD')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}

export default ScoreTab;
