import { useMutation } from '@tanstack/react-query';
import { Dispatch, SetStateAction } from 'react';
import { toast } from 'sonner';

import { InstrumentPicker } from '@/components/InstrumentPicker';
import RegisterFormComposer from '@/components/register-form-items/RegisterFormComposer';
import RegisterFormLayout from '@/components/register-form-items/RegisterFormLayout';
import RegisterFormSongTitle from '@/components/register-form-items/RegisterFormSongTitle';
import RegisterFormVersion from '@/components/register-form-items/RegisterFormVersion';
import { DifficultyLevelType } from '@/features/commission/types';
import { findSongByTitle,scoreKeys, scoreMutations } from '@/features/score/api';
import { useSongField } from '@/hooks/use-song-field';
import { ScoreRegisterFormType } from '@/pages/ScoreRegister';
import { queryClient } from '@/utils/query-client';

interface ScoreRegisterFormProps {
  form: ScoreRegisterFormType;
  setForm: Dispatch<SetStateAction<ScoreRegisterFormType>>;
  isSubmitting: boolean;
  setIsSubmitting: (isSubmitting: boolean) => void;
  clearZip: () => void;
}

export function ScoreRegisterForm({
  form,
  setForm,
  isSubmitting,
  setIsSubmitting,
  clearZip,
}: ScoreRegisterFormProps) {
  const { mutateAsync: createSong } = useMutation(scoreMutations.createSong());
  const { mutateAsync: createArrangement } = useMutation(scoreMutations.createArrangement());
  const { mutateAsync: uploadFile } = useMutation(scoreMutations.uploadArrangementFile());

  const { songSuggestions, composerSuggestions, handleSongSelect } = useSongField(
    (songTitle, composer) =>
      setForm(prev => ({
        ...prev,
        songTitle,
        composer: composer ?? prev.composer ?? '',
      })),
  );

  const validate = (): boolean => {
    if (!form.songTitle.trim()) { toast.error('곡명을 입력해주세요.'); return false; }
    if (form.instruments.length === 0) { toast.error('악기 편성을 입력해주세요.'); return false; }
    if (form.files.length === 0) { toast.error('악보 파일이 없습니다. ZIP 파일을 먼저 업로드해주세요.'); return false; }
    return true;
  };

  const resolveSongId = async (): Promise<string> => {
    const existing = await findSongByTitle(form.songTitle.trim(), form.composer.trim());
    if (existing) return existing.id;
    const newSong = await createSong({ title: form.songTitle.trim(), composer: form.composer.trim() });
    return newSong.id;
  };

  const uploadFiles = async (arrangementId: string): Promise<string[]> => {
    const failed: string[] = [];
    for (const entry of form.files) {
      try {
        await uploadFile({ arrangementId, file: entry.file, label: entry.label, fileType: entry.fileType });
      } catch {
        failed.push(entry.label);
      }
    }
    return failed;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const songId = await resolveSongId();
      const newArrangement = await createArrangement({
        song_id: songId,
        arrangement: form.instruments.join(', '),
        version: form.version || undefined,
      });

      const failed = await uploadFiles(newArrangement.id);
      queryClient.invalidateQueries({ queryKey: scoreKeys.list() });
      queryClient.invalidateQueries({ queryKey: scoreKeys.summary() });
      if (failed.length === 0) {
        toast.success('악보가 등록되었습니다.');
        clearZip();
      } else {
        toast.warning(`일부 파일 업로드 실패: ${failed.join(', ')}`);
      }
    } catch (e) {
      toast.error('악보 등록에 실패했습니다.', { description: (e as Error).message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <RegisterFormLayout
      type='score'
      disabled={isSubmitting || !form.songTitle.trim()}
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit}
    >
			<RegisterFormSongTitle
				value={form.songTitle}
				onChange={handleSongSelect}
				suggestions={songSuggestions as string[]}
				inputProps={{ readOnly: isSubmitting }}
			/>

      <RegisterFormComposer
        value={form.composer}
        onChange={value => setForm({ ...form, composer: value })}
        suggestions={composerSuggestions}
        inputProps={{ readOnly: isSubmitting }}
      />

      <InstrumentPicker
        instruments={form.instruments}
        onChange={instruments => setForm({ ...form, instruments })}
        disabled={isSubmitting}
			/>
			
			<RegisterFormVersion
        value={form.version as DifficultyLevelType}
        onChange={version => setForm({ ...form, version })}
        disabled={isSubmitting}
      />
    </RegisterFormLayout>
  );
}