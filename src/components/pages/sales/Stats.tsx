import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ChartContainer } from '@/components/ui/chart';
import { PieChart, Pie, Cell } from 'recharts';
import { ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Layers, Music } from 'lucide-react';
import {
  Table,
  TableHeader,
  TableBody,
  TableCell,
  TableRow,
  TableHead,
} from '@/components/ui/table';
import { mockTopSongs, mockTopArrangements } from '@/mock/sales';
import { formatCurrency } from '@/utils/format-currency';
import { cn } from '@/lib/utils';

const categoryData = [
  { name: 'CLASSIC', value: 45, fill: 'hsl(var(--primary))' },
  { name: 'OST', value: 25, fill: 'hsl(var(--accent))' },
  { name: 'ANI', value: 18, fill: 'hsl(var(--status-received))' },
  { name: 'ETC', value: 12, fill: 'hsl(var(--status-complete))' },
];

const obj = {
  '#': 'rank',
  곡명: 'title',
  분류: 'category',
  판매수: 'sales',
  매출: 'revenue',
};

function Stats() {
  return (
    <>
      <div className='grid lg:grid-cols-3 gap-6'>
        <Card className='border-border/50'>
          <CardHeader className='pb-2'>
            <CardTitle className='text-base font-display'>카테고리별 분포</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{}}
              className='mx-auto aspect-square max-h-[250px]'
            >
              <PieChart>
                <Pie
                  data={categoryData}
                  dataKey='value'
                  nameKey='name'
                  cx='50%'
                  cy='50%'
                  innerRadius={50}
                  outerRadius={80}
                  strokeWidth={2}
                  stroke='hsl(var(--background))'
                >
                  {categoryData.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={entry.fill}
                    />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
            <div className='flex flex-wrap justify-center gap-3 mt-2'>
              {categoryData.map(c => (
                <div
                  key={c.name}
                  className='flex items-center gap-1.5 text-xs'
                >
                  <span
                    className='w-2.5 h-2.5 rounded-full'
                    style={{ backgroundColor: c.fill }}
                  />
                  {c.name} ({c.value}%)
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className='border-border/50 lg:col-span-2'>
          <CardHeader className='pb-2'>
            <CardTitle className='text-base font-display flex items-center gap-2'>
              <Music className='h-4 w-4' />
              가장 많이 팔린 곡 TOP 5
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  {Object.values(obj).map((text, i) => (
                    <TableHead
                      className={cn(
                        'text-xs uppercase',
                        i === Object.values(obj).length - 1 && 'text-right',
                      )}
                      key={text}
                    >
                      {text}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockTopSongs.map(song => (
                  <TableRow key={song.rank}>
                    <TableCell className='font-medium'>{song.rank}</TableCell>
                    <TableCell className='font-medium'>{song.title}</TableCell>
                    <TableCell>
                      <span className='px-2 py-0.5 rounded-full text-xs bg-muted text-foreground font-medium'>
                        {song.category}
                      </span>
                    </TableCell>
                    <TableCell className='tabular-nums'>{song.sales}</TableCell>
                    <TableCell className='text-right tabular-nums'>
                      {formatCurrency(song.revenue)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card className='border-border/50'>
        <CardHeader className='pb-2'>
          <CardTitle className='text-base font-display flex items-center gap-2'>
            <Layers className='h-4 w-4' />
            가장 많이 팔린 편성 TOP 5
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='text-xs uppercase w-12'>#</TableHead>
                <TableHead className='text-xs uppercase'>편성</TableHead>
                <TableHead className='text-xs uppercase text-right'>판매수</TableHead>
                <TableHead className='text-xs uppercase text-right'>매출</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockTopArrangements.map(arr => (
                <TableRow key={arr.rank}>
                  <TableCell className='font-display font-bold text-foreground'>
                    {arr.rank}
                  </TableCell>
                  <TableCell className='font-medium'>{arr.arrangement}</TableCell>
                  <TableCell className='text-right'>{arr.sales}건</TableCell>
                  <TableCell className='text-right'>{formatCurrency(arr.revenue)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}

export default Stats;
