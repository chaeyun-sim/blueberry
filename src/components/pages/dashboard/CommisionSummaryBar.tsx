interface CommisionSummaryBarProps {
  status: string;
	value: number;
	maxValue: number;
}

function CommisionSummaryBar({ status, value, maxValue }: CommisionSummaryBarProps) {
  return (
    <div
      className={`bg-[hsl(var(--status-${status}))]`}
      style={{ width: `${(value / maxValue) * 100}%` }}
    />
  );
}

export default CommisionSummaryBar;
