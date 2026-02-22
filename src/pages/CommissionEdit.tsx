import { useRef, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { ArrowLeft, Calendar, Plus, Undo2, X } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { mockCommissionDetail, mockCommissions } from '@/mock/commission';
import { toast } from '@/hooks/use-toast';
import { ALL_INSTRUMENTS } from '@/constants/instruments';
import { COMMISSION_STATUS_TRANSLATE } from '@/constants/translate';
import { CommissionStatus } from '@/components/StatusBadge';
import { commissionQueries } from '@/api/commission/queries';
import { useQuery } from '@tanstack/react-query';

interface EditForm {
  instruments: string[];
  version: string;
  deadline: string;
  notes: string;
}

const CommissionEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dateInputRef = useRef<HTMLInputElement>(null);

  const { data: commission } = useQuery(commissionQueries.getCommission(id))

  const [form, setForm] = useState<EditForm>({
    instruments: commission?.arrangement ? commission.arrangement.split(', ') : [],
    version: commission?.version ?? '',
    deadline: commission?.deadline ?? '',
    notes: commission?.notes ?? '',
  });

  const commissionStatuses = Object.keys(COMMISSION_STATUS_TRANSLATE) as CommissionStatus[];
  const currentStatusIndex = commissionStatuses.findIndex(s => s === commission?.status);
  const prevStatus = currentStatusIndex > 0 ? commissionStatuses[currentStatusIndex - 1] : null;
  const prevStatusLabel = prevStatus ? COMMISSION_STATUS_TRANSLATE[prevStatus] : null;

  const [instrumentInput, setInstrumentInput] = useState('');
  const [showInstrumentDropdown, setShowInstrumentDropdown] = useState(false);

  const filteredOptions = ALL_INSTRUMENTS.filter(opt =>
    opt.toLowerCase().includes(instrumentInput.toLowerCase()),
  );

  const handleAddInstrument = (name: string) => {
    const sameBase = form.instruments.filter(i => i.startsWith(name));
    if (sameBase.length === 0) {
      setForm(prev => ({ ...prev, instruments: [...prev.instruments, name] }));
    } else if (sameBase.length === 1 && !sameBase[0].includes(' ')) {
      setForm(prev => ({
        ...prev,
        instruments: [...prev.instruments.map(i => (i === name ? `${name} I` : i)), `${name} II`],
      }));
    } else {
      const roman = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];
      setForm(prev => ({
        ...prev,
        instruments: [...prev.instruments, `${name} ${roman[sameBase.length] || sameBase.length + 1}`],
      }));
    }
    setInstrumentInput('');
    setShowInstrumentDropdown(false);
  };

  const removeInstrument = (index: number) => {
    const removed = form.instruments[index];
    const baseName = removed.replace(/ (I{1,3}V?|IV|V|VI{0,3})$/, '');
    const remaining = form.instruments.filter((_, i) => i !== index);
    const sameBase = remaining.filter(i => i.startsWith(baseName));
    if (sameBase.length === 1 && sameBase[0].includes(' ')) {
      setForm(prev => ({
        ...prev,
        instruments: remaining.map(i => (i.startsWith(baseName) ? baseName : i)),
      }));
    } else {
      setForm(prev => ({ ...prev, instruments: remaining }));
    }
  };

  const handleSave = () => {
    // TODO: 수정 API 연동
    toast({ title: '의뢰가 수정되었습니다.' });
    navigate(-1);
  };

  const handleStatusCancel = () => {
    // TODO: 상태 취소 API 연동
    toast({ title: '상태가 취소되었습니다.' });
    navigate(`/commissions/${id}`);
  };

  return (
    <AppLayout
      bottomBar={
        <div className='border-t border-border bg-background/95 backdrop-blur-sm'>
          <div className={`px-6 py-3 flex items-center ${prevStatus ? 'justify-between' : 'justify-end'}`}>
            {prevStatus && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant='ghost' className='gap-2 text-muted-foreground hover:bg-foreground/5'>
                    <Undo2 className='h-4 w-4' /> {prevStatusLabel}로 되돌리기
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>이전 상태로 되돌리시겠습니까?</AlertDialogTitle>
                    <AlertDialogDescription>
                      상태가 <strong>{prevStatusLabel}</strong>(으)로 변경됩니다.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>취소</AlertDialogCancel>
                    <AlertDialogAction onClick={handleStatusCancel}>확인</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}

            <div className='flex gap-2'>
              <Button
                variant='ghost'
                className='text-muted-foreground hover:bg-foreground/5'
                onClick={() => navigate(-1)}
              >
                수정 취소
              </Button>
              <Button onClick={handleSave} className='px-6'>
                수정 저장
              </Button>
            </div>
          </div>
        </div>
      }
    >
      <div className='mb-6'>
        <Button
          variant='ghost'
          className='gap-2 hover:bg-foreground/5 text-muted-foreground'
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className='h-4 w-4' /> 뒤로
        </Button>
      </div>

      <PageHeader title={commission?.title ?? '의뢰 수정'} />

      <Card className='border-border/50'>
        <CardContent className='p-5'>
          <h2 className='font-display font-semibold mb-4'>의뢰 정보</h2>
          <div className='space-y-5'>

            {/* 편성 */}
            <div className='space-y-2'>
              <Label>편성</Label>
              <div className='relative'>
                <Input
                  placeholder='악기를 검색하여 추가...'
                  value={instrumentInput}
                  onChange={e => {
                    setInstrumentInput(e.target.value);
                    setShowInstrumentDropdown(true);
                  }}
                  onFocus={() => setShowInstrumentDropdown(true)}
                  onBlur={() => setTimeout(() => setShowInstrumentDropdown(false), 200)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleAddInstrument(instrumentInput);
                  }}
                />
                {showInstrumentDropdown && instrumentInput && filteredOptions.length > 0 && (
                  <div className='absolute z-10 top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto'>
                    {filteredOptions.map(opt => (
                      <button
                        key={opt}
                        type='button'
                        className='w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors flex items-center gap-2'
                        onMouseDown={e => {
                          e.preventDefault();
                          handleAddInstrument(opt);
                        }}
                      >
                        <Plus className='h-3 w-3 text-muted-foreground' />
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {form.instruments.length > 0 && (
                <div className='flex flex-wrap gap-2 m-2'>
                  {form.instruments.map((inst, idx) => (
                    <span
                      key={idx}
                      className='inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium bg-primary/15 text-primary border border-primary/20'
                    >
                      {inst}
                      <button
                        type='button'
                        onClick={() => removeInstrument(idx)}
                        className='ml-0.5 hover:text-destructive transition-colors'
                      >
                        <X className='h-3 w-3' />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* 버전 */}
            <div className='space-y-2'>
              <Label>버전</Label>
              <Select
                value={form.version || 'normal'}
                onValueChange={value =>
                  setForm(prev => ({ ...prev, version: value === 'normal' ? '' : value }))
                }
              >
                <SelectTrigger>
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

            {/* 마감일 */}
            <div className='space-y-2'>
              <Label>마감일</Label>
              <div className='relative'>
                <Input
                  ref={dateInputRef}
                  type='date'
                  className='pr-9 [&::-webkit-calendar-picker-indicator]:hidden'
                  value={form.deadline}
                  onChange={e => setForm(prev => ({ ...prev, deadline: e.target.value }))}
                />
                <button
                  type='button'
                  onClick={() => dateInputRef.current?.showPicker()}
                  className='absolute right-0 top-0 bottom-0 px-3 flex items-center text-muted-foreground hover:text-foreground transition-colors'
                >
                  <Calendar className='h-4 w-4' />
                </button>
              </div>
            </div>

            {/* 메모 */}
            <div className='space-y-2'>
              <Label>메모</Label>
              <Textarea
                placeholder='추가 요청사항이나 메모...'
                rows={4}
                value={form.notes}
                onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))}
              />
            </div>

          </div>
        </CardContent>
      </Card>
    </AppLayout>
  );
};

export default CommissionEdit;
