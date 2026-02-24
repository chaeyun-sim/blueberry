import { CommissionStatus, statusConfig } from '@/constants/status-config';
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: CommissionStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const { label, badgeClass } = statusConfig[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium", badgeClass, className)}>
      {label}
    </span>
  );
}
