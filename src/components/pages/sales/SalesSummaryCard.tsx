import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/utils/format-currency';
import { LucideProps, TrendingUp } from 'lucide-react';
import { ForwardRefExoticComponent, RefAttributes } from 'react';

interface SalesSummaryCardProps {
  icon: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;
  title: string;
  value: number;
	percentage: number;
	compareKey: 'lastYear' | 'lastMonth';
	isMoney?: boolean;
}

function SalesSummaryCard({ icon, title, value, percentage, compareKey, isMoney = false }: SalesSummaryCardProps) {
	const Icon = icon

  return (
    <Card className='border-border/50'>
      <CardContent className='p-5'>
        <div className='flex items-center justify-between mb-2'>
          <Icon className='h-5 w-5 text-foreground' />
          <span className='text-xs text-muted-foreground font-medium'>{title}</span>
        </div>
        <p className='text-2xl font-display font-bold'>{isMoney ? formatCurrency(value) : value.toLocaleString()}</p>
        <p className='text-xs text-[hsl(var(--status-complete))] mt-1 flex items-center gap-1'>
          <TrendingUp className='h-3 w-3' /> {percentage}% vs {compareKey === 'lastYear' ? '작년' : '전월'}
        </p>
      </CardContent>
    </Card>
  );
}

export default SalesSummaryCard;
