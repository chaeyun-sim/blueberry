import Anthropic from '@anthropic-ai/sdk';
import JSZip from 'jszip';
import { supabase } from '@/lib/supabase';

interface ClefDef { sign: string; line: number }

interface InstrumentDef {
  name: string;
  abbrev: string;
  staves: number;
  isPiano: boolean;
  sound: string;
  midiProgram: number;
  clef: ClefDef;
}

export interface TemplateParams {
  title: string;
  subtitle?: string;
  composer: string;
  arrangement: string;
  keyFifths?: number;
  keyMode?: 'major' | 'minor';
  timeBeats?: number;
  timeBeatType?: number;
}

export interface TemplateSlot {
  key: string;
  label: string;
  staves: number;
  hasPiano: boolean;
}

const INSTRUMENT_MAP: Record<string, InstrumentDef> = {
  vn:      { name: 'Violin',      abbrev: 'Vn.',  staves: 1, isPiano: false, sound: 'strings.violin',            midiProgram: 41, clef: { sign: 'G', line: 2 } },
  vln:     { name: 'Violin',      abbrev: 'Vn.',  staves: 1, isPiano: false, sound: 'strings.violin',            midiProgram: 41, clef: { sign: 'G', line: 2 } },
  violin:  { name: 'Violin',      abbrev: 'Vn.',  staves: 1, isPiano: false, sound: 'strings.violin',            midiProgram: 41, clef: { sign: 'G', line: 2 } },
  va:      { name: 'Viola',       abbrev: 'Va.',  staves: 1, isPiano: false, sound: 'strings.viola',             midiProgram: 42, clef: { sign: 'C', line: 3 } },
  vla:     { name: 'Viola',       abbrev: 'Va.',  staves: 1, isPiano: false, sound: 'strings.viola',             midiProgram: 42, clef: { sign: 'C', line: 3 } },
  viola:   { name: 'Viola',       abbrev: 'Va.',  staves: 1, isPiano: false, sound: 'strings.viola',             midiProgram: 42, clef: { sign: 'C', line: 3 } },
  vc:      { name: 'Cello',       abbrev: 'Vc.',  staves: 1, isPiano: false, sound: 'strings.cello',             midiProgram: 43, clef: { sign: 'F', line: 4 } },
  vlc:     { name: 'Cello',       abbrev: 'Vc.',  staves: 1, isPiano: false, sound: 'strings.cello',             midiProgram: 43, clef: { sign: 'F', line: 4 } },
  cello:   { name: 'Cello',       abbrev: 'Vc.',  staves: 1, isPiano: false, sound: 'strings.cello',             midiProgram: 43, clef: { sign: 'F', line: 4 } },
  db:      { name: 'Double Bass', abbrev: 'Db.',  staves: 1, isPiano: false, sound: 'strings.contrabass',        midiProgram: 44, clef: { sign: 'F', line: 4 } },
  cb:      { name: 'Double Bass', abbrev: 'Cb.',  staves: 1, isPiano: false, sound: 'strings.contrabass',        midiProgram: 44, clef: { sign: 'F', line: 4 } },
  fl:      { name: 'Flute',       abbrev: 'Fl.',  staves: 1, isPiano: false, sound: 'wind.flutes.flute',         midiProgram: 74, clef: { sign: 'G', line: 2 } },
  flute:   { name: 'Flute',       abbrev: 'Fl.',  staves: 1, isPiano: false, sound: 'wind.flutes.flute',         midiProgram: 74, clef: { sign: 'G', line: 2 } },
  ob:      { name: 'Oboe',        abbrev: 'Ob.',  staves: 1, isPiano: false, sound: 'wind.reed.oboe',            midiProgram: 69, clef: { sign: 'G', line: 2 } },
  oboe:    { name: 'Oboe',        abbrev: 'Ob.',  staves: 1, isPiano: false, sound: 'wind.reed.oboe',            midiProgram: 69, clef: { sign: 'G', line: 2 } },
  cl:      { name: 'Clarinet',    abbrev: 'Cl.',  staves: 1, isPiano: false, sound: 'wind.reed.clarinet.b-flat', midiProgram: 72, clef: { sign: 'G', line: 2 } },
  fg:      { name: 'Bassoon',     abbrev: 'Fg.',  staves: 1, isPiano: false, sound: 'wind.reed.bassoon',         midiProgram: 71, clef: { sign: 'F', line: 4 } },
  bn:      { name: 'Bassoon',     abbrev: 'Bn.',  staves: 1, isPiano: false, sound: 'wind.reed.bassoon',         midiProgram: 71, clef: { sign: 'F', line: 4 } },
  hn:      { name: 'Horn',        abbrev: 'Hn.',  staves: 1, isPiano: false, sound: 'brass.french-horn',         midiProgram: 61, clef: { sign: 'F', line: 4 } },
  hr:      { name: 'Horn',        abbrev: 'Hr.',  staves: 1, isPiano: false, sound: 'brass.french-horn',         midiProgram: 61, clef: { sign: 'F', line: 4 } },
  horn:    { name: 'Horn',        abbrev: 'Hn.',  staves: 1, isPiano: false, sound: 'brass.french-horn',         midiProgram: 61, clef: { sign: 'F', line: 4 } },
  tp:      { name: 'Trumpet',     abbrev: 'Tp.',  staves: 1, isPiano: false, sound: 'brass.trumpet',             midiProgram: 57, clef: { sign: 'G', line: 2 } },
  tpt:     { name: 'Trumpet',     abbrev: 'Tpt.', staves: 1, isPiano: false, sound: 'brass.trumpet',             midiProgram: 57, clef: { sign: 'G', line: 2 } },
  trumpet: { name: 'Trumpet',     abbrev: 'Tpt.', staves: 1, isPiano: false, sound: 'brass.trumpet',             midiProgram: 57, clef: { sign: 'G', line: 2 } },
  pf:      { name: 'Piano',       abbrev: 'Pf.',  staves: 2, isPiano: true,  sound: 'keyboard.piano',            midiProgram: 1,  clef: { sign: 'G', line: 2 } },
  piano:   { name: 'Piano',       abbrev: 'Pf.',  staves: 2, isPiano: true,  sound: 'keyboard.piano',            midiProgram: 1,  clef: { sign: 'G', line: 2 } },
  hp:      { name: 'Harp',        abbrev: 'Hp.',  staves: 2, isPiano: false, sound: 'pluck.harp',                midiProgram: 47, clef: { sign: 'G', line: 2 } },
  harp:    { name: 'Harp',        abbrev: 'Hp.',  staves: 2, isPiano: false, sound: 'pluck.harp',                midiProgram: 47, clef: { sign: 'G', line: 2 } },
};

export const TEMPLATE_SLOTS: TemplateSlot[] = [
  { key: '1s',     label: '1 stave',                  staves: 1,  hasPiano: false },
  { key: '2s',     label: '2 staves (Duet)',           staves: 2,  hasPiano: false },
  { key: '3s',     label: '3 staves (String Trio)',    staves: 3,  hasPiano: false },
  { key: '3s-pf',  label: '3 staves (Solo + Piano)',   staves: 3,  hasPiano: true  },
  { key: '4s',     label: '4 staves (String Quartet)', staves: 4,  hasPiano: false },
  { key: '4s-pf',  label: '4 staves (Piano Trio)',     staves: 4,  hasPiano: true  },
  { key: '5s',     label: '5 staves (String Quintet)', staves: 5,  hasPiano: false },
  { key: '5s-pf',  label: '5 staves (Piano Quartet)',  staves: 5,  hasPiano: true  },
  { key: '6s',     label: '6 staves',                  staves: 6,  hasPiano: false },
  { key: '6s-pf',  label: '6 staves (Piano Quintet)',  staves: 6,  hasPiano: true  },
  { key: '7s-pf',  label: '7 staves (with Piano)',     staves: 7,  hasPiano: true  },
  { key: '8s-pf',  label: '8 staves (with Piano)',     staves: 8,  hasPiano: true  },
  { key: '9s-pf',  label: '9 staves (with Piano)',     staves: 9,  hasPiano: true  },
  { key: '10s-pf', label: '10 staves (with Piano)',    staves: 10, hasPiano: true  },
];

const IGNORE_TOKENS = new Set([
  'i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii',
  '1', '2', '3', '4', '5', '6', '7', '8',
  '1st', '2nd', '3rd', '4th', '5th',
  'and', 'the', '&',
]);

function toRoman(n: number): string {
  return (['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'] as const)[n - 1] ?? String(n);
}

export function parseArrangement(arrangement: string): InstrumentDef[] {
  const raw = arrangement
    .split(/[,+/\s]+/)
    .map(s => s.trim().toLowerCase().replace(/\.+$/, ''))
    .filter(s => s && !IGNORE_TOKENS.has(s))
    .map(code => INSTRUMENT_MAP[code] ?? {
      name: code, abbrev: code, staves: 1, isPiano: false,
      sound: '', midiProgram: 0, clef: { sign: 'G', line: 2 },
    });

  const counts: Record<string, number> = {};
  raw.forEach(inst => { counts[inst.name] = (counts[inst.name] ?? 0) + 1; });

  const seen: Record<string, number> = {};
  return raw.map(inst => {
    if (counts[inst.name] > 1) {
      seen[inst.name] = (seen[inst.name] ?? 0) + 1;
      const roman = toRoman(seen[inst.name]);
      const abbrevBase = inst.abbrev.replace(/\.$/, '');
      return { ...inst, name: `${inst.name} ${roman}`, abbrev: `${abbrevBase}. ${roman}` };
    }
    return inst;
  });
}

export function getTemplateKey(instruments: InstrumentDef[]): string {
  const totalStaves = instruments.reduce((sum, i) => sum + i.staves, 0);
  const hasPiano = instruments.some(i => i.isPiano);
  return hasPiano ? `${totalStaves}s-pf` : `${totalStaves}s`;
}

export interface MusicAnalysis {
  keyFifths: number;
  keyMode: 'major' | 'minor';
  timeBeats: number;
  timeBeatType: number;
  // 해당 곡의 원어 정식 명칭 (예: "Volière", "Clair de lune")
  canonicalTitle: string;
  // 모음곡/콜렉션 제목 (예: "Le Carnaval des animaux") — 있는 경우만
  collectionTitle?: string;
}

export async function analyzeMusicMeta(workTitle: string, composer: string, movementTitle?: string): Promise<MusicAnalysis> {
  const apiKey = import.meta.env.ANTHROPIC_API_KEY as string | undefined;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY 환경변수가 없어요. .env 파일에 추가해주세요.');
  const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });

  const content = movementTitle
    ? `Identify this specific piece: movement = "${movementTitle}", from collection = "${workTitle}", composer = ${composer}.
Return ONLY valid JSON:
{"keyFifths": <-7 to 7>, "keyMode": "major" or "minor", "timeBeats": <numerator>, "timeBeatType": <denominator>, "canonicalTitle": "<the original title of this SPECIFIC MOVEMENT in its original language, e.g. Voliere>", "collectionTitle": "<original title of the collection/suite in its original language>"}
keyFifths: 0=C/Am, -1=F/Dm, -2=Bb/Gm, -3=Eb/Cm, -4=Ab/Fm, -5=Db/Bbm, 1=G/Em, 2=D/Bm, 3=A/F#m, 4=E/C#m, 5=B/G#m`
    : `Identify this piece: "${workTitle}" by ${composer}.
Return ONLY valid JSON:
{"keyFifths": <-7 to 7>, "keyMode": "major" or "minor", "timeBeats": <numerator>, "timeBeatType": <denominator>, "canonicalTitle": "<original title in its original language>", "collectionTitle": "<collection/suite title if this piece belongs to one, otherwise null>"}`;

  const msg = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 200,
    messages: [{ role: 'user', content }],
  });
  const first = msg.content[0];
  if (first.type !== 'text') throw new Error('AI 응답 파싱 실패');
  const json = first.text.match(/\{[\s\S]*\}/)?.[0];
  if (!json) throw new Error('AI 응답 파싱 실패');
  return JSON.parse(json) as MusicAnalysis;
}

export async function translateToEnglish(text: string): Promise<string> {
  const apiKey = import.meta.env.ANTHROPIC_API_KEY as string | undefined;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY 환경변수가 없어요. .env 파일에 추가해주세요.');
  const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
  const msg = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 100,
    messages: [{
      role: 'user',
      content: `Translate this music piece title to English. If already English, return as-is. Return only the translated title, no explanation:\n"${text}"`,
    }],
  });
  const first = msg.content[0];
  return first.type === 'text' ? first.text.trim().replace(/^["']|["']$/g, '') : text;
}

function replaceTag(xml: string, tag: string, value: string): string {
  const v = escapeXml(value);
  xml = xml.replace(new RegExp(`<${tag}[^>]*\\s*/>`, 'g'), `<${tag}>${v}</${tag}>`);
  xml = xml.replace(new RegExp(`<${tag}[^>]*>[^<]*<\\/${tag}>`, 'g'), `<${tag}>${v}</${tag}>`);
  return xml;
}

function patchMusicXML(xml: string, params: TemplateParams, instruments: InstrumentDef[]): string {
  let result = xml;

  result = replaceTag(result, 'work-title', params.title);
  result = replaceTag(result, 'movement-title', params.subtitle ?? params.title);

  const composerTag = `<creator type="composer">${escapeXml(params.composer)}</creator>`;
  result = result
    .replace(/<creator type=["']composer["']\s*\/>/g, composerTag)
    .replace(/<creator type=["']composer["']>[^<]*<\/creator>/g, composerTag);

  result = result
    .replace(/<creator type=["']arranger["'][^>]*>[^<]*<\/creator>/g, '<creator type="arranger"></creator>')
    .replace(/<creator type=["']lyricist["'][^>]*>[^<]*<\/creator>/g, '<creator type="lyricist"></creator>');

  result = result.replace(/<credit\b[^>]*>[\s\S]*?<\/credit>/g, (block) => {
    const typeMatch = block.match(/<credit-type>([^<]*)<\/credit-type>/);
    if (!typeMatch) return block;
    const type = typeMatch[1].trim().toLowerCase();
    let newText: string | null = null;
    if (type === 'title') newText = params.title;
    else if (type === 'subtitle') newText = params.subtitle ?? '';
    else if (type === 'composer') newText = params.composer;
    else if (type === 'arranger' || type === 'lyricist') newText = '';
    if (newText === null) return block;
    return block.replace(/(<credit-words[^>]*>)[^<]*(<\/credit-words>)/, `$1${escapeXml(newText)}$2`);
  });

  // 템플릿에 subtitle credit 블록이 없으면 title 아래에 새로 주입
  if (params.subtitle && !result.includes('<credit-type>subtitle</credit-type>')) {
    const titleCreditMatch = result.match(/<credit\b[^>]*>[\s\S]*?<credit-type>title<\/credit-type>[\s\S]*?<\/credit>/);
    if (titleCreditMatch) {
      const titleWordsMatch = titleCreditMatch[0].match(/<credit-words([^>]*)>/);
      if (titleWordsMatch) {
        const attrs = titleWordsMatch[1];
        const xMatch = attrs.match(/default-x="([^"]+)"/);
        const yMatch = attrs.match(/default-y="([^"]+)"/);
        const fontSizeMatch = attrs.match(/font-size="([^"]+)"/);
        const x = xMatch?.[1] ?? '595';
        const y = yMatch ? String(parseFloat(yMatch[1]) - 60) : '1330';
        const fontSize = fontSizeMatch ? String(Math.round(parseFloat(fontSizeMatch[1]) * 0.65)) : '14';
        const subtitleBlock = `\n<credit page="1">\n  <credit-type>subtitle</credit-type>\n  <credit-words default-x="${x}" default-y="${y}" justify="center" valign="top" font-size="${fontSize}">${escapeXml(params.subtitle)}</credit-words>\n</credit>`;
        result = result.replace(titleCreditMatch[0], titleCreditMatch[0] + subtitleBlock);
      }
    }
  }

  if (params.keyFifths !== undefined && params.keyMode) {
    const newKey = `<key><fifths>${params.keyFifths}</fifths><mode>${params.keyMode}</mode></key>`;
    result = result.replace(/<key[^>]*>[\s\S]*?<\/key>/g, newKey);
  }

  if (params.timeBeats !== undefined && params.timeBeatType !== undefined) {
    result = result.replace(
      /<time([^>]*)>[\s\S]*?<\/time>/g,
      `<time$1><beats>${params.timeBeats}</beats><beat-type>${params.timeBeatType}</beat-type></time>`,
    );
  }

  const partListMatch = result.match(/<part-list>[\s\S]*?<\/part-list>/);
  const partIds: string[] = [];
  if (partListMatch) {
    const scorePartBlocks = partListMatch[0].match(/<score-part\b[^>]*>[\s\S]*?<\/score-part>/g) ?? [];
    let patchedList = partListMatch[0];

    scorePartBlocks.forEach((block, idx) => {
      const inst = instruments[idx];
      if (!inst) return;
      const idMatch = block.match(/id="([^"]+)"/);
      if (idMatch) partIds.push(idMatch[1]);

      const patched = block
        .replace(/<part-name[^>]*>[^<]*<\/part-name>/, `<part-name>${escapeXml(inst.name)}</part-name>`)
        .replace(/<part-abbreviation[^>]*>[^<]*<\/part-abbreviation>/, `<part-abbreviation>${escapeXml(inst.abbrev)}</part-abbreviation>`)
        .replace(/<instrument-name>[^<]*<\/instrument-name>/, `<instrument-name>${escapeXml(inst.name)}</instrument-name>`)
        .replace(/<instrument-sound>[^<]*<\/instrument-sound>/, `<instrument-sound>${inst.sound}</instrument-sound>`)
        .replace(/<midi-program>[^<]*<\/midi-program>/, `<midi-program>${inst.midiProgram > 0 ? inst.midiProgram : 1}</midi-program>`);

      patchedList = patchedList.replace(block, patched);
    });

    result = result.replace(partListMatch[0], patchedList);
  }

  instruments.forEach((inst, idx) => {
    if (idx >= partIds.length || inst.isPiano) return;
    const partId = partIds[idx];
    const newClef = `<clef><sign>${inst.clef.sign}</sign><line>${inst.clef.line}</line></clef>`;
    result = result.replace(
      new RegExp(`(<part id="${partId}">[\\s\\S]*?)<clef[^>]*>[\\s\\S]*?<\\/clef>`),
      `$1${newClef}`,
    );
  });

  return result;
}

export async function downloadFilledTemplate(params: TemplateParams): Promise<void> {
  const instruments = parseArrangement(params.arrangement);
  const key = getTemplateKey(instruments);

  const { data, error } = await supabase.storage.from('templates').download(`${key}.mxl`);
  if (error || !data) {
    throw new Error(`편성에 맞는 템플릿이 없어요 (${key}). 설정에서 먼저 업로드해주세요.`);
  }

  const zip = await JSZip.loadAsync(await data.arrayBuffer());

  let xmlFileName: string | undefined;
  const containerFile = zip.files['META-INF/container.xml'];
  if (containerFile) {
    const containerXml = await containerFile.async('string');
    const match = containerXml.match(/full-path="([^"]+\.(?:xml|musicxml))"/i);
    if (match) xmlFileName = match[1];
  }
  if (!xmlFileName) {
    xmlFileName =
      Object.keys(zip.files).find(n => n.endsWith('.musicxml')) ??
      Object.keys(zip.files).find(n => n.endsWith('.xml') && !n.includes('META-INF'));
  }
  if (!xmlFileName) throw new Error('MusicXML 파일을 찾을 수 없어요.');

  const xmlContent = await zip.files[xmlFileName].async('string');
  const patched = patchMusicXML(xmlContent, params, instruments);

  zip.file(xmlFileName, patched);
  const blob = await zip.generateAsync({ type: 'blob', mimeType: 'application/vnd.recordare.musicxml' });

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${params.title || 'template'}.mxl`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function uploadTemplate(key: string, file: File): Promise<void> {
  const { error } = await supabase.storage
    .from('templates')
    .upload(`${key}.mxl`, file, { upsert: true });
  if (error) throw error;
}

export async function listUploadedTemplates(): Promise<Set<string>> {
  const { data } = await supabase.storage.from('templates').list('');
  if (!data) return new Set();
  return new Set(data.map(f => f.name.replace('.mxl', '')));
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
