import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { LucideProps } from 'lucide-react';
import { ForwardRefExoticComponent, RefAttributes } from 'react';

interface SummaryCardProps {
  icon: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;
  value: string;
	description: string;
	colorStatus: 'primary' | 'complete' | 'success' | 'warning';
}

function SummaryCard({ icon, value, description, colorStatus }: SummaryCardProps) {
	const Icon = icon as React.ElementType;
	
  return (
    <Card className='border-border/50'>
      <CardContent className='p-4 flex flex-col items-center text-center'>
        <Icon className={cn('h-5 w-5 mb-2', `text-[hsl(var(--status-${colorStatus}))]`)} />
				<p className='text-2xl font-display font-bold'>{value}</p>
				<p className='text-[11px] text-muted-foreground'>{description}</p>
      </CardContent>
    </Card>
  );
}

export default SummaryCard;
