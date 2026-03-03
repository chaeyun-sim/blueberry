import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import Label from '@/components/ui/label';
import { ALL_INSTRUMENTS } from '@/constants/instruments';
import { buildInstrumentList } from '@/utils/build-instrument-list';
import useRemoveInstrument from '@/hooks/use-remove-instrument';

interface InstrumentPickerProps {
  instruments: string[];
  onChange: (instruments: string[]) => void;
  disabled?: boolean;
  label?: string;
}

export function InstrumentPicker({
  instruments,
  onChange,
  disabled,
  label = '편성',
}: InstrumentPickerProps) {
  const [input, setInput] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const { removeInstrument } = useRemoveInstrument();

  const filteredOptions = ALL_INSTRUMENTS.filter(opt =>
    opt.toLowerCase().includes(input.toLowerCase()),
  );

  const handleAdd = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onChange(buildInstrumentList([...instruments, trimmed]));
    setInput('');
    setShowDropdown(false);
  };

  return (
    <div className='space-y-2'>
      <Label>{label}</Label>
      <div className='relative'>
        <Input
          placeholder='악기를 검색하여 추가...'
          value={input}
          onChange={e => {
            setInput(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
          onKeyDown={e => {
            if (e.key === 'Enter' && input.trim()) {
              e.preventDefault();
              handleAdd(input);
            }
          }}
          disabled={disabled}
        />
        {showDropdown && input && filteredOptions.length > 0 && (
          <div className='absolute z-10 top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto'>
            {filteredOptions.map(opt => (
              <button
                key={opt}
                type='button'
                className='w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors flex items-center gap-2'
                onMouseDown={e => {
                  e.preventDefault();
                  handleAdd(opt);
                }}
              >
                <Plus className='h-3 w-3 text-muted-foreground' />
                {opt}
              </button>
            ))}
          </div>
        )}
      </div>
      {instruments.length > 0 && (
        <div className='flex flex-wrap gap-2 mt-2'>
          {instruments.map((inst, idx) => (
            <span
              key={idx}
              className='inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium bg-primary/15 text-primary border border-primary/20'
            >
              {inst}
              <button
                type='button'
                disabled={disabled}
                onClick={() => onChange(removeInstrument(instruments, idx))}
                className='ml-0.5 hover:text-destructive transition-colors disabled:opacity-50 disabled:pointer-events-none'
              >
                <X className='h-3 w-3' />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
