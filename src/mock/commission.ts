import { CommissionStatus } from '@/constants/status-config';
import { DifficultyLevelType } from '@/types/commission';

export const mockCommissions: {
  id: string;
  title: string;
  composer: string;
  arrangement: string;
  deadline: string;
  status: CommissionStatus;
  version: DifficultyLevelType;
}[] = [
  {
    id: '1',
    title: 'Canon in D',
    composer: 'Johann Sebastian Bach',
    arrangement: 'Vn, Vn, Va, Vc',
    deadline: '2026-02-21',
    status: 'working',
    version: 'hard',
  },
  {
    id: '2',
    title: 'River Flows in You',
    composer: 'Yiruma',
    arrangement: 'Pf',
    deadline: '2026-02-23',
    status: 'working',
    version: 'easy',
  },
  {
    id: '3',
    title: 'Spring Waltz',
    composer: 'Frédéric Chopin',
    arrangement: 'Fl, Fl',
    deadline: '2026-03-01',
    status: 'received',
    version: null,
  },
  {
    id: '4',
    title: 'A Thousand Years',
    composer: 'Christina Perri',
    arrangement: 'Vn, Vn, Va, Vc, Cb',
    deadline: '2026-02-28',
    status: 'working',
    version: 'pro',
  },
  {
    id: '5',
    title: 'Butterfly',
    composer: 'The Piano Guys',
    arrangement: 'Cl, Cl, Cl',
    deadline: '2026-02-16',
    status: 'complete',
    version: null,
  },
  {
    id: '6',
    title: 'Wedding March',
    composer: 'Pyotr Ilyich Tchaikovsky',
    arrangement: 'Tp, Tp, Hn, Tb, Tu',
    deadline: '2026-02-10',
    status: 'complete',
    version: 'hard',
  },
];


export const mockCommissionDetail = {
  id: "1",
  title: "Canon in D",
  arrangement: "Vn, Vn, Va, Vc",
  version: "easy",
  deadline: "2026-02-21",
  status: "working" as CommissionStatus,
  notes: "원곡 기반, 약간 재편곡 요청. 비올라 파트 강화 원함.",
  createdAt: "2026-02-15",
  linkedScores: [
    { id: "s1", title: "Canon in D", arrangement: "Vn, Vn, Va, Vc", version: "easy" },
    { id: "s2", title: "Canon in D", arrangement: "Vn, Vn, Va, Vc, Db", version: null },
  ],
};

export const mockSongSuggestions = [
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

export const mockComposerSuggestions = [
  "Johann Sebastian Bach",
  "Frédéric Chopin",
  "Pyotr Ilyich Tchaikovsky",
  "Wolfgang Amadeus Mozart",
  "Johannes Brahms",
  "Ludwig van Beethoven",
  "George Frideric Handel",
  "Antonio Vivaldi",
  "Franz Schubert",
  "Robert Schumann",
  "Claude Debussy",
]