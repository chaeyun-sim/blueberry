import { mockTopSongs } from '@/mock/sales';

interface TopSongBarProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
	index?: number;
	song: typeof mockTopSongs[number];
}

function TopSongBar(props: TopSongBarProps) {
  const { x = 0, y = 0, width = 0, height = 0, index = 0 } = props;
  const r = 6;
  const path = `M ${x},${y} L ${x + width - r},${y} Q ${x + width},${y} ${x + width},${y + r} L ${x + width},${y + height - r} Q ${x + width},${y + height} ${x + width - r},${y + height} L ${x},${y + height} Z`;
  return (
    <g>
      <text
        x={x}
        y={y - 5}
        fontSize={12}
        dominantBaseline='auto'
        textAnchor='start'
      >
        <tspan fill='hsl(var(--foreground))'>{props.song.title} </tspan>
        <tspan
          fill='hsl(var(--primary))'
          fontWeight='700'
        >
          ({props.song.sales})
        </tspan>
      </text>
      <path
        d={path}
        fill='hsl(var(--primary))'
      />
    </g>
  );
}

export default TopSongBar;