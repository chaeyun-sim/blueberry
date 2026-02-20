import { CommissionStatus } from '@/components/StatusBadge';
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
    arrangement: '현악 4중주',
    deadline: '2026-02-21',
    status: 'working',
    version: 'hard',
  },
  {
    id: '2',
    title: 'River Flows in You',
    composer: 'Yiruma',
    arrangement: '피아노 솔로',
    deadline: '2026-02-23',
    status: 'working',
    version: 'easy',
  },
  {
    id: '3',
    title: 'Spring Waltz',
    composer: 'Frédéric Chopin',
    arrangement: '플룻 듀엣',
    deadline: '2026-03-01',
    status: 'received',
    version: 'normal',
  },
  {
    id: '4',
    title: 'A Thousand Years',
    composer: 'Christina Perri',
    arrangement: '현악 5중주',
    deadline: '2026-02-28',
    status: 'working',
    version: 'pro',
  },
  {
    id: '5',
    title: 'Butterfly',
    composer: 'The Piano Guys',
    arrangement: '클라리넷 트리오',
    deadline: '2026-02-16',
    status: 'complete',
    version: 'normal',
  },
  {
    id: '6',
    title: 'Wedding March',
    composer: 'Pyotr Ilyich Tchaikovsky',
    arrangement: '브라스 앙상블',
    deadline: '2026-02-10',
    status: 'complete',
    version: 'hard',
  },
];
