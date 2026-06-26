import { useMutation } from '@tanstack/react-query';
import { AnimatePresence,motion } from 'framer-motion';
import { AlertCircle,Music, PlusCircle, Search } from 'lucide-react';
import { overlay } from 'overlay-kit';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import Breadcrumb from '@/components/pages/scores/BreadCrumb';
import DeleteSongDialog from '@/components/pages/scores/DeleteSongDialog';
import FolderRow from '@/components/pages/scores/FolderRow';
import { ScoreArrangementTable } from '@/components/pages/scores/ScoreArrangementTable';
import Button from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { scoreKeys,scoreMutations, scoreQueries } from '@/features/score/api';
import { useAppQuery as useQuery } from '@/hooks/use-app-query';
import { queryClient } from '@/utils/query-client';

const ScoreList = () => {
	const navigate = useNavigate();
	const [search, setSearch] = useState('');
	const [openFolderId, setOpenFolderId] = useState<string | null>(null);

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

	if (isLoading && !songs.length) {
		return (
			<AppLayout>
				<PageHeader
					title='악보 관리'
					description='보유 중인 악보와 편성 버전을 관리합니다'
				/>
				<div className='space-y-4' role='status'>
					{[0, 1, 2, 3].map((i) => (
						<div key={i} className='h-12 rounded-lg bg-muted animate-pulse' />
					))}
				</div>
			</AppLayout>
		);
	}

	if (isError) {
		return (
			<AppLayout>
				<PageHeader
					title='악보 관리'
					description='보유 중인 악보와 편성 버전을 관리합니다'
				/>
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
			</AppLayout>
		);
	}

	const filteredSongs = songs.filter((song) =>
		song.title.toLowerCase().includes(search.toLowerCase()),
	);

	const openFolder = openFolderId
		? songs.find((s) => s.id === openFolderId && s.arrangements.length > 0)
		: null;

	const breadcrumb: { label: string; id: string | null }[] = [
		{ label: '전체 악보', id: null },
	];

	if (openFolder) {
		breadcrumb.push({ label: openFolder.title, id: openFolder.id });
	}

	return (
		<AppLayout>
			<PageHeader
				title='악보 관리'
				description='보유 중인 악보와 편성 버전을 관리합니다'
			>
				<Button className='gap-2' onClick={() => navigate('/scores/new')}>
					<PlusCircle className='h-4 w-4' />
					악보 추가
				</Button>
			</PageHeader>

			{/* Toolbar */}
			<div className='flex items-center gap-3 mb-6'>
				<div className='relative flex-1 max-w-sm'>
					<Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
					<Input
						placeholder='곡명 검색...'
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						className='pl-9'
						aria-label='곡명 검색'
					/>
				</div>
			</div>

			{/* Breadcrumb */}
			<Breadcrumb path={breadcrumb} onNavigate={(id) => setOpenFolderId(id)} />

			{/* Content */}
			<Card className='border-border/50'>
				<CardContent className='p-5'>
					<AnimatePresence mode='wait'>
						{!openFolder ? (
							<motion.div
								key='list-folders'
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								className='flex flex-col gap-0.5'
							>
								{filteredSongs.map((song) => (
									<FolderRow
										key={song.id}
										label={song.title}
										count={song.arrangements.length}
										onClick={() => setOpenFolderId(song.id)}
										onDelete={() => {
											if (song.arrangements.length > 0) {
												overlay.open((overlayProps) => (
													<DeleteSongDialog
														{...overlayProps}
														songTitle={song.title}
														arrangementCount={song.arrangements.length}
														onConfirm={() => deleteSong({ id: song.id })}
													/>
												));
											} else {
												deleteSong({ id: song.id });
											}
										}}
									/>
								))}
							</motion.div>
						) : (
							/* ── Inside folder: Table ── */
							<motion.div
								key='table-files'
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
							>
								<ScoreArrangementTable
									songId={openFolder.id}
									arrangements={openFolder.arrangements}
								/>
							</motion.div>
						)}
					</AnimatePresence>

					{/* Empty state */}
					{!openFolder && filteredSongs.length === 0 && (
						<div className='flex flex-col items-center justify-center py-16 text-muted-foreground'>
							<Music className='h-12 w-12 mb-3 opacity-40' />
							<p className='text-sm'>검색 결과가 없습니다</p>
						</div>
					)}
				</CardContent>
			</Card>
		</AppLayout>
	);
};

export default ScoreList;
