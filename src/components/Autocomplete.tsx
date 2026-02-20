import { useState, useRef } from "react";
import { Input } from "@/components/ui/input";

interface AutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  suggestions?: string[];
}

function Autocomplete({ value, onChange, placeholder = "곡 제목을 입력하세요", suggestions }: AutocompleteProps) {
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const filtered = value
    ? suggestions?.filter((s) => s.toLowerCase().includes(value.toLowerCase())).slice(0, 6)
    : [];

  return (
    <div className="relative">
      <Input
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          timeoutRef.current = setTimeout(() => setOpen(false), 200);
        }}
        placeholder={placeholder}
      />
      {open && value && filtered.length > 0 && (
        <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {filtered.map((song) => (
            <button
              key={song}
              type="button"
              className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors"
              onMouseDown={(e) => {
                e.preventDefault();
                onChange(song);
                setOpen(false);
              }}
            >
              {song}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default Autocomplete;