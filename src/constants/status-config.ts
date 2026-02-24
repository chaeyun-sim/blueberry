export type CommissionStatus = "received" | "working" | "delivered" | "complete";

export const statusConfig: Record<CommissionStatus, { label: string; badgeClass: string }> = {
  received: { label: "대기", badgeClass: "badge-received" },
  working: { label: "작업중", badgeClass: "badge-working" },
  delivered: { label: "전달", badgeClass: "badge-delivered" },
  complete: { label: "완료", badgeClass: "badge-complete" },
};