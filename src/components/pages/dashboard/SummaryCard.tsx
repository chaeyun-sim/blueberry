import { Card, CardContent } from '@/components/ui/card';
import { LucideProps } from 'lucide-react';
import { ForwardRefExoticComponent, RefAttributes } from 'react';

interface SummaryCardProps {
  icon: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;
  value: string;
	description: string;
	colorStatus: 'primary' | 'complete' | 'success' | 'warning';
}

const colorVarMap: Record<'primary' | 'complete' | 'success' | 'warning', string> = {
  primary: '--primary',
  complete: '--status-complete',
  success: '--success',
  warning: '--warning',
};

function SummaryCard({ icon, value, description, colorStatus }: SummaryCardProps) {
	const Icon = icon as React.ElementType;

  return (
    <Card className='border-border/50'>
      <CardContent className='p-4 flex flex-col items-center text-center'>
        <Icon className='h-5 w-5 mb-2' style={{ color: `hsl(var(${colorVarMap[colorStatus]}))` }} />
				<p className='text-2xl font-display font-bold'>{value}</p>
				<p className='text-[11px] text-muted-foreground'>{description}</p>
      </CardContent>
    </Card>
  );
}

export default SummaryCard;
