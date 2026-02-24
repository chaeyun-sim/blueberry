export  const hasRomanSuffix = (name: string) => /\s+(I{1,3}V?|IV|VI{0,3}|V)$/.test(name);

export const buildInstrumentList = (names: string[]) => {
    const result: string[] = [];
    const roman = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];
    for (const name of names) {
      const sameBase = result.filter(i => i === name || (i.startsWith(name + ' ') && hasRomanSuffix(i)));
      if (sameBase.length === 0) {
        result.push(name);
      } else if (sameBase.length === 1 && !hasRomanSuffix(sameBase[0])) {
        const idx = result.indexOf(sameBase[0]);
        if (idx !== -1) result[idx] = `${name} I`;
        result.push(`${name} II`);
      } else {
        const nextNum = sameBase.length + 1;
        result.push(`${name} ${roman[nextNum - 1] || nextNum}`);
      }
    }
    return result;
  };
