import { cn } from "@/lib/utils";

export type CommissionStatus = "received" | "working" | "delivered" | "complete";

const statusConfig: Record<CommissionStatus, { label: string; dotClass: string; badgeClass: string }> = {
  received: { label: "접수", dotClass: "status-received", badgeClass: "badge-received" },
  working: { label: "작업중", dotClass: "status-working", badgeClass: "badge-working" },
  delivered: { label: "납품", dotClass: "status-delivered", badgeClass: "badge-delivered" },
  complete: { label: "완료", dotClass: "status-complete", badgeClass: "badge-complete" },
};

interface StatusBadgeProps {
  status: CommissionStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium", config.badgeClass, className)}>
      <span className={cn("status-dot", config.dotClass)} />
      {config.label}
    </span>
  );
}
