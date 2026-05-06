import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useAppQuery as useQuery } from '@/hooks/use-app-query';
import { statsQueries } from '@/api/stats/queries';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TrendingSong } from '@/types/stats';

const TOP_N = 2;

function SongRow({ song, rank }: { song: TrendingSong; rank: number }) {
	const isUp = song.growth > 0;
	return (
		<div className='flex items-center gap-3 py-3'>
			<span className='text-xs font-mono text-muted-foreground w-5 shrink-0 text-right'>
				{rank}
			</span>
			<div className='flex-1 min-w-0'>
				<p className='text-sm font-medium truncate'>{song.title}</p>
				<p className='text-xs text-muted-foreground tabular-nums'>
					이전 {song.prevSales}건 → 최근 {song.recentSales}건
				</p>
			</div>
			<div
				className={cn(
					'flex items-center gap-1 text-xs font-semibold tabular-nums shrink-0',
					isUp ? 'text-green-600 dark:text-green-400' : 'text-destructive',
				)}
			>
				{isUp ? <TrendingUp className='h-3 w-3' /> : <TrendingDown className='h-3 w-3' />}
				{isUp ? '+' : ''}{song.growth}%
			</div>
		</div>
	);
}

function TrendingSongs() {
	const { data: songs = [] } = useQuery(statsQueries.getTrendingSongs());

	const rising = songs.filter((s) => s.growth > 0).slice(0, TOP_N);
	const falling = songs.filter((s) => s.growth < 0).slice(-TOP_N).reverse();

	const isEmpty = rising.length === 0 && falling.length === 0;

	return (
		<Card className='border-border/50'>
			<CardHeader className='pb-2'>
				<CardTitle className='text-base font-display flex items-center gap-2'>
					<TrendingUp className='h-4 w-4 text-green-500' />
					요즘 뜨는 곡
				</CardTitle>
				<p className='text-xs text-muted-foreground'>
					최근 3개월 vs 직전 3개월 판매 변화
				</p>
			</CardHeader>
			<CardContent>
				{isEmpty ? (
					<p className='text-sm text-muted-foreground py-6 text-center'>
						비교할 데이터가 충분하지 않습니다 (최소 6개월 필요)
					</p>
				) : (
					<div className='divide-y divide-border/40'>
						{[...rising, ...falling].map((song, i) => (
							<SongRow key={song.title} song={song} rank={i + 1} />
						))}
					</div>
				)}
			</CardContent>
		</Card>
	);
}

export default TrendingSongs;
