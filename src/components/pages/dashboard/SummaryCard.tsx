import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { LucideProps } from 'lucide-react';
import { ForwardRefExoticComponent, RefAttributes } from 'react';

interface SummaryCardProps {
  icon: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;
  value: string | number;
  description: string;
  colorStatus: 'primary' | 'complete' | 'success' | 'warning';
}

const cardStyleMap: Record<'primary' | 'complete' | 'success' | 'warning', {
  card: string;
  iconWrap: string;
  icon: string;
  value: string;
  desc: string;
}> = {
  primary: {
    card: 'bg-foreground border-0 shadow-sm',
    iconWrap: 'bg-white/15',
    icon: 'text-white',
    value: 'text-background',
    desc: 'text-background/55',
  },
  complete: {
    card: 'bg-[hsl(150,30%,88%)] dark:bg-[hsl(150,25%,18%)] border-0 shadow-sm',
    iconWrap: 'bg-[hsl(150,40%,42%)]/20',
    icon: 'text-[hsl(150,40%,35%)] dark:text-[hsl(150,40%,60%)]',
    value: '',
    desc: 'text-muted-foreground',
  },
  success: {
    card: 'bg-[hsl(64,30%,86%)] dark:bg-[hsl(64,20%,18%)] border-0 shadow-sm',
    iconWrap: 'bg-[hsl(64,38%,42%)]/20',
    icon: 'text-[hsl(64,38%,35%)] dark:text-[hsl(64,38%,60%)]',
    value: '',
    desc: 'text-muted-foreground',
  },
  warning: {
    card: 'bg-[hsl(345,35%,90%)] dark:bg-[hsl(345,25%,18%)] border-0 shadow-sm',
    iconWrap: 'bg-[hsl(345,42%,46%)]/20',
    icon: 'text-[hsl(345,42%,40%)] dark:text-[hsl(345,42%,62%)]',
    value: '',
    desc: 'text-muted-foreground',
  },
};

function SummaryCard({ icon, value, description, colorStatus }: SummaryCardProps) {
  const Icon = icon as React.ElementType;
  const s = cardStyleMap[colorStatus];

  return (
    <Card className={cn('rounded-[var(--radius)]', s.card)}>
      <CardContent className='p-4 flex flex-col items-center text-center'>
        <div className={`w-9 h-9 rounded-2xl flex items-center justify-center mb-3 ${s.iconWrap}`}>
          <Icon className={`h-4 w-4 ${s.icon}`} />
        </div>
        <p className={`text-2xl font-display font-bold ${s.value}`}>{value}</p>
        <p className={`text-[11px] mt-0.5 ${s.desc}`}>{description}</p>
      </CardContent>
    </Card>
  );
}

export default SummaryCard;
