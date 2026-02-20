import { cn } from "@/lib/utils";

export type CommissionStatus = "received" | "working" | "delivered" | "complete";

const statusConfig: Record<CommissionStatus, { label: string; badgeClass: string }> = {
  received: { label: "대기", badgeClass: "badge-received" },
  working: { label: "작업중", badgeClass: "badge-working" },
  delivered: { label: "전달", badgeClass: "badge-delivered" },
  complete: { label: "완료", badgeClass: "badge-complete" },
};

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
