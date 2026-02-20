interface CommissionSummaryBarProps {
  status: string;
	value: number;
	maxValue: number;
}

function CommissionSummaryBar({ status, value, maxValue }: CommissionSummaryBarProps) {
  const percent = maxValue > 0 ? (value / maxValue) * 100 : 0;
  const clamped = Math.min(100, Math.max(0, percent));
  
  return (
    <div
      style={{
        width: `${clamped}%`,
        backgroundColor: `hsl(var(--status-${status}))`
      }}
    />
  );
}

export default CommissionSummaryBar;
