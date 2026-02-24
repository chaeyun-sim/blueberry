export function detectFileType(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase() ?? '';
  if (['xml', 'musicxml', 'mxl'].includes(ext)) return 'musicxml';
  if (ext === 'musx') return 'finale';
  if (ext === 'pdf') return 'pdf';
  if (['wav', 'aiff', 'mid', 'midi'].includes(ext)) return 'audio';
  const nameWithoutExt = fileName.replace(/\.[^.]+$/, '');
  if (nameWithoutExt.includes(' - ')) return 'part';
  return 'score';
}