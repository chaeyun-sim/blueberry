import { Loader2, Wand2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import Button from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import Label from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { analyzeMusicMeta, downloadFilledTemplate, translateToEnglish, type TemplateParams } from '@/utils/mxl-template';

const KEY_OPTIONS = [
  { value: '0:major',  label: 'C major' },
  { value: '1:major',  label: 'G major' },
  { value: '2:major',  label: 'D major' },
  { value: '3:major',  label: 'A major' },
  { value: '4:major',  label: 'E major' },
  { value: '5:major',  label: 'B major' },
  { value: '6:major',  label: 'F# / Gb major' },
  { value: '-1:major', label: 'F major' },
  { value: '-2:major', label: 'Bb major' },
  { value: '-3:major', label: 'Eb major' },
  { value: '-4:major', label: 'Ab major' },
  { value: '-5:major', label: 'Db major' },
  { value: '-6:major', label: 'Gb major' },
  { value: '0:minor',  label: 'A minor' },
  { value: '1:minor',  label: 'E minor' },
  { value: '2:minor',  label: 'B minor' },
  { value: '3:minor',  label: 'F# minor' },
  { value: '4:minor',  label: 'C# minor' },
  { value: '5:minor',  label: 'G# minor' },
  { value: '-1:minor', label: 'D minor' },
  { value: '-2:minor', label: 'G minor' },
  { value: '-3:minor', label: 'C minor' },
  { value: '-4:minor', label: 'F minor' },
  { value: '-5:minor', label: 'Bb minor' },
  { value: '-6:minor', label: 'Eb minor' },
];

const TIME_OPTIONS = [
  { value: '4:4', label: '4/4' },
  { value: '3:4', label: '3/4' },
  { value: '2:4', label: '2/4' },
  { value: '2:2', label: '2/2' },
  { value: '6:8', label: '6/8' },
  { value: '9:8', label: '9/8' },
  { value: '12:8', label: '12/8' },
  { value: '3:8', label: '3/8' },
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTitle: string;
  defaultSubtitle?: string;
  defaultComposer: string;
  arrangement: string;
}

export function TemplateDownloadDialog({
  open,
  onOpenChange,
  defaultTitle,
  defaultSubtitle,
  defaultComposer,
  arrangement,
}: Props) {
  const [title, setTitle] = useState(defaultTitle);
  const [subtitle, setSubtitle] = useState(defaultSubtitle ?? '');
  const [composer, setComposer] = useState(defaultComposer);
  const [keyValue, setKeyValue] = useState('');
  const [timeValue, setTimeValue] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [translating, setTranslating] = useState<'title' | 'subtitle' | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  // defaultTitle이 바뀌면 (dialog가 다시 열리면) 필드 초기화
  const handleOpenChange = (v: boolean) => {
    if (v) {
      setTitle(defaultTitle);
      setSubtitle(defaultSubtitle ?? '');
      setComposer(defaultComposer);
    }
    onOpenChange(v);
  };

  const handleTranslate = async (field: 'title' | 'subtitle') => {
    const text = field === 'title' ? title : subtitle;
    if (!text.trim()) return;
    setTranslating(field);
    try {
      const translated = await translateToEnglish(text);
      if (field === 'title') setTitle(translated);
      else setSubtitle(translated);
    } catch (err) {
      toast.error('번역 실패', { description: err instanceof Error ? err.message : undefined });
    } finally {
      setTranslating(null);
    }
  };

  const handleAnalyze = async () => {
    if (!title.trim() && !composer.trim()) return;
    setAnalyzing(true);
    try {
      const result = await analyzeMusicMeta(title.trim(), composer.trim(), subtitle.trim() || undefined);
      setKeyValue(`${result.keyFifths}:${result.keyMode}`);
      setTimeValue(`${result.timeBeats}:${result.timeBeatType}`);
    } catch (err) {
      toast.error('분석 실패', { description: err instanceof Error ? err.message : undefined });
    } finally {
      setAnalyzing(false);
    }
  };

  const handleDownload = async () => {
    if (!title.trim()) return;
    setDownloading(true);
    try {
      const params: TemplateParams = {
        title: title.trim(),
        subtitle: subtitle.trim() || undefined,
        composer: composer.trim(),
        arrangement,
      };
      if (keyValue) {
        const [fifthsStr, mode] = keyValue.split(':');
        params.keyFifths = parseInt(fifthsStr, 10);
        params.keyMode = mode as 'major' | 'minor';
      }
      if (timeValue) {
        const [beats, beatType] = timeValue.split(':');
        params.timeBeats = parseInt(beats, 10);
        params.timeBeatType = parseInt(beatType, 10);
      }
      await downloadFilledTemplate(params);
      onOpenChange(false);
    } catch (err) {
      toast.error('다운로드 실패', { description: err instanceof Error ? err.message : undefined });
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={handleOpenChange}
    >
      <DialogContent className='max-w-sm'>
        <DialogHeader>
          <DialogTitle>템플릿 다운로드</DialogTitle>
        </DialogHeader>

        <div className='space-y-4 py-1'>
          {/* 제목 */}
          <div className='space-y-1.5'>
            <Label htmlFor='tmpl-title'>제목</Label>
            <div className='flex gap-2'>
              <Input
                id='tmpl-title'
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder='Work title (English)'
              />
              <Button
                type='button'
                variant='outline'
                size='icon'
                className='shrink-0'
                disabled={translating !== null}
                onClick={() => handleTranslate('title')}
                title='AI로 영어 번역'
              >
                {translating === 'title' ? (
                  <Loader2 className='h-4 w-4 animate-spin' />
                ) : (
                  <Wand2 className='h-4 w-4' />
                )}
              </Button>
            </div>
          </div>

          {/* 서브타이틀 */}
          <div className='space-y-1.5'>
            <Label htmlFor='tmpl-subtitle'>서브타이틀 (악장 / 특정 곡)</Label>
            <div className='flex gap-2'>
              <Input
                id='tmpl-subtitle'
                value={subtitle}
                onChange={e => setSubtitle(e.target.value)}
                placeholder='예: The Aviary (선택)'
              />
              <Button
                type='button'
                variant='outline'
                size='icon'
                className='shrink-0'
                disabled={translating !== null || !subtitle.trim()}
                onClick={() => handleTranslate('subtitle')}
                title='AI로 영어 번역'
              >
                {translating === 'subtitle' ? (
                  <Loader2 className='h-4 w-4 animate-spin' />
                ) : (
                  <Wand2 className='h-4 w-4' />
                )}
              </Button>
            </div>
          </div>

          {/* 작곡가 */}
          <div className='space-y-1.5'>
            <Label htmlFor='tmpl-composer'>작곡가</Label>
            <Input
              id='tmpl-composer'
              value={composer}
              onChange={e => setComposer(e.target.value)}
              placeholder='Composer'
            />
          </div>

          {/* 조성 / 박자 */}
          <div className='flex items-center justify-between'>
            <span className='text-sm font-medium'>조성 / 박자</span>
            <Button
              type='button'
              variant='outline'
              size='sm'
              className='h-7 gap-1.5 text-xs'
              disabled={analyzing || (!title.trim() && !composer.trim())}
              onClick={handleAnalyze}
            >
              {analyzing ? (
                <Loader2 className='h-3 w-3 animate-spin' />
              ) : (
                <Wand2 className='h-3 w-3' />
              )}
              AI 자동 분석
            </Button>
          </div>
          <div className='grid grid-cols-2 gap-3'>
            <div className='space-y-1.5'>
              <Label>조성</Label>
              <Select
                value={keyValue}
                onValueChange={setKeyValue}
              >
                <SelectTrigger>
                  <SelectValue placeholder='— 템플릿 유지' />
                </SelectTrigger>
                <SelectContent>
                  {KEY_OPTIONS.map(opt => (
                    <SelectItem
                      key={opt.value}
                      value={opt.value}
                    >
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className='space-y-1.5'>
              <Label>박자</Label>
              <Select
                value={timeValue}
                onValueChange={setTimeValue}
              >
                <SelectTrigger>
                  <SelectValue placeholder='— 템플릿 유지' />
                </SelectTrigger>
                <SelectContent>
                  {TIME_OPTIONS.map(opt => (
                    <SelectItem
                      key={opt.value}
                      value={opt.value}
                    >
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={handleDownload}
            disabled={downloading || !title.trim()}
            className='w-full'
          >
            {downloading ? <Loader2 className='h-4 w-4 animate-spin mr-2' /> : null}
            다운로드
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
