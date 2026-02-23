import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/PageHeader';
import { StatusBadge, CommissionStatus } from '@/components/StatusBadge';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Search } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { DifficultyLevelType } from '@/types/commission';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { commissionQueries } from '@/api/commission/queries';
import { abbreviateInstrument } from '@/constants/instruments';

const tabs: { label: string; value: CommissionStatus | 'all' }[] = [
  { label: '전체', value: 'all' },
  { label: '대기', value: 'received' },
  { label: '작업중', value: 'working' },
  { label: '완료', value: 'complete' },
  { label: '전달', value: 'delivered' },
];

const versionLabel = (v: DifficultyLevelType) => (v || '-');

const CommissionList = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const statusParam = searchParams.get('status');

  const initialStatus = tabs.some(t => t.value === statusParam)
    ? (statusParam as CommissionStatus | 'all')
    : 'all';

  const [filter, setFilter] = useState<CommissionStatus | 'all'>(initialStatus || 'all');
  const [search, setSearch] = useState('');

  const { data: commissions } = useQuery(commissionQueries.getCommissions())

  const filtered = (commissions ?? []).filter(c => {
    const matchesFilter = filter === 'all' || c.status === filter;
    const title = c.songs?.title ?? c.title ?? '';
    const matchesSearch = title.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });


  return (
    <AppLayout>
      <PageHeader
        title='의뢰 목록'
        description='모든 악보 의뢰를 관리합니다'
      />

      {/* Filters */}
      <div className='flex flex-col sm:flex-row items-start md:justify-between sm:items-center gap-4 mb-6'>
        <div className='flex items-center gap-1 bg-muted rounded-lg p-1'>
          {tabs.map(tab => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                filter === tab.value
                  ? 'bg-background shadow-sm font-medium'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className='relative flex-1 max-w-sm'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
          <Input
            placeholder='곡명 검색...'
            value={search}
            onChange={e => setSearch(e.target.value)}
            className='pl-9'
          />
        </div>
      </div>

      {/* Table View */}
      <Card>
        <CardContent className='p-0'>
          <Table className='table-fixed'>
            <TableHeader className={cn(filtered.length === 0 && "border-none")}>
              <TableRow className={cn("hover:bg-none!", filtered.length === 0 && 'border-none')}>
                <TableHead className='text-xs uppercase tracking-wider w-[14%]'>마감일</TableHead>
                <TableHead className='text-xs uppercase tracking-wider w-[22%]'>곡명</TableHead>
                <TableHead className='text-xs uppercase tracking-wider w-[22%]'>작곡가</TableHead>
                <TableHead className='text-xs uppercase tracking-wider w-[16%]'>편성</TableHead>
                <TableHead className='text-xs uppercase tracking-wider w-[14%]'>버전</TableHead>
                <TableHead className='text-xs uppercase tracking-wider w-[12%]'>상태</TableHead>
              </TableRow>
            </TableHeader>
            {filtered.length > 0 && (
              <TableBody>
                {filtered.map(item => (
                  <TableRow
                    key={item.id}
                    className='cursor-pointer'
                    onClick={() => navigate(`/commissions/${item.id}`)}
                  >
                    <TableCell className='text-foreground'>{item.deadline}</TableCell>
                    <TableCell className='font-medium truncate'>{item.title}</TableCell>
                    <TableCell className='text-foreground truncate'>{item.composer}</TableCell>
                    <TableCell className='text-foreground'>
                      {item.arrangement.split(', ').map(abbreviateInstrument).join(', ')}
                    </TableCell>
                    <TableCell>
                      {item.version ? (
                        <span className='text-xs px-2 py-1 rounded-md bg-[hsl(var(--warning)/0.12)] text-[hsl(var(--warning))] font-medium capitalize'>
                          {versionLabel(item.version)}
                        </span>
                      ) : (
                        <span className='text-muted-foreground'>-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={item.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            )}
          </Table>
        </CardContent>
      </Card>
    </AppLayout>
  );
};

export default CommissionList;

