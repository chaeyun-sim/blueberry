import { FileSpreadsheet, Layers, Monitor } from 'lucide-react';
import { Fragment, useState } from 'react';
import { statsQueries } from '@/api/stats/queries';
import Button from '@/components/ui/button';
import { Card, CardContent,CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAppQuery as useQuery } from '@/hooks/use-app-query';
import { useSalesTableData } from '@/hooks/use-sales-table-data';
import { cn } from '@/lib/utils';
import { splitProduct } from '@/utils/split-product';
import { SalesCategoryGroupHeader } from './SalesCategoryGroupHeader';
import { SalesTableRow } from './SalesTableRow';
import SortIcon from './SortIcon';

// 컬럼 flex 비율 — 헤더에서 공유
const COL = {
  idx: 'w-8 shrink-0',
  cat: 'flex-[0.8] min-w-0',
  song: 'flex-[2.5] min-w-0',
  arrangement: 'flex-[1.5] min-w-0',
  amount: 'flex-[1.2] min-w-0',
} as const;

const HEAD_BASE = 'text-xs uppercase text-muted-foreground select-none px-3 py-2.5';

function SalesAll() {
  const { data: yearRange, isFetched: yearRangeFetched } = useQuery(
    statsQueries.getSalesYearRange(),
  );
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const year = selectedYear ?? yearRange?.max ?? undefined;
  const yearOptions = yearRange
    ? Array.from({ length: yearRange.max - yearRange.min + 1 }, (_, i) => yearRange.max - i)
    : [];

  const { data: originData = [] } = useQuery({
    ...statsQueries.getSalesRows(year),
    enabled: year !== undefined,
  });

  const {
    sortKey,
    sortDir,
    filterCategory,
    setFilterCategory,
    groupByCategory,
    setGroupByCategory,
    collapsedGroups,
    toggleGroup,
    toggleSort,
    categories,
    sortedData,
    displayData,
    groupedData,
  } = useSalesTableData(originData);

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
                  <SelectItem
                    key={y}
                    value={String(y)}
                  >
                    {y}년
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filterCategory}
              onValueChange={setFilterCategory}
              aria-label='대분류 필터 선택'
            >
              <SelectTrigger className='w-32 h-8 text-xs'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem
                    key={cat}
                    value={cat}
                  >
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

      <CardContent className='relative md:pb-0 pb-40'>
        {/* 모바일 블러 오버레이 */}
        <div className='md:hidden absolute inset-0 z-10 backdrop-blur-sm bg-background/80 rounded-b-xl flex flex-col items-center justify-center gap-3 pointer-events-none'>
          <Monitor className='h-8 w-8 text-muted-foreground' />
          <p className='text-sm font-medium text-foreground'>PC에서 확인해주세요</p>
          <p className='text-xs text-muted-foreground'>표 데이터는 넓은 화면에서 더 잘 보여요</p>
        </div>
        {yearRangeFetched && !yearRange && (
          <p className='text-sm text-muted-foreground py-8 text-center'>
            데이터가 없습니다. 매출 데이터를 업로드하면 확인할 수 있어요.
          </p>
        )}
        {(!yearRangeFetched || !!yearRange) && (
          <div className='rounded-md border border-border/50 overflow-auto'>
            {/* ── Header ── */}
            <div className='flex items-center bg-muted/30 border-b border-border/40'>
              <div className={cn(COL.idx, HEAD_BASE)} />
              {!groupByCategory && (
                <button
                  type='button'
                  className={cn(
                    COL.cat,
                    HEAD_BASE,
                    'inline-flex items-center cursor-pointer hover:text-foreground transition-colors',
                  )}
                  onClick={() => toggleSort('category')}
                >
                  대분류
                  <SortIcon
                    col='category'
                    sortKey={sortKey}
                    sortDir={sortDir}
                  />
                </button>
              )}
              <button
                type='button'
                className={cn(
                  COL.song,
                  HEAD_BASE,
                  'inline-flex items-center cursor-pointer hover:text-foreground transition-colors',
                )}
                onClick={() => toggleSort('product')}
              >
                곡명
                <SortIcon
                  col='product'
                  sortKey={sortKey}
                  sortDir={sortDir}
                />
              </button>
              <div
                className={cn(
                  COL.arrangement,
                  HEAD_BASE,
                  'text-xs uppercase text-muted-foreground',
                )}
              >
                편성명
              </div>
              <button
                type='button'
                className={cn(
                  COL.amount,
                  HEAD_BASE,
                  'inline-flex items-center justify-end cursor-pointer hover:text-foreground transition-colors',
                )}
                onClick={() => toggleSort('amount')}
              >
                상품총액
                <SortIcon
                  col='amount'
                  sortKey={sortKey}
                  sortDir={sortDir}
                />
              </button>
            </div>

            {/* ── Body ── */}
            {groupByCategory && groupedData
              ? Object.entries(groupedData).map(([category, rows]) => (
                  <Fragment key={`group-${category}`}>
                    <SalesCategoryGroupHeader
                      category={category}
                      rowCount={rows.length}
                      collapsed={collapsedGroups.has(category)}
                      collapsible={filterCategory === 'ALL'}
                      onToggle={() => toggleGroup(category)}
                    />
                    {!collapsedGroups.has(category) &&
                      rows.map((row, i) => {
                        const { song, arrangement } = splitProduct(row.product);
                        return (
                          <SalesTableRow
                            key={row.id}
                            idx={i + 1}
                            song={song}
                            arrangement={arrangement}
                            amount={row.amount}
                          />
                        );
                      })}
                  </Fragment>
                ))
              : displayData.map((row, i) => {
                  const { song, arrangement } = splitProduct(row.product);
                  return (
                    <SalesTableRow
                      key={row.id}
                      idx={i + 1}
                      song={song}
                      arrangement={arrangement}
                      amount={row.amount}
                      category={row.category}
                      showCategory
                    />
                  );
                })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default SalesAll;
