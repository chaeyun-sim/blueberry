import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, FileMusic, Music, AlertCircle } from 'lucide-react';
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
import { useQuery } from '@tanstack/react-query';
import { scoreQueries } from '@/api/score/queries';
import dayjs from 'dayjs';

function ScoreTab() {
  const [search, setSearch] = useState('');
  const [openFolderId, setOpenFolderId] = useState<string | null>(null);
  const navigate = useNavigate();

  const { data: songs = [], isLoading, isError, refetch } = useQuery(scoreQueries.getSongs());

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

  const filteredSongs = songs.filter(song =>
    song.title.toLowerCase().includes(search.toLowerCase()),
  );

  const openFolder = openFolderId
    ? songs.find(s => s.id === openFolderId && s.arrangements.length > 0)
    : null;

  const breadcrumb: { label: string; id: string | null }[] = [{ label: '전체 악보', id: null }];
  if (openFolder) breadcrumb.push({ label: openFolder.title, id: openFolder.id });

  return (
    <div className='space-y-4'>
      {/* 검색 */}
      <div className='relative max-w-sm'>
        <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
        <Input
          placeholder='곡명 검색...'
          value={search}
          onChange={e => setSearch(e.target.value)}
          className='pl-9'
        />
      </div>

      <Breadcrumb path={breadcrumb} onNavigate={id => setOpenFolderId(id)} />

      <Card className='border-border/50'>
        <CardContent className='p-5'>
          <AnimatePresence mode='wait'>
            {!openFolder ? (
              <motion.div
                key='list-folders'
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className='flex flex-col gap-0.5'
              >
                {filteredSongs.map(song => (
                  <FolderRow
                    key={song.id}
                    song={song}
                    onClick={() => setOpenFolderId(song.id)}
                  />
                ))}
              </motion.div>
            ) : (
              <motion.div
                key='table-files'
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className='text-xs uppercase tracking-wider text-left'>편성명</TableHead>
                      <TableHead className='text-xs uppercase tracking-wider text-right'>등록일</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {openFolder.arrangements.map(arr => (
                      <TableRow
                        key={arr.id}
                        className='cursor-pointer hover:bg-muted/50'
                        onClick={() => navigate(`/scores/${openFolder.id}/arrangements/${arr.id}`)}
                      >
                        <TableCell className='font-medium flex items-center gap-2'>
                          <FileMusic className='h-4 w-4 text-muted-foreground/60 shrink-0' />
                          {arr.arrangement.split(',').length >= 10 ? 'Orchestra' : arr.arrangement}
                        </TableCell>
                        <TableCell className='text-right text-muted-foreground'>
                          {dayjs(arr.created_at).format('YYYY-MM-DD')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </motion.div>
            )}
          </AnimatePresence>

          {!openFolder && filteredSongs.length === 0 && (
            <div className='flex flex-col items-center justify-center py-16 text-muted-foreground'>
              <Music className='h-12 w-12 mb-3 opacity-40' />
              <p className='text-sm'>검색 결과가 없습니다</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default ScoreTab;
