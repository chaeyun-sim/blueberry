import dayjs, { Dayjs } from 'dayjs';
import dayOfYear from 'dayjs/plugin/dayOfYear';

dayjs.extend(dayOfYear);

export interface MusicRecommendation {
  id: string;
  title: string;
  englishTitle: string;
  composer: string;
  category: 'CLASSIC' | 'OST' | 'ANI' | 'ETC';
  mood: string[];
  description: string;
  difficulty: '쉬움' | '보통' | '어려움';
  youtubeQuery: string;
}

export const recommendationPool: MusicRecommendation[] = [
  {
    id: '1',
    title: 'Clair de Lune',
    englishTitle: 'Moonlight',
    composer: 'Claude Debussy',
    category: 'CLASSIC',
    mood: ['서정적', '몽환적', '섬세한'],
    description: '드뷔시의 피아노 모음곡 \'베르가마스크\' 3번째 곡으로, 달빛의 아름다움을 인상주의적으로 표현한 명작입니다.',
    difficulty: '어려움',
    youtubeQuery: 'Clair de Lune Debussy piano',
  },
  {
    id: '2',
    title: 'Nocturne Op. 9 No. 2',
    englishTitle: 'Nocturne Op. 9 No. 2',
    composer: 'Frédéric Chopin',
    category: 'CLASSIC',
    mood: ['낭만적', '감성적', '고요한'],
    description: '쇼팽의 야상곡 중 가장 사랑받는 작품으로, 오른손의 꿈결 같은 멜로디가 인상적입니다.',
    difficulty: '보통',
    youtubeQuery: 'Chopin Nocturne Op 9 No 2 piano',
  },
  {
    id: '3',
    title: 'Air on the G String',
    englishTitle: 'Air on the G String',
    composer: 'J.S. Bach',
    category: 'CLASSIC',
    mood: ['장엄한', '평온한', '고전적'],
    description: '바흐 관현악 모음곡 3번의 2악장으로, 장엄하고 평온한 현악 선율이 특징입니다.',
    difficulty: '쉬움',
    youtubeQuery: 'Bach Air on the G String orchestra',
  },
  {
    id: '4',
    title: 'Gymnopédie No. 1',
    englishTitle: 'Gymnopedie No. 1',
    composer: 'Erik Satie',
    category: 'CLASSIC',
    mood: ['명상적', '느린', '미니멀'],
    description: '사티의 대표작으로, 단순하지만 깊은 여운을 남기는 피아노 소품입니다.',
    difficulty: '쉬움',
    youtubeQuery: 'Satie Gymnopédie No 1 piano',
  },
  {
    id: '5',
    title: 'Moonlight Sonata 1악장',
    englishTitle: 'Moonlight Sonata',
    composer: 'Ludwig van Beethoven',
    category: 'CLASSIC',
    mood: ['서정적', '우울한', '드라마틱'],
    description: '베토벤 피아노 소나타 14번 1악장으로, 세 잇단음표의 고요한 반복이 달빛 아래 같은 서정적인 분위기를 만들어냅니다.',
    difficulty: '보통',
    youtubeQuery: 'Beethoven Moonlight Sonata 1st movement piano',
  },
  {
    id: '6',
    title: 'Liebestraum No. 3',
    englishTitle: "Love Dream No. 3",
    composer: 'Franz Liszt',
    category: 'CLASSIC',
    mood: ['낭만적', '화려한', '열정적'],
    description: '\'사랑의 꿈\'이라는 제목의 리스트 피아노 소품 3번으로, 달콤한 멜로디와 화려한 반주가 특징입니다.',
    difficulty: '어려움',
    youtubeQuery: 'Liszt Liebestraum No 3 piano',
  },
  {
    id: '7',
    title: 'The Swan (Le Cygne)',
    englishTitle: 'The Swan',
    composer: 'Camille Saint-Saëns',
    category: 'CLASSIC',
    mood: ['우아한', '평온한', '순수한'],
    description: '\'동물의 사육제\'의 마지막 곡으로, 우아하게 흘러가는 첼로 선율이 백조의 품격을 그대로 담아냅니다.',
    difficulty: '보통',
    youtubeQuery: 'Saint-Saëns The Swan cello piano',
  },
  {
    id: '8',
    title: 'Méditation from Thaïs',
    englishTitle: 'Meditation from Thais',
    composer: 'Jules Massenet',
    category: 'CLASSIC',
    mood: ['서정적', '종교적', '고귀한'],
    description: '마스네의 오페라 타이스에서 발췌한 간주곡으로, 오페라 중에서도 독립적으로 가장 많이 연주되는 서정적인 소품입니다.',
    difficulty: '어려움',
    youtubeQuery: 'Massenet Meditation Thais violin piano',
  },
  {
    id: '9',
    title: 'Summer',
    englishTitle: 'Summer',
    composer: 'Joe Hisaishi',
    category: 'OST',
    mood: ['강렬한', '역동적', '열정적'],
    description: '히사이시 조의 영화 \'기쿠지로의 여름\' OST로, 국내에서는 TV 예능과 광고를 통해 널리 알려진 곡입니다.',
    difficulty: '보통',
    youtubeQuery: 'Joe Hisaishi Summer piano',
  },
  {
    id: '10',
    title: "La Valse d'Amélie",
    englishTitle: "Amelie Waltz",
    composer: 'Yann Tiersen',
    category: 'OST',
    mood: ['밝은', '경쾌한', '동화같은'],
    description: '영화 \'아멜리에\'의 OST로, 아코디언과 피아노가 어우러지는 프랑스 특유의 경쾌한 왈츠 소품입니다.',
    difficulty: '쉬움',
    youtubeQuery: 'Yann Tiersen Amelie Waltz piano',
  },
  {
    id: '11',
    title: 'Cinema Paradiso Love Theme',
    englishTitle: 'Cinema Paradiso',
    composer: 'Ennio Morricone',
    category: 'OST',
    mood: ['향수', '감동적', '애잔한'],
    description: '영화 \'시네마 천국\'의 메인 테마로, 엔니오 모리코네의 대표작 중 하나입니다. 영화의 추억과 향수를 담은 아름다운 선율이 특징입니다.',
    difficulty: '보통',
    youtubeQuery: 'Ennio Morricone Cinema Paradiso love theme violin',
  },
  {
    id: '12'      ,
    title: 'Time',
    englishTitle: 'Time (Inception OST)',
    composer: 'Hans Zimmer',
    category: 'OST',
    mood: ['장엄한', '철학적', '광대한'],
    description: '영화 \'인셉션\'의 엔딩 테마로, 단순한 멜로디가 점층적으로 발전하며 웅장한 감동을 만들어내는 곡입니다.',
    difficulty: '쉬움',
    youtubeQuery: 'Hans Zimmer Time Inception piano',
  },
  {
    id: '13',
    title: 'いつも何度でも',
    englishTitle: 'Always With Me',
    composer: 'Youmi Kimura',
    category: 'ANI',
    mood: ['따뜻한', '그리운', '감동적'],
    description: '미야자키 하야오 감독의 영화 \'센과 치히로의 행방불명\' 주제곡으로, 소박하고 따뜻한 멜로디가 깊은 여운을 남깁니다.',
    difficulty: '쉬움',
    youtubeQuery: 'いつも何度でも 千と千尋 피아노',
  },
  {
    id: '14',
    title: '人生のメリーゴーランド',
    englishTitle: 'Merry-Go-Round of Life',
    composer: 'Joe Hisaishi',
    category: 'ANI',
    mood: ['밝은', '왈츠', '동화같은'],
    description: '영화 \'하울의 움직이는 성\'의 메인 테마로, 경쾌한 왈츠 리듬과 동화 같은 분위기가 특징인 히사이시 조의 명작입니다.',
    difficulty: '보통',
    youtubeQuery: '인생의 메리고라운드 하울 피아노',
  },
  {
    id: '15',
    title: 'Merry Christmas, Mr. Lawrence',
    englishTitle: 'Merry Christmas Mr. Lawrence',
    composer: 'Ryuichi Sakamoto',
    category: 'OST',
    mood: ['서정적', '아련한', '미니멀'],
    description: '사카모토 류이치의 피아노 소품으로, 영화 \'전장의 메리 크리스마스\'에서 사용되어 널리 알려진 미니멀한 명곡입니다.',
    difficulty: '쉬움',
    youtubeQuery: 'Sakamoto Merry Christmas Mr Lawrence piano',
  },
  {
    id: '16',
    title: "Schindler's List Main Theme",
    englishTitle: "Schindler's List",
    composer: 'John Williams',
    category: 'OST',
    mood: ['비극적', '애절한', '강렬한'],
    description: '영화 \'쉰들러 리스트\'의 메인 테마로, 이츠하크 펄만의 연주로 유명합니다. 애절하고 강렬한 선율이 깊은 감동을 전합니다.',
    difficulty: '어려움',
    youtubeQuery: 'Schindlers List main theme violin',
  },
  {
    id: '17',
    title: 'Pavane Op. 50',
    englishTitle: 'Pavane',
    composer: 'Gabriel Fauré',
    category: 'CLASSIC',
    mood: ['우아한', '고풍스러운', '서정적'],
    description: '포레의 피아노 + 합창을 위한 곡으로, 관현악 버전으로도 널리 연주됩니다. 고풍스럽고 우아한 3박자 선율이 매력적입니다.',
    difficulty: '보통',
    youtubeQuery: 'Fauré Pavane orchestra',
  },
  {
    id: '18',
    title: "Salut d'Amour",
    englishTitle: "Love's Greeting",
    composer: 'Edward Elgar',
    category: 'CLASSIC',
    mood: ['달콤한', '낭만적', '사랑스러운'],
    description: '엘가가 약혼녀에게 선물한 소품으로, 달콤하고 사랑스러운 선율이 담긴 낭만적인 소품입니다.',
    difficulty: '보통',
    youtubeQuery: "Elgar Salut d'Amour violin piano",
  },
  {
    id: '19',
    title: 'Hungarian Dance No. 5',
    englishTitle: 'Hungarian Dance No. 5',
    composer: 'Johannes Brahms',
    category: 'CLASSIC',
    mood: ['열정적', '역동적', '민속적'],
    description: '브람스의 헝가리 춤곡 중 가장 유명한 5번으로, 화려하고 역동적인 리듬과 민속적인 에너지가 가득한 곡입니다.',
    difficulty: '어려움',
    youtubeQuery: 'Brahms Hungarian Dance No 5 orchestra',
  },
  {
    id: '20',
    title: 'Adagio in G minor',
    englishTitle: 'Adagio in G Minor',
    composer: 'Tomaso Albinoni',
    category: 'CLASSIC',
    mood: ['비극적', '장엄한', '감동적'],
    description: '바로크 스타일의 현악 + 오르간을 위한 곡으로, 단순하지만 깊은 감동을 주는 비극적인 선율이 특징입니다.',
    difficulty: '보통',
    youtubeQuery: 'Albinoni Adagio G minor strings organ',
  },
];

export function getDailyRecommendation(
  pool: MusicRecommendation[] = recommendationPool,
  date: Dayjs = dayjs(),
): MusicRecommendation {
  return pool[date.dayOfYear() % pool.length];
}

export function getRecentRecommendations(
  days: number = 5,
  pool: MusicRecommendation[] = recommendationPool,
): Array<{ date: Dayjs; rec: MusicRecommendation }> {
  const today = dayjs();
  return Array.from({ length: days }, (_, i) => {
    const date = today.subtract(i + 1, 'day');
    return { date, rec: getDailyRecommendation(pool, date) };
  });
}
