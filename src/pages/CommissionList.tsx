import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatusBadge } from '@/components/pages/commission/StatusBadge';
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
import { Search, AlertCircle } from 'lucide-react';
import Button from '@/components/ui/button';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAppQuery as useQuery } from '@/hooks/use-app-query';
import { commissionQueries } from '@/api/commission/queries';
import { abbreviateInstrument } from '@/utils/instrument';
import ErrorBoundary from '@/components/ErrorBoundary';
import { CommissionStatus } from '@/constants/status-config';

const tabs: { label: string; value: CommissionStatus | 'all' }[] = [
  { label: '전체', value: 'all' },
  { label: '대기', value: 'received' },
  { label: '작업중', value: 'working' },
  { label: '완료', value: 'complete' },
  { label: '전달', value: 'delivered' },
];

const CommissionListContent = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const statusParam = searchParams.get('status');

  const initialStatus = tabs.some(t => t.value === statusParam)
    ? (statusParam as CommissionStatus | 'all')
    : 'all';

  const [filter, setFilter] = useState<CommissionStatus | 'all'>(initialStatus || 'all');
  const [search, setSearch] = useState('');

  const { data: commissions = [], isLoading, isError, refetch } = useQuery(commissionQueries.getCommissions());

  // L1: 로딩 상태
  if (isLoading && !commissions.length) {
    return (
      <AppLayout>
        <PageHeader
          title='의뢰 목록'
          description='모든 악보 의뢰를 관리합니다'
        />
        <div className='space-y-4' role="status">
          {[0, 1, 2, 3].map(i => (
            <div
              key={i}
              className='h-12 rounded-lg bg-muted animate-pulse'
            />
          ))}
        </div>
      </AppLayout>
    );
  }

  // L2: 에러 상태 (React Query isError - Error Boundary와 분리)
  if (isError) {
    return (
      <AppLayout>
        <PageHeader
          title='의뢰 목록'
          description='모든 악보 의뢰를 관리합니다'
        />
        <Card className='border-destructive/50'>
          <CardContent className='p-6'>
            <div className='flex items-center gap-4'>
              <AlertCircle className='h-8 w-8 text-destructive flex-shrink-0' />
              <div className='flex-1'>
                <p className='font-medium text-destructive'>의뢰 목록을 불러올 수 없습니다</p>
                <p className='text-sm text-muted-foreground mt-1'>잠시 후 다시 시도해주세요.</p>
              </div>
              <Button onClick={() => refetch()}>다시 시도</Button>
            </div>
          </CardContent>
        </Card>
      </AppLayout>
    );
  }

  // L3: 정상 렌더링
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
            className='text-sm md:text-base pl-9'
            aria-label="곡명 검색"
          />
        </div>
      </div>

      {/* Mobile: 세로 카드 뷰 */}
      <div className='md:hidden space-y-3'>
        {filtered.length === 0 ? (
          <p className='text-sm text-muted-foreground text-center py-8'>의뢰가 없습니다.</p>
        ) : (
          filtered.map(item => (
            <Card
              key={item.id}
              className='cursor-pointer active:bg-muted/50 transition-colors'
              onClick={() => navigate(`/commissions/${item.id}`)}
            >
              <CardContent className='p-0 divide-y'>
                {([
                  { label: '마감일', value: item.deadline },
                  { label: '곡명', value: item.songs?.title ?? item.title ?? '-', bold: true },
                  { label: '작곡가', value: item.songs?.composer ?? item.composer ?? '-' },
                  { label: '편성', value: (item.arrangement ?? '').split(', ').map(abbreviateInstrument).join(', ') },
                ] as const).map(({ label, value }) => (
                  <div key={label} className='flex items-center gap-4 px-4 py-3'>
                    <span className='text-sm text-muted-foreground w-14 shrink-0'>{label}</span>
                    <span className={cn('text-sm truncate', label === '곡명' && 'font-medium')}>{value}</span>
                  </div>
                ))}
                <div className='flex items-center gap-4 px-4 py-3'>
                  <span className='text-sm text-muted-foreground w-14 shrink-0'>버전</span>
                  {item.version ? (
                    <span className='text-xs px-2 py-1 rounded-md bg-[hsl(var(--warning)/0.12)] text-[hsl(var(--warning))] font-medium capitalize'>
                      {item.version}
                    </span>
                  ) : (
                    <span className='text-sm text-muted-foreground'>-</span>
                  )}
                </div>
                <div className='flex items-center gap-4 px-4 py-3'>
                  <span className='text-sm text-muted-foreground w-14 shrink-0'>상태</span>
                  <StatusBadge status={item.status} />
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Desktop: 가로 테이블 뷰 */}
      <Card className='hidden md:block'>
        <CardContent className='p-0'>
          <Table className='table-fixed'>
            <TableHeader className={cn(filtered.length === 0 && 'border-none')}>
              <TableRow className={cn('hover:bg-none!', filtered.length === 0 && 'border-none')}>
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
                    role="button"
                    tabIndex={0}
                    className='cursor-pointer'
                    onClick={() => navigate(`/commissions/${item.id}`)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        navigate(`/commissions/${item.id}`);
                      }
                    }}
                  >
                    <TableCell className='text-foreground'>{item.deadline}</TableCell>
                    <TableCell className='font-medium truncate'>{item.songs?.title ?? item.title ?? '-'}</TableCell>
                    <TableCell className='text-foreground truncate'>{item.songs?.composer ?? item.composer ?? '-'}</TableCell>
                    <TableCell className='text-foreground'>
                      {(item.arrangement ?? '').split(', ').map(abbreviateInstrument).join(', ')}
                    </TableCell>
                    <TableCell>
                      {item.version ? (
                        <span className='text-xs px-2 py-1 rounded-md bg-[hsl(var(--warning)/0.12)] text-[hsl(var(--warning))] font-medium capitalize'>
                          {item.version || '-'}
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

const CommissionList = () => (
  <ErrorBoundary level='page'>
    <CommissionListContent />
  </ErrorBoundary>
);

export default CommissionList;
