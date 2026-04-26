import { formatCurrency } from '@/utils/format-currency';
import { LucideProps, TrendingDown, TrendingUp } from 'lucide-react';
import { ForwardRefExoticComponent, RefAttributes } from 'react';

interface SalesSummaryCardProps {
  icon: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;
  title: string;
  value: number;
  percentage?: number;
  compareKey?: 'lastYear' | 'lastMonth';
  isMoney?: boolean;
}

function SalesSummaryCard({ icon: Icon, title, value, percentage, compareKey, isMoney = false }: SalesSummaryCardProps) {
  return (
    <div className='bg-card rounded-3xl border shadow-sm p-6 flex flex-col justify-between min-h-[120px]'>
      <div>
        <p className='text-[11px] font-semibold text-muted-foreground uppercase tracking-widest'>{title}</p>
        <p className='text-2xl font-display font-bold mt-3 tabular-nums'>
          {isMoney ? formatCurrency(value) : value.toLocaleString()}
        </p>
      </div>
      <div className='flex items-center justify-between mt-3'>
        {percentage !== undefined && compareKey ? (
          <p className={`text-xs flex items-center gap-1 font-semibold ${percentage >= 0 ? 'text-[hsl(150_45%_40%)]' : 'text-destructive'}`}>
            {percentage >= 0 ? <TrendingUp className='h-3 w-3' /> : <TrendingDown className='h-3 w-3' />}
            {percentage >= 0 ? '+' : ''}{percentage}% {compareKey === 'lastYear' ? '작년 대비' : '전월 대비'}
          </p>
        ) : (
          <p className='text-xs text-muted-foreground'>누적 합계</p>
        )}
        <Icon className='h-4 w-4 text-muted-foreground/40' />
      </div>
    </div>
  );
}

export default SalesSummaryCard;
