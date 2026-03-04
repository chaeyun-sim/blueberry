import Label from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from 'lucide-react';
import { DifficultyLevelType } from '@/types/commission';
import { useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useSongField } from '@/hooks/use-song-field';
import { commissionMutations } from '@/api/commission/mutations';
import { scoreMutations } from '@/api/score/mutations';
import { InstrumentPicker } from '@/components/InstrumentPicker';
import { toast } from 'sonner';
import { commissionKeys } from '@/api/commission/queryKeys';
import { CommissionRegisterFormType } from '@/types/form';
import { useNavigate } from 'react-router-dom';
import { queryClient } from '@/utils/query-client';
import { useAuth } from '@/hooks/use-auth';
import RegisterFormComposer from '@/components/register-form-items/RegisterFormComposer';
import RegisterFormLayout from '@/components/register-form-items/RegisterFormLayout';
import RegisterFormVersion from '@/components/register-form-items/RegisterFormVersion';
import RegisterFormSongTitle from '@/components/register-form-items/RegisterFormSongTitle';

interface CommissionRegisterFormProps {
  form: CommissionRegisterFormType;
  setForm: (form: CommissionRegisterFormType) => void;
  imageFile: File | null;
  isAnalyzing: boolean;
}

function CommissionRegisterForm({
  form,
  setForm,
  imageFile,
  isAnalyzing,
}: CommissionRegisterFormProps) {
  const navigate = useNavigate();
  const dateInputRef = useRef<HTMLInputElement>(null);

  const { isGuest } = useAuth();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const startTimeRef = useRef(performance.now());

  const { mutateAsync: createCommission } = useMutation(commissionMutations.createCommission());
  const { mutateAsync: uploadCommissionImage } = useMutation(
    commissionMutations.uploadCommissionImage(),
  );

  const { songSuggestions, composerSuggestions, handleSongSelect } = useSongField(
    (songTitle, composer) => setForm({ ...form, songTitle, composer }),
  );

  const { mutateAsync: createSong } = useMutation(scoreMutations.createSong());
  const { mutateAsync: findSongByTitle } = useMutation(scoreMutations.findSongByTitle());

  const resolveSongId = async (): Promise<string | undefined> => {
    if (!form.songTitle) return undefined;
    const existing = await findSongByTitle({ title: form.songTitle, composer: form.composer });
    if (existing) return existing.id;
    const newSong = await createSong({ title: form.songTitle, composer: form.composer });
    return newSong.id;
  };

  const uploadImage = async (commissionId: string) => {
    if (!imageFile) return;
    try {
      await uploadCommissionImage({ commissionId, file: imageFile });
    } catch {
      toast.error('이미지 업로드에 실패했습니다.', {
        description: '의뢰는 등록되었지만 이미지를 첨부하지 못했습니다.',
      });
    }
  };

  const handleSubmit = async () => {
    if (isGuest) {
      toast.error('게스트 모드에서는 의뢰를 등록할 수 없습니다.');
      return;
    }

    setIsSubmitting(true);
    try {
      const songId = await resolveSongId();
      const res = await createCommission({
        song_id: songId,
        title: songId ? undefined : form.songTitle,
        composer: songId ? undefined : form.composer,
        arrangement: form.instruments.join(', '),
        deadline: form.deadline,
        notes: form.notes,
        version: form.version as DifficultyLevelType,
      });

      await uploadImage(res?.id);
      queryClient.invalidateQueries({ queryKey: commissionKeys.list() });
      const elapsed = ((performance.now() - startTimeRef.current) / 1000).toFixed(2);
      toast.success(`등록 완료 (총 ${elapsed}초)`);
      navigate(`/commissions/${res?.id}`);
    } catch (e) {
      toast.error('의뢰 등록에 실패했습니다.', { description: (e as Error).message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <RegisterFormLayout
      type='commission'
      disabled={isSubmitting || isAnalyzing}
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit}
    >
      <RegisterFormSongTitle
        value={form.songTitle}
        onChange={handleSongSelect}
        suggestions={songSuggestions}
        inputProps={{ readOnly: isAnalyzing || isSubmitting }}
      />

      <RegisterFormComposer
        value={form.composer}
        onChange={value => setForm({ ...form, composer: value })}
        suggestions={composerSuggestions}
        inputProps={{ readOnly: isAnalyzing || isSubmitting }}
      />

      <InstrumentPicker
        instruments={form.instruments}
        onChange={instruments => setForm({ ...form, instruments })}
        disabled={isAnalyzing || isSubmitting}
      />

      <RegisterFormVersion
        value={form.version}
        onChange={version => setForm({ ...form, version })}
        disabled={isAnalyzing || isSubmitting}
      />

      <div className='space-y-2'>
        <Label htmlFor='deadline'>마감일</Label>
        <div className='relative'>
          <Input
            ref={dateInputRef}
            id='deadline'
            type='date'
            className='pr-9 [&::-webkit-calendar-picker-indicator]:hidden'
            value={form.deadline}
            onChange={e => setForm({ ...form, deadline: e.target.value })}
            readOnly={isAnalyzing || isSubmitting}
          />
          <button
            type='button'
            disabled={isAnalyzing || isSubmitting}
            onClick={() => dateInputRef.current?.showPicker()}
            className='absolute right-0 top-0 bottom-0 px-3 flex items-center text-muted-foreground hover:text-foreground transition-colors'
            aria-label='마감일 선택'
          >
            <Calendar className='h-4 w-4' />
          </button>
        </div>
      </div>
      
      <div className='space-y-2'>
        <Label htmlFor='notes'>메모</Label>
        <Textarea
          id='notes'
          placeholder='추가 요청사항이나 메모...'
          rows={4}
          value={form.notes}
          onChange={e => setForm({ ...form, notes: e.target.value })}
          readOnly={isSubmitting}
        />
      </div>
    </RegisterFormLayout>
  );
}

export default CommissionRegisterForm;