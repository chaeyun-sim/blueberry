export const INSTRUMENTS = {
	strings: ["Violin", "Viola", "Cello", "Double Bass"],
	woodwinds: ["Flute", "Oboe", "Clarinet", "Bassoon"],
	brass: ["Horn", "Trumpet", "Trombone", "Tuba"],
	piano: ["Piano"],
	percussion: ["Timpani", "Drum Set", "Bass Drum", "Snare Drum", "Cymbals", "Triangle", "Tambourine"],
	"plucked-percussion": ["Xylophone", "Marimba", "Celesta", "Vibraphone", "Glockenspiel"],
	guitar: ["Guitar"],
} as const;

export const ALL_INSTRUMENTS = Object.values(INSTRUMENTS).flat();

export const INSTRUMENT_ABBREVIATIONS: Record<string, string> = {
  // Strings
  Violin: 'Vn',
  Viola: 'Va',
  Cello: 'Vc',
  'Double Bass': 'Db',
  // Woodwinds
  Flute: 'Fl',
  Oboe: 'Ob',
  Clarinet: 'Cl',
  Bassoon: 'Bn',
  // Brass
  Horn: 'Hn',
  Trumpet: 'Tpt',
  Trombone: 'Tbn',
  Tuba: 'Tb',
  // Piano
  Piano: 'Pf',
  // Percussion
  Timpani: 'Timp',
  'Drum Set': 'Dr',
  'Bass Drum': 'Bass Drum',
  'Snare Drum': 'Snare Drum',
  Cymbals: 'Cym',
  Triangle: 'Tri',
  Tambourine: 'Tam',
  // Pitched Percussion
  Xylophone: 'Xyl',
  Marimba: 'Mar',
  Celesta: 'Cel',
  Vibraphone: 'Vib',
  Glockenspiel: 'Glock',
  // Guitar
  Guitar: 'Gtr',
};

