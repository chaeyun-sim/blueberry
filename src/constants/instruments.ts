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