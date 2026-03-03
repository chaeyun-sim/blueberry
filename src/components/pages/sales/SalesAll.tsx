import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { MOBILE_BREAKPOINT } from '@/constants/breakpoints';
import {
  ChevronDown,
  ChevronRight,
  FileSpreadsheet,
  Layers,
  Monitor,
} from 'lucide-react';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/utils/format-currency';
import { Fragment, useMemo, useState } from 'react';
import { statsQueries } from '@/api/stats/queries';
import { useAppQuery as useQuery } from '@/hooks/use-app-query';
import { splitProduct } from '@/utils/split-product';
import SortIcon from './SortIcon';

type SortKey = 'category' | 'product' | 'amount';
type SortDir = 'asc' | 'desc';

// 컬럼 flex 비율 — 헤더·바디에서 공유
const COL = {
  idx: 'w-8 shrink-0',
  cat: 'flex-[0.8] min-w-0',
  song: 'flex-[2.5] min-w-0',
  arrangement: 'flex-[1.5] min-w-0',
  amount: 'flex-[1.2] min-w-0',
} as const;

const HEAD_BASE = 'text-xs uppercase text-muted-foreground select-none px-3 py-2.5';
const ROW_BASE = 'flex items-center border-b border-border/40 last:border-0 hover:bg-muted/30 transition-colors';

function SalesAll() {
  const { data: yearRange } = useQuery(statsQueries.getSalesYearRange());
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const year = selectedYear ?? yearRange?.max ?? undefined;
  const yearOptions = yearRange
    ? Array.from({ length: yearRange.max - yearRange.min + 1 }, (_, i) => yearRange.max - i)
    : [];

  const { data: originData = [] } = useQuery({
    ...statsQueries.getSalesRows(year),
    enabled: year !== undefined,
  });

  const [sortKey, setSortKey] = useState<SortKey>('category');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [groupByCategory, setGroupByCategory] = useState(true);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  const toggleGroup = (category: string) => {
    setCollapsedGroups(prev => {
      const next = new Set(prev);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  };

  const categories = useMemo(
    () => ['ALL', ...Array.from(new Set(originData.map(r => r.category).filter(Boolean)))],
    [originData],
  );

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const sortedData = useMemo(() => {
    let data = [...originData];
    if (filterCategory !== 'ALL') {
      data = data.filter(r => r.category === filterCategory);
    }
    data.sort((a, b) => {
      if (groupByCategory && sortKey !== 'category') {
        const catCmp = a.category.localeCompare(b.category, 'ko');
        if (catCmp !== 0) return catCmp;
      }
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      const cmp =
        typeof aVal === 'number'
          ? aVal - (bVal as number)
          : String(aVal).localeCompare(String(bVal), 'ko');
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return data;
  }, [sortKey, sortDir, filterCategory, groupByCategory, originData]);

  const isMobile = typeof window !== 'undefined' && window.innerWidth < MOBILE_BREAKPOINT;
  const displayData = isMobile ? sortedData.slice(0, 6) : sortedData;

  const groupedData = useMemo(() => {
    if (!groupByCategory) return null;
    const groups: Record<string, typeof originData> = {};
    displayData.forEach(row => {
      if (!groups[row.category]) groups[row.category] = [];
      groups[row.category].push(row);
    });
    return groups;
  }, [displayData, groupByCategory]);

  return (
    <Card className='border-border/50'>
      <CardHeader className='pb-2'>
        <div className='flex items-center justify-between flex-wrap gap-3'>
          <CardTitle className='text-base font-display flex items-center gap-2'>
            <FileSpreadsheet className='h-4 w-4' />
            엑셀 데이터 전체 보기
          </CardTitle>
          <div className='hidden md:flex items-center gap-2'>
            <Select
              value={year ? String(year) : ''}
              onValueChange={v => setSelectedYear(Number(v))}
              aria-label='연도 선택'
            >
              <SelectTrigger className='w-24 h-8 text-xs'>
                <SelectValue placeholder='연도' />
              </SelectTrigger>
              <SelectContent>
                {yearOptions.map(y => (
                  <SelectItem key={y} value={String(y)}>{y}년</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterCategory} onValueChange={setFilterCategory} aria-label='대분류 필터 선택'>
              <SelectTrigger className='w-32 h-8 text-xs'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>
                    {cat === 'ALL' ? '전체 대분류' : cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant={groupByCategory ? 'default' : 'outline'}
              size='sm'
              className={cn(
                'gap-1.5 h-8 text-xs',
                groupByCategory ? 'hover:bg-primary' : 'hover:bg-primary/10',
              )}
              onClick={() => setGroupByCategory(v => !v)}
              aria-label='그룹핑 토글'
            >
              <Layers className='h-3 w-3' />
              그룹핑
            </Button>
            <span className='text-xs text-muted-foreground'>{sortedData.length}건</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className='relative'>
        {/* 모바일 블러 오버레이 */}
        <div className='md:hidden absolute inset-0 z-10 backdrop-blur-sm bg-background/80 rounded-b-xl flex flex-col items-center justify-center gap-3 pointer-events-none'>
          <Monitor className='h-8 w-8 text-muted-foreground' />
          <p className='text-sm font-medium text-foreground'>PC에서 확인해주세요</p>
          <p className='text-xs text-muted-foreground'>표 데이터는 넓은 화면에서 더 잘 보여요</p>
        </div>
        <div className='rounded-md border border-border/50 overflow-auto'>
          {/* ── Header ── */}
          <div className='flex items-center bg-muted/30 border-b border-border/40'>
            <div className={cn(COL.idx, HEAD_BASE)} />
            {!groupByCategory && (
              <button
                type='button'
                className={cn(COL.cat, HEAD_BASE, 'inline-flex items-center cursor-pointer hover:text-foreground transition-colors')}
                onClick={() => toggleSort('category')}
              >
                대분류
                <SortIcon col='category' sortKey={sortKey} sortDir={sortDir} />
              </button>
            )}
            <button
              type='button'
              className={cn(COL.song, HEAD_BASE, 'inline-flex items-center cursor-pointer hover:text-foreground transition-colors')}
              onClick={() => toggleSort('product')}
            >
              곡명
              <SortIcon col='product' sortKey={sortKey} sortDir={sortDir} />
            </button>
            <div className={cn(COL.arrangement, HEAD_BASE, 'text-xs uppercase text-muted-foreground')}>
              편성명
            </div>
            <button
              type='button'
              className={cn(COL.amount, HEAD_BASE, 'inline-flex items-center justify-end cursor-pointer hover:text-foreground transition-colors')}
              onClick={() => toggleSort('amount')}
            >
              상품총액
              <SortIcon col='amount' sortKey={sortKey} sortDir={sortDir} />
            </button>
          </div>

          {/* ── Body ── */}
          {groupByCategory && groupedData
            ? Object.entries(groupedData).map(([category, rows]) => (
                <Fragment key={`group-${category}`}>
                  {/* Group header */}
                  <div
                    className='flex items-center justify-between px-4 py-2 bg-muted/40 hover:bg-muted/60 cursor-pointer select-none border-b border-border/40'
                    onClick={() => filterCategory === 'ALL' && toggleGroup(category)}
                  >
                    <div className='inline-flex items-center gap-2'>
                      {filterCategory === 'ALL' &&
                        (collapsedGroups.has(category) ? (
                          <ChevronRight className='h-4 w-4 text-muted-foreground' />
                        ) : (
                          <ChevronDown className='h-4 w-4 text-muted-foreground' />
                        ))}
                      <span className='px-2 py-0.5 rounded-full text-xs bg-foreground text-background font-bold font-display'>
                        {category}
                      </span>
                    </div>
                    <span className='text-muted-foreground text-xs'>{rows.length}건</span>
                  </div>
                  {/* Group rows */}
                  {!collapsedGroups.has(category) &&
                    rows.map((row, i) => {
                      const { song, arrangement } = splitProduct(row.product);
                      return (
                        <div key={row.id} className={ROW_BASE}>
                          <div className={cn(COL.idx, 'px-3 py-2.5 text-xs text-muted-foreground')}>{i + 1}</div>
                          <div className={cn(COL.song, 'px-3 py-2.5 font-medium text-sm truncate')}>{song}</div>
                          <div className={cn(COL.arrangement, 'px-3 py-2.5 text-sm text-muted-foreground truncate')}>{arrangement}</div>
                          <div className={cn(COL.amount, 'px-3 py-2.5 text-right tabular-nums text-sm')}>{formatCurrency(row.amount)}</div>
                        </div>
                      );
                    })}
                </Fragment>
              ))
            : displayData.map((row, i) => {
                const { song, arrangement } = splitProduct(row.product);
                return (
                  <div key={row.id} className={ROW_BASE}>
                    <div className={cn(COL.idx, 'px-3 py-2.5 text-xs text-muted-foreground')}>{i + 1}</div>
                    <div className={cn(COL.cat, 'px-3 py-2.5')}>
                      <span className='px-2 py-0.5 rounded-full text-xs bg-secondary text-secondary-foreground'>
                        {row.category}
                      </span>
                    </div>
                    <div className={cn(COL.song, 'px-3 py-2.5 font-medium text-sm truncate')}>{song}</div>
                    <div className={cn(COL.arrangement, 'px-3 py-2.5 text-sm text-muted-foreground truncate')}>{arrangement}</div>
                    <div className={cn(COL.amount, 'px-3 py-2.5 text-right tabular-nums text-sm')}>{formatCurrency(row.amount)}</div>
                  </div>
                );
              })}
        </div>
      </CardContent>
    </Card>
  );
}

export default SalesAll;
