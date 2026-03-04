import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DifficultyLevelType } from '@/types/commission';
import Label from '../ui/label';

interface RegisterFormVersionProps {
  value: DifficultyLevelType | null;
  onChange: (value: DifficultyLevelType | null) => void;
  disabled: boolean;
}

function RegisterFormVersion({ value, onChange, disabled }: RegisterFormVersionProps) {
  return (
    <div className='space-y-2'>
      <Label htmlFor='version'>버전</Label>
      <Select
        value={value ?? 'normal'}
        onValueChange={value =>
          onChange(value === 'normal' ? null : (value as DifficultyLevelType))
        }
        disabled={disabled}
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
  );
}

export default RegisterFormVersion;
