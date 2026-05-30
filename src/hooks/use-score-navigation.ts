import { useState } from 'react';
import type { Song } from '@/types/score';

export function useScoreNavigation(songs: Song[], search: string) {
	const [openComposer, setOpenComposer] = useState<string | null>(null);
	const [openSongId, setOpenSongId] = useState<string | null>(null);

	const composerGroups = songs.reduce<Record<string, Song[]>>((acc, song) => {
		const key = song.composer || '(미상)';
		if (!acc[key]) acc[key] = [];
		acc[key].push(song);
		return acc;
	}, {});

	const filteredComposers = Object.entries(composerGroups).filter(
		([composer, composerSongs]) =>
			!search ||
			composer.toLowerCase().includes(search.toLowerCase()) ||
			composerSongs.some((s) => s.title.toLowerCase().includes(search.toLowerCase())),
	);

	const composerSongs = openComposer
		? (composerGroups[openComposer] ?? []).filter(
				(s) => !search || s.title.toLowerCase().includes(search.toLowerCase()),
			)
		: [];

	const openSong = openSongId ? (songs.find((s) => s.id === openSongId) ?? null) : null;

	const filteredArrangements = openSong
		? openSong.arrangements.filter(
				(arr) => !search || arr.arrangement.toLowerCase().includes(search.toLowerCase()),
			)
		: [];

	const breadcrumb: { label: string; id: string | null }[] = [{ label: '전체 악보', id: null }];
	if (openComposer) breadcrumb.push({ label: openComposer, id: 'COMPOSER' });
	if (openSong) breadcrumb.push({ label: openSong.title, id: openSong.id });

	const handleNavigate = (id: string | null, clearSearch: () => void) => {
		if (id === null) {
			setOpenComposer(null);
			setOpenSongId(null);
		} else if (id === 'COMPOSER') {
			setOpenSongId(null);
		}
		clearSearch();
	};

	const placeholder = openSong
		? '편성명 검색...'
		: openComposer
			? '곡명 검색...'
			: '작곡가 또는 곡명 검색...';

	return {
		openComposer,
		setOpenComposer,
		openSongId,
		setOpenSongId,
		openSong,
		composerGroups,
		filteredComposers,
		composerSongs,
		filteredArrangements,
		breadcrumb,
		handleNavigate,
		placeholder,
	};
}
