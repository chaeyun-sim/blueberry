export function detectFileType(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase() ?? '';
  if (['xml', 'musicxml', 'mxl'].includes(ext)) return 'musicxml';
  if (ext === 'pdf') return 'pdf';
  const nameWithoutExt = fileName.replace(/\.[^.]+$/, '');
  if (nameWithoutExt.includes(' - ')) return 'part';
  return 'score';
}