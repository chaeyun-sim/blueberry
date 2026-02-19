import { useState, useRef } from "react";
import { Input } from "@/components/ui/input";

const SONG_SUGGESTIONS = [
  "Canon in D",
  "River Flows in You",
  "Kiss the Rain",
  "A Thousand Years",
  "Spring Waltz",
  "Wedding March",
  "Merry Go Round of Life",
  "君をのせて (천공의 성 라퓨타)",
  "Summer (久石譲)",
  "Love Me Tender",
  "Butterfly",
  "Pachelbel Canon",
  "Clair de Lune",
  "Gymnopédie No.1",
  "La Campanella",
];

interface SongAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SongAutocomplete({ value, onChange, placeholder = "곡 제목을 입력하세요" }: SongAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const filtered = value
    ? SONG_SUGGESTIONS.filter((s) => s.toLowerCase().includes(value.toLowerCase())).slice(0, 6)
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
