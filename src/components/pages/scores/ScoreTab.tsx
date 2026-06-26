import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useMutation } from '@tanstack/react-query';
import { AnimatePresence,motion } from 'framer-motion';
import {
	AlertCircle,
	ChevronRight,
	FileMusic,
	Music,
	Search,
	X,
} from 'lucide-react';
import { toast } from 'sonner';

import Button from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { scoreKeys,scoreMutations, scoreQueries } from '@/features/score/api';
import { useScoreNavigation } from '@/features/score/hooks';
import { useAppQuery as useQuery } from '@/hooks/use-app-query';
import { queryClient } from '@/utils/query-client';

import Breadcrumb from './BreadCrumb';
import FolderRow from './FolderRow';

function ScoreTab() {
	const [search, setSearch] = useState('');
	const navigate = useNavigate();

	const {
		data: songs = [],
		isLoading,
		isError,
		refetch,
	} = useQuery(scoreQueries.getSongs());
	const { mutate: deleteSong } = useMutation({
		...scoreMutations.deleteSong(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: scoreKeys.list() });
			queryClient.invalidateQueries({ queryKey: scoreKeys.summary() });
		},
		onError: (e: Error) =>
			toast.error('악보 삭제에 실패했습니다.', { description: e.message }),
	});

	const {
		openComposer,
		openSong,
		filteredComposers,
		composerSongs,
		filteredArrangements,
		breadcrumb,
		selectComposer,
		selectSong,
		handleNavigate,
		placeholder,
	} = useScoreNavigation(songs, search);

	if (isLoading && !songs.length) {
		return (
			<div className='space-y-4'>
				{[0, 1, 2, 3].map((i) => (
					<div key={i} className='h-12 rounded-lg bg-muted animate-pulse' />
				))}
			</div>
		);
	}

	if (isError) {
		return (
			<Card className='border-destructive/50'>
				<CardContent className='p-6'>
					<div className='flex items-center gap-4'>
						<AlertCircle className='h-8 w-8 text-destructive flex-shrink-0' />
						<div className='flex-1'>
							<p className='font-medium text-destructive'>
								악보 목록을 불러올 수 없습니다
							</p>
							<p className='text-sm text-muted-foreground mt-1'>
								잠시 후 다시 시도해주세요.
							</p>
						</div>
						<Button onClick={() => refetch()}>다시 시도</Button>
					</div>
				</CardContent>
			</Card>
		);
	}


	return (
		<div className='space-y-4'>
			<div className='relative max-w-sm'>
				<Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none' />
				<Input
					placeholder={placeholder}
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					className='pl-9 pr-9'
				/>
				{search && (
					<button
						type='button'
						onClick={() => setSearch('')}
						className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors'
						aria-label='검색어 지우기'
					>
						<X className='h-3.5 w-3.5' />
					</button>
				)}
			</div>

			<Breadcrumb path={breadcrumb} onNavigate={(id) => handleNavigate(id, () => setSearch(''))} />

			<Card className='border-border/50'>
				<CardContent className='p-2 md:p-5'>
					<AnimatePresence mode='wait'>
						{!openComposer && (
							<motion.div
								key='list-composers'
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								className='flex flex-col gap-0.5'
							>
								{filteredComposers.map(([composer, composerSongs]) => (
									<FolderRow
										key={composer}
										label={composer}
										count={composerSongs.length}
										onClick={() => selectComposer(composer, () => setSearch(''))}
									/>
								))}
								{filteredComposers.length === 0 && (
									<div className='flex flex-col items-center justify-center py-16 text-muted-foreground'>
										<Music className='h-10 w-10 mb-3 opacity-30' />
										<p className='text-sm font-medium'>
											{search ? '검색 결과가 없습니다' : '등록된 악보가 없습니다'}
										</p>
										{search && (
											<p className='text-xs mt-1 opacity-60'>다른 검색어를 입력해보세요</p>
										)}
									</div>
								)}
							</motion.div>
						)}

						{openComposer && !openSong && (
							<motion.div
								key={`list-songs-${openComposer}`}
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								className='flex flex-col gap-0.5'
							>
								{composerSongs.map((song) => (
									<FolderRow
										key={song.id}
										label={song.title}
										count={song.arrangements.length}
										onClick={() => selectSong(song.id, () => setSearch(''))}
										onDelete={
											song.arrangements.length === 0
												? () => deleteSong({ id: song.id })
												: undefined
										}
									/>
								))}
								{composerSongs.length === 0 && (
									<div className='flex flex-col items-center justify-center py-16 text-muted-foreground'>
										<Music className='h-10 w-10 mb-3 opacity-30' />
										<p className='text-sm font-medium'>검색 결과가 없습니다</p>
										{search && (
											<p className='text-xs mt-1 opacity-60'>다른 검색어를 입력해보세요</p>
										)}
									</div>
								)}
							</motion.div>
						)}

						{openSong && (
							<motion.div
								key={`table-files-${openSong.id}`}
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
							>
								<Table>
									<TableBody>
										{filteredArrangements.map((arr) => (
											<TableRow
												key={arr.id}
												className='cursor-pointer hover:bg-muted/40 group'
												onClick={() =>
													navigate(`/scores/${openSong.id}/arrangements/${arr.id}`)
												}
											>
												<TableCell className='font-medium flex items-center gap-2.5 text-left'>
													<FileMusic className='h-4 w-4 text-muted-foreground/50 shrink-0' />
													{arr.arrangement.split(',').length >= 10
														? 'Orchestra'
														: arr.arrangement}
												</TableCell>
												<TableCell className='text-right pr-3'>
													<ChevronRight className='h-4 w-4 text-muted-foreground/30 group-hover:text-muted-foreground ml-auto transition-colors' />
												</TableCell>
											</TableRow>
										))}
										{filteredArrangements.length === 0 && (
											<tr>
												<td colSpan={3}>
													<div className='flex flex-col items-center justify-center py-14 text-muted-foreground'>
														<FileMusic className='h-10 w-10 mb-3 opacity-30' />
														<p className='text-sm font-medium'>검색 결과가 없습니다</p>
														{search && (
															<p className='text-xs mt-1 opacity-60'>
																다른 검색어를 입력해보세요
															</p>
														)}
													</div>
												</td>
											</tr>
										)}
									</TableBody>
								</Table>
							</motion.div>
						)}
					</AnimatePresence>
				</CardContent>
			</Card>
		</div>
	);
}

export default ScoreTab;
