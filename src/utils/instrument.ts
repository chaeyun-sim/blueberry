import { INSTRUMENT_ABBREVIATIONS } from '@/constants/instruments';

// "Violin I" → "Vn.I", "Flute" → "Fl."
export function abbreviateInstrument(name: string): string {
  const romanMatch = name.match(/^(.+?)\s+(I{1,3}V?|IV|VI{0,3}|V)$/);
  if (romanMatch) {
    const base = romanMatch[1];
    const roman = romanMatch[2];
    return (INSTRUMENT_ABBREVIATIONS[base] ?? base) + roman;
  }
  return INSTRUMENT_ABBREVIATIONS[name] ?? name;
}
