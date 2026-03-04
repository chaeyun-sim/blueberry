import { useState, useRef, useId } from "react";
import { Input } from "@/components/ui/input";

interface AutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  suggestions: string[];
  inputProps?: React.ComponentProps<typeof Input>;
}

function Autocomplete({ value, onChange, placeholder = "곡 제목을 입력하세요", suggestions, inputProps }: AutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const uid = useId();
  const listboxId = `autocomplete-listbox-${uid}`;

  const filtered = value
    ? suggestions.filter((s) => s.toLowerCase().includes(value.toLowerCase())).slice(0, 6)
    : [];

  const isOpen = open && value.length > 0 && filtered.length > 0;

  const select = (song: string) => {
    onChange(song);
    setOpen(false);
    setActiveIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(prev => (prev + 1) % filtered.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => (prev <= 0 ? filtered.length - 1 : prev - 1));
    } else if (e.key === 'Enter' && activeIndex >= 0 && activeIndex < filtered.length) {
      e.preventDefault();
      select(filtered[activeIndex]);
    } else if (e.key === 'Escape') {
      setOpen(false);
      setActiveIndex(-1);
    }
  };

  return (
    <div className="relative">
      <Input
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls={listboxId}
        aria-autocomplete="list"
        aria-activedescendant={activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
          setActiveIndex(-1);
        }}
        onFocus={() => {
          clearTimeout(timeoutRef.current);
          setOpen(true);
        }}
        onBlur={() => {
          timeoutRef.current = setTimeout(() => {
            setOpen(false);
            setActiveIndex(-1);
          }, 200);
        }}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        {...inputProps}
      />
      {isOpen && (
        <div
          id={listboxId}
          role="listbox"
          className="absolute z-10 top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto"
        >
          {filtered.map((song, idx) => (
            <div
              key={song}
              id={`${listboxId}-option-${idx}`}
              role="option"
              tabIndex={-1}
              aria-selected={idx === activeIndex}
              className={`w-full text-left px-3 py-2 text-sm transition-colors cursor-default ${idx === activeIndex ? 'bg-muted' : 'hover:bg-muted'}`}
              onMouseDown={(e) => {
                e.preventDefault();
                select(song);
              }}
            >
              {song}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Autocomplete;
