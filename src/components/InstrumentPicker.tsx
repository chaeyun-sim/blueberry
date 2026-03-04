import { useEffect, useId, useRef, useState } from 'react';
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
  const [activeIndex, setActiveIndex] = useState(-1);
  const blurTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { removeInstrument } = useRemoveInstrument();

  useEffect(() => {
    return () => {
      if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current);
    };
  }, []);
  const uid = useId();
  const inputId = `instrument-input-${uid}`;
  const listboxId = `instrument-listbox-${uid}`;

  const filteredOptions = ALL_INSTRUMENTS.filter(opt =>
    opt.toLowerCase().includes(input.toLowerCase()),
  );

  const isOpen = showDropdown && !!input && filteredOptions.length > 0;

  const handleAdd = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onChange(buildInstrumentList([...instruments, trimmed]));
    setInput('');
    setShowDropdown(false);
    setActiveIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) { setShowDropdown(true); return; }
      setActiveIndex(prev => (prev + 1) % filteredOptions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!isOpen) return;
      setActiveIndex(prev => (prev <= 0 ? filteredOptions.length - 1 : prev - 1));
    } else if (e.key === 'Enter') {
      if (e.nativeEvent.isComposing) return;
      e.preventDefault();
      if (isOpen && activeIndex >= 0 && activeIndex < filteredOptions.length) {
        handleAdd(filteredOptions[activeIndex]);
      } else if (input.trim()) {
        handleAdd(input);
      }
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
      setActiveIndex(-1);
    }
  };

  return (
    <div className='space-y-2'>
      <Label htmlFor={inputId}>{label}</Label>
      <div className='relative'>
        <Input
          id={inputId}
          role='combobox'
          aria-expanded={isOpen}
          aria-haspopup='listbox'
          aria-controls={listboxId}
          aria-autocomplete='list'
          aria-activedescendant={activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined}
          placeholder='악기를 검색하여 추가...'
          value={input}
          onChange={e => {
            setInput(e.target.value);
            setShowDropdown(true);
            setActiveIndex(-1);
          }}
          onFocus={() => {
            if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current);
            setShowDropdown(true);
          }}
          onBlur={() => {
            if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current);
            blurTimeoutRef.current = setTimeout(() => {
              setShowDropdown(false);
              setActiveIndex(-1);
            }, 200);
          }}
          onKeyDown={handleKeyDown}
          disabled={disabled}
        />
        {isOpen && (
          <div
            id={listboxId}
            role='listbox'
            aria-label='악기 목록'
            className='absolute z-10 top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto'
          >
            {filteredOptions.map((opt, idx) => (
              <div
                key={opt}
                id={`${listboxId}-option-${idx}`}
                role='option'
                tabIndex={-1}
                aria-selected={idx === activeIndex}
                className={`w-full text-left px-3 py-2 text-sm transition-colors flex items-center gap-2 cursor-default ${idx === activeIndex ? 'bg-muted' : 'hover:bg-muted'}`}
                onMouseDown={e => {
                  e.preventDefault();
                  handleAdd(opt);
                }}
              >
                <Plus className='h-3 w-3 text-muted-foreground' />
                {opt}
              </div>
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
                aria-label={`${inst} 제거`}
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
