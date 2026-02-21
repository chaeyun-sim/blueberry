import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronDown,
  ChevronRight,
  FileSpreadsheet,
  Layers,
} from 'lucide-react';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableHeader,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/utils/format-currency';
import { Fragment, useMemo, useState } from 'react';
import { ExcelRow } from '@/components/ExcelUploadDialog';

type SortKey = 'orderDate' | 'category' | 'product' | 'amount';
type SortDir = 'asc' | 'desc';

function SortIcon({ col, sortKey, sortDir }: { col: SortKey; sortKey: SortKey; sortDir: SortDir }) {
  if (sortKey !== col) return <ArrowUpDown className='h-3 w-3 ml-1 opacity-40' />;
  return sortDir === 'asc' ? <ArrowUp className='h-3 w-3 ml-1' /> : <ArrowDown className='h-3 w-3 ml-1' />;
}

interface SalesAllProps {
  originData: ExcelRow[];
}

function SalesAll({ originData }: SalesAllProps) {
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
    () => ['ALL', ...Array.from(new Set(originData.map(r => r.category)))],
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

  const groupedData = useMemo(() => {
    if (!groupByCategory) return null;
    const groups: Record<string, typeof originData> = {};
    sortedData.forEach(row => {
      if (!groups[row.category]) groups[row.category] = [];
      groups[row.category].push(row);
    });
    return groups;
  }, [sortedData, groupByCategory]);

  return (
    <Card className='border-border/50'>
      <CardHeader className='pb-2'>
        <div className='flex items-center justify-between flex-wrap gap-3'>
          <CardTitle className='text-base font-display flex items-center gap-2'>
            <FileSpreadsheet className='h-4 w-4' />
            엑셀 데이터 전체 보기
          </CardTitle>
          <div className='flex items-center gap-2'>
            <Select
              value={filterCategory}
              onValueChange={setFilterCategory}
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
            >
              <Layers className='h-3 w-3' />
              그룹핑
            </Button>
            <span className='text-xs text-muted-foreground'>{sortedData.length}건</span>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className='rounded-md border border-border/50 overflow-auto'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='text-xs uppercase w-12'>#</TableHead>
                <TableHead
                  className='text-xs uppercase cursor-pointer select-none hover:text-foreground transition-colors'
                  onClick={() => toggleSort('orderDate')}
                >
                  <span className='inline-flex items-center'>
                    주문일시
                    <SortIcon col='orderDate' sortKey={sortKey} sortDir={sortDir} />
                  </span>
                </TableHead>
                {!groupByCategory && (
                  <TableHead
                    className='text-xs uppercase cursor-pointer select-none hover:text-foreground transition-colors'
                    onClick={() => toggleSort('category')}
                  >
                    <span className='inline-flex items-center'>
                      대분류
                      <SortIcon col='category' sortKey={sortKey} sortDir={sortDir} />
                    </span>
                  </TableHead>
                )}
                <TableHead
                  className='text-xs uppercase cursor-pointer select-none hover:text-foreground transition-colors'
                  onClick={() => toggleSort('product')}
                >
                  <span className='inline-flex items-center'>
                    주문상품
                    <SortIcon col='product' sortKey={sortKey} sortDir={sortDir} />
                  </span>
                </TableHead>
                <TableHead
                  className='text-xs uppercase text-right cursor-pointer select-none hover:text-foreground transition-colors'
                  onClick={() => toggleSort('amount')}
                >
                  <span className='inline-flex items-center justify-end'>
                    상품총액
                    <SortIcon col='amount' sortKey={sortKey} sortDir={sortDir} />
                  </span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {groupByCategory && groupedData
                ? Object.entries(groupedData).map(([category, rows]) => (
                    <Fragment key={`group-${category}`}>
                      <TableRow
                        className='bg-muted/40 hover:bg-muted/60 cursor-pointer select-none'
                        onClick={() => filterCategory === 'ALL' && toggleGroup(category)}
                      >
                        <TableCell
                          colSpan={4}
                          className='py-2 text-left'
                        >
                          <span className='inline-flex items-center gap-2 text-sm font-display font-bold w-full justify-between'>
                            <div className='inline-flex items-center gap-2'>
                              {filterCategory === 'ALL' &&
                                (collapsedGroups.has(category) ? (
                                  <ChevronRight className='h-4 w-4 text-muted-foreground' />
                                ) : (
                                  <ChevronDown className='h-4 w-4 text-muted-foreground' />
                                ))}
                              <span className='px-2 py-0.5 rounded-full text-xs bg-foreground text-background font-medium'>
                                {category}
                              </span>
                            </div>
                            <span className='text-muted-foreground font-normal text-xs'>
                              {rows.length}건
                            </span>
                          </span>
                        </TableCell>
                      </TableRow>
                      {!collapsedGroups.has(category) &&
                        rows.map((row, i) => (
                          <TableRow key={row.id}>
                            <TableCell className='text-muted-foreground text-xs'>{i + 1}</TableCell>
                            <TableCell className='text-sm tabular-nums'>{row.orderDate}</TableCell>
                            <TableCell className='font-medium text-sm'>{row.product}</TableCell>
                            <TableCell className='text-right tabular-nums text-sm'>
                              {formatCurrency(row.amount)}
                            </TableCell>
                          </TableRow>
                        ))}
                    </Fragment>
                  ))
                : sortedData.map((row, i) => (
                    <TableRow key={row.id}>
                      <TableCell className='text-muted-foreground text-xs'>{i + 1}</TableCell>
                      <TableCell className='text-sm tabular-nums'>{row.orderDate}</TableCell>
                      <TableCell>
                        <span className='px-2 py-0.5 rounded-full text-xs bg-secondary text-secondary-foreground'>
                          {row.category}
                        </span>
                      </TableCell>
                      <TableCell className='font-medium text-sm'>{row.product}</TableCell>
                      <TableCell className='text-right tabular-nums text-sm'>
                        {formatCurrency(row.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

export default SalesAll;
