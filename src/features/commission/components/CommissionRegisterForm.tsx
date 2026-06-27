import { useMutation, useQuery } from '@tanstack/react-query';
import { Calendar } from 'lucide-react';
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { InstrumentPicker } from '@/components/InstrumentPicker';
import RegisterFormComposer from '@/components/register-form-items/RegisterFormComposer';
import RegisterFormLayout from '@/components/register-form-items/RegisterFormLayout';
import RegisterFormSongTitle from '@/components/register-form-items/RegisterFormSongTitle';
import RegisterFormVersion from '@/components/register-form-items/RegisterFormVersion';
import { Input } from '@/components/ui/input';
import Label from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { commissionKeys, commissionMutations, commissionQueries } from '@/features/commission/api';
import { findSongByTitle } from '@/features/score/api';
import { useSongField } from '@/features/score/hooks';
import { CommissionRegisterFormType } from '@/types/form';
import { queryClient } from '@/utils/query-client';
import { DifficultyLevelType } from '../types';

interface CommissionRegisterFormProps {
  form: CommissionRegisterFormType;
  setForm: (form: CommissionRegisterFormType) => void;
  imageFile: File | null;
  isAnalyzing: boolean;
}

export function CommissionRegisterForm({
  form,
  setForm,
  imageFile,
  isAnalyzing,
}: CommissionRegisterFormProps) {
  const navigate = useNavigate();
  const dateInputRef = useRef<HTMLInputElement>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const { mutateAsync: createCommission } = useMutation(commissionMutations.createCommission());
  const { mutateAsync: uploadCommissionImage } = useMutation(
    commissionMutations.uploadCommissionImage(),
  );
  const { data: categories = [] } = useQuery(commissionQueries.getCategories());

  const { songSuggestions, composerSuggestions, handleSongSelect } = useSongField(
    (songTitle, composer) =>
      setForm({
        ...form,
        songTitle,
        composer: composer ?? (songTitle ? form.composer : ''),
      }),
  );

  // 의뢰 등록 시에는 기존 곡 연결만 허용 — 새 곡 생성은 CompleteDialog에서만
  const resolveSongId = async (): Promise<string | undefined> => {
    if (!form.songTitle) return undefined;
    const existing = await findSongByTitle(form.songTitle, form.composer);
    return existing?.id;
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
        category_id: form.categoryId ?? undefined,
      });

      await uploadImage(res?.id);
      queryClient.invalidateQueries({ queryKey: commissionKeys.list() });
      toast.success('의뢰가 등록되었습니다.');
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
        suggestions={songSuggestions as string[]}
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
            className='absolute right-0 top-0 bottom-0 px-3 flex items-center cursor-pointer text-muted-foreground hover:text-foreground transition-colors'
            aria-label='마감일 선택'
          >
            <Calendar className='h-4 w-4' />
          </button>
        </div>
      </div>

      {categories.length > 0 && (
        <div className='space-y-2'>
          <Label>카테고리</Label>
          <Select
            value={form.categoryId ?? 'none'}
            onValueChange={(value) => setForm({ ...form, categoryId: value === 'none' ? null : value })}
            disabled={isAnalyzing || isSubmitting}
          >
            <SelectTrigger>
              <SelectValue placeholder='카테고리 선택 (선택사항)' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='none'>-</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

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
