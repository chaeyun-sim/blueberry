import { toast } from 'sonner';
import { findSongByTitle } from '@/api/score';
import { FileEntry } from '@/types/form';

export async function findOrCreateSong(
	title: string,
	composer: string,
	createSong: (params: { title: string; composer: string }) => Promise<{ id: string }>,
): Promise<string> {
	const existing = await findSongByTitle(title, composer);
	if (existing) return existing.id;
	const newSong = await createSong({ title, composer });
	return newSong.id;
}

export async function uploadAllFiles(
	files: FileEntry[],
	arrangementId: string,
	uploadFile: (params: {
		arrangementId: string;
		file: File;
		label: string;
		fileType: string;
	}) => Promise<unknown>,
): Promise<string[]> {
	const failed: string[] = [];
	for (const entry of files) {
		try {
			await uploadFile({
				arrangementId,
				file: entry.file,
				label: entry.label,
				fileType: entry.fileType,
			});
		} catch (e) {
			toast.error('파일 업로드에 실패했습니다.', { description: (e as Error).message });
			failed.push(entry.label);
		}
	}
	return failed;
}
