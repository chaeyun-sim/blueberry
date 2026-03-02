import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Autocomplete from '@/components/Autocomplete';
import { useMutation } from '@tanstack/react-query';
import { useAppQuery as useQuery } from '@/hooks/use-app-query';
import { scoreQueries } from '@/api/score/queries';
import { scoreMutations } from '@/api/score/mutations';
import { scoreKeys } from '@/api/score/queryKeys';
import { findSongByTitle } from '@/api/score';
import { toast } from 'sonner';
import { queryClient } from '@/utils/query-client';
import { DifficultyLevelType } from '@/types/commission';
import { FileEntry } from '@/types/form';
import { InstrumentPicker } from '@/components/InstrumentPicker';
import { ZipUploadCard } from '@/components/pages/score/ZipUploadCard';

interface ScoreRegisterFormType {
  songTitle: string;
  composer: string;
  instruments: string[];
  version: string | null;
  zipName: string | null;
  zipSize: number;
  files: FileEntry[];
}

const ScoreRegister = () => {
  const navigate = useNavigate();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState<ScoreRegisterFormType>({
    songTitle: '',
    composer: '',
    instruments: [],
    version: null,
    zipName: null,
    zipSize: 0,
    files: [],
  })

  const { data: songs = [] } = useQuery(scoreQueries.getSongs());

  const songSuggestions = songs.map(s => s.title);
  const composerSuggestions = [...new Set(songs.map(s => s.composer).filter(Boolean))];

  const handleSongSelect = (value: string) => {
    const match = songs.find(s => s.title === value);
    setForm(prev => ({ ...prev, songTitle: value, ...(match ? { composer: match.composer } : {}) }));
  };

  const handleZipUpload = (data: { zipName: string; zipSize: number; files: FileEntry[]; instruments: string[] }) => {
    setForm(prev => ({
      ...prev,
      zipName: data.zipName,
      zipSize: data.zipSize,
      files: data.files,
      ...(data.instruments.length > 0 ? { instruments: data.instruments } : {}),
    }));
  };

  const clearZip = () => {
    setForm(prev => ({ ...prev, zipName: null, zipSize: 0, files: [], instruments: [], songTitle: '', composer: '', version: null }));
  };

  const { mutateAsync: createSong } = useMutation(scoreMutations.createSong());
  const { mutateAsync: createArrangement } = useMutation(scoreMutations.createArrangement());
  const { mutateAsync: uploadFile } = useMutation(scoreMutations.uploadArrangementFile());

  const handleSubmit = async () => {
    if (!form.songTitle.trim()) {
      toast.error('곡명을 입력해주세요.');
      return;
    }
    if (form.instruments.length === 0) {
      toast.error('악기 편성을 입력해주세요.');
      return;
    }
    if (form.files.length === 0) {
      toast.error('악보 파일이 없습니다. ZIP 파일을 먼저 업로드해주세요.');
      return;
    }
    setIsSubmitting(true);
    try {
      let songId: string | undefined;
      try {
        const existing = await findSongByTitle(form.songTitle.trim(), form.composer.trim());
        if (existing) {
          songId = existing.id;
        } else {
          const newSong = await createSong({ title: form.songTitle.trim(), composer: form.composer.trim() });
          songId = newSong.id;
        }
      } catch (e) {
        setIsSubmitting(false);
        toast.error('곡명 검색에 실패했습니다.', { description: (e as Error).message });
        return;
      }

      const newArrangement = await createArrangement({
        song_id: songId,
        arrangement: form.instruments.join(', '),
        version: form.version ?? undefined,
      });

      const failed: string[] = [];
      for (const entry of form.files) {
        try {
          await uploadFile({
            arrangementId: newArrangement.id,
            file: entry.file,
            label: entry.label,
            fileType: entry.fileType,
          });
        } catch {
          failed.push(entry.label);
        }
      }

      if (failed.length > 0) {
        toast.warning(`일부 파일 업로드 실패: ${failed.join(', ')}`);
      }

      queryClient.invalidateQueries({ queryKey: scoreKeys.list() });
      toast.success('악보가 등록되었습니다.');
      clearZip();
    } catch (e) {
      toast.error('악보 등록에 실패했습니다.', { description: (e as Error).message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <div className='mb-6'>
        <Button
          variant='ghost'
          className='gap-2 text-muted-foreground hover:bg-foreground/5'
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className='h-4 w-4' /> 뒤로
        </Button>
      </div>
      <PageHeader
        title='악보 추가'
        description='새로운 악보를 등록합니다'
      />

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <ZipUploadCard
          zipName={form.zipName}
          zipSize={form.zipSize}
          files={form.files}
          isSubmitting={isSubmitting}
          onUpload={handleZipUpload}
          onClear={clearZip}
          onFileLabelChange={(idx, label) =>
            setForm(prev => ({ ...prev, files: prev.files.map((f, i) => i === idx ? { ...f, label } : f) }))
          }
          onFileRemove={idx =>
            setForm(prev => ({ ...prev, files: prev.files.filter((_, i) => i !== idx) }))
          }
        />

        {/* Right: Form */}
        <Card className='border-border/50'>
          <CardContent className='p-5'>
            <h2 className='font-display font-semibold mb-4'>악보 정보</h2>
            <div className='space-y-5'>
              <div className='space-y-2'>
                <Label>곡명</Label>
                <Autocomplete
                  value={form.songTitle}
                  onChange={handleSongSelect}
                  suggestions={songSuggestions}
                  placeholder='곡명을 입력하세요'
                  inputProps={{ disabled: isSubmitting }}
                />
              </div>

              <div className='space-y-2'>
                <Label>작곡가</Label>
                <Autocomplete
                  value={form.composer}
                  onChange={value => setForm(prev => ({ ...prev, composer: value }))}
                  suggestions={composerSuggestions}
                  placeholder='작곡가를 입력하세요'
                  inputProps={{ disabled: isSubmitting }}
                />
              </div>

              {/* Instrument Chips */}
              <InstrumentPicker
                label='악기 구성'
                instruments={form.instruments}
                onChange={instruments => setForm(prev => ({ ...prev, instruments }))}
                disabled={isSubmitting}
              />

              <div className='space-y-2'>
                <Label>버전</Label>
                <Select
                  value={form.version ?? 'normal'}
                  onValueChange={v => setForm(prev => ({ ...prev, version: v === 'normal' ? null : v as DifficultyLevelType }))}
                  disabled={isSubmitting}
                  aria-label='버전 선택'
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='normal'>-</SelectItem>
                    <SelectItem value='easy'>Easy</SelectItem>
                    <SelectItem value='hard'>Hard</SelectItem>
                    <SelectItem value='pro'>Pro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='flex pt-2'>
                <Button
                  className='flex-1'
                  onClick={handleSubmit}
                  disabled={isSubmitting || !form.songTitle.trim()}
                >
                  {isSubmitting ? '등록 중...' : '악보 등록'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default ScoreRegister;
