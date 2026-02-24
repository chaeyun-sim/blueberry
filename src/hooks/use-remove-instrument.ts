import { buildInstrumentList } from '@/utils/build-instrument-list';

function useRemoveInstrument() {
  const removeInstrument = (instruments: string[], index: number) => {
    const remaining = instruments.filter((_, i) => i !== index);
    const baseNames = remaining.map(i => i.replace(/\s+(I{1,3}V?|IV|VI{0,3}|V)$/, ''));
    return buildInstrumentList(baseNames);
  };

  return { removeInstrument };
}


export default useRemoveInstrument;