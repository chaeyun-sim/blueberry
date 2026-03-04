import { Card, CardContent } from '@/components/ui/card';
import Label from '@/components/ui/label';
import Autocomplete from '@/components/Autocomplete';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from 'lucide-react';
import { DifficultyLevelType } from '@/types/commission';
import Button from '@/components/ui/button';
import { useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useAppQuery as useQuery } from '@/hooks/use-app-query';
import { scoreQueries } from '@/api/score/queries';
import { commissionMutations } from '@/api/commission/mutations';
import { scoreMutations } from '@/api/score/mutations';
import { InstrumentPicker } from '@/components/InstrumentPicker';
import { toast } from 'sonner';
import { commissionKeys } from '@/api/commission/queryKeys';
import { CommissionRegisterFormType } from '@/types/form';
import { useNavigate } from 'react-router-dom';
import { queryClient } from '@/utils/query-client';
import { useAuth } from '@/hooks/use-auth';

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

  const { data: songs = [] } = useQuery(scoreQueries.getSongs());
  const { mutateAsync: createCommission } = useMutation(commissionMutations.createCommission());
  const { mutateAsync: uploadCommissionImage } = useMutation(
    commissionMutations.uploadCommissionImage(),
  );

  const songSuggestions = songs.map(s => s.title);
  const composerSuggestions = [...new Set(songs.map(s => s.composer).filter(Boolean))] as string[];

  const handleSongSelect = (value: string) => {
    const match = songs.find(s => s.title === value);
    setForm({ ...form, songTitle: value, ...(match ? { composer: match.composer } : {}) });
  };

  const { mutateAsync: createSong } = useMutation(scoreMutations.createSong());
  const { mutateAsync: findSongByTitle } = useMutation(scoreMutations.findSongByTitle());

  const handleSubmit = async () => {
    if (isGuest) {
      toast.error('게스트 모드에서는 의뢰를 등록할 수 없습니다.');
      return;
    }

    setIsSubmitting(true);
    try {
      let songId: string | undefined;

      if (form.songTitle) {
        const existing = await findSongByTitle({ title: form.songTitle, composer: form.composer });
        if (existing) {
          songId = existing.id;
        } else {
          const newSong = await createSong({ title: form.songTitle, composer: form.composer });
          songId = newSong.id;
        }
      }

      const res = await createCommission({
        song_id: songId,
        title: songId ? undefined : form.songTitle,
        composer: songId ? undefined : form.composer,
        arrangement: form.instruments.join(', '),
        deadline: form.deadline,
        notes: form.notes,
        version: form.version as DifficultyLevelType,
      });

      if (imageFile) {
        try {
          await uploadCommissionImage({ commissionId: res?.id, file: imageFile });
        } catch {
          toast.error('이미지 업로드에 실패했습니다.', {
            description: '의뢰는 등록되었지만 이미지를 첨부하지 못했습니다.',
          });
        }
      }

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
    <Card className='border-border/50'>
      <CardContent className='p-5'>
        <h2 className='font-display font-semibold mb-4'>의뢰 정보</h2>
        <div className='space-y-5'>
          <div className='space-y-2'>
            <Label>곡명</Label>
            <Autocomplete
              value={form.songTitle}
              onChange={handleSongSelect}
              suggestions={songSuggestions}
              inputProps={{ readOnly: isAnalyzing || isSubmitting }}
            />
          </div>

          <div className='space-y-2'>
            <Label>작곡가</Label>
            <Autocomplete
              value={form.composer}
              onChange={value => setForm({ ...form, composer: value })}
              placeholder='작곡가를 입력하세요'
              suggestions={composerSuggestions}
              inputProps={{ readOnly: isAnalyzing || isSubmitting }}
            />
          </div>

          <InstrumentPicker
            instruments={form.instruments}
            onChange={instruments => setForm({ ...form, instruments })}
            disabled={isAnalyzing || isSubmitting}
          />

          <div className='space-y-2'>
            <Label htmlFor='version'>버전</Label>
            <Select
              value={form.version ?? 'normal'}
              onValueChange={value =>
                setForm({
                  ...form,
                  version: value === 'normal' ? null : (value as DifficultyLevelType),
                })
              }
              disabled={isAnalyzing || isSubmitting}
            >
              <SelectTrigger aria-label='버전 선택'>
                <SelectValue placeholder='버전을 선택하세요' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='normal'>-</SelectItem>
                <SelectItem value='easy'>Easy</SelectItem>
                <SelectItem value='hard'>Hard</SelectItem>
                <SelectItem value='pro'>Pro</SelectItem>
              </SelectContent>
            </Select>
          </div>

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
          <div className='flex pt-2'>
            <Button
              className='flex-1'
              disabled={isSubmitting || isAnalyzing}
              onClick={handleSubmit}
            >
              {isSubmitting ? '등록 중...' : '의뢰 등록'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default CommissionRegisterForm;
