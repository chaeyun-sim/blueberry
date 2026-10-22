import { describe, expect, it } from 'vitest';
import { normalizeSalesTitle } from './normalize-sales-title';

const expectSameSong = (titles: string[]) => {
	const normalized = new Set(titles.map(normalizeSalesTitle));
	expect(normalized.size, [...normalized].join(' / ')).toBe(1);
};

const expectDifferentSongs = (titles: string[]) => {
	const normalized = new Set(titles.map(normalizeSalesTitle));
	expect(normalized.size, [...normalized].join(' / ')).toBe(titles.length);
};

describe('normalizeSalesTitle', () => {
	it('OST 표기만 다른 곡은 같은 곡으로 본다', () => {
		expectSameSong(['벼랑 위의 포뇨 Main Theme', '벼랑 위의 포뇨 Main Theme (벼랑 위의 포뇨 OST)']);
		expect(normalizeSalesTitle('벼랑 위의 포뇨 Main Theme (벼랑 위의 포뇨 OST)')).toBe('벼랑 위의 포뇨 Main Theme');
		expectSameSong(['벼랑 위의 포뇨 Main Theme (in A)', '벼랑 위의 포뇨 Main Theme (벼랑 위의 포뇨 OST) in A']);
		expectSameSong(['Nimbus 2000 (해리 포터와 마법사의 돌 OST)', 'Nimbus 2000 (Harry Potter OST)']);
		expectSameSong([
			'Angel Of Music (The Phantom Of The Opera OST)',
			'Angel Of Music (The Phantom Of The Opera_오페라의 유령 OST)',
		]);
	});

	it('한/영 제목 순서가 다른 동물의 사육제 곡을 합친다', () => {
		expectSameSong([
			'Le Carnaval des Animaux No.13, Le Cygne',
			'Le Cygne (Le Carnaval des Animaux_동물의 사육제 중 백조)',
		]);
		expectSameSong([
			'Le Carnaval des Animaux No.1, Le Lion',
			'Le Lion (Le Carnaval des Animaux_동물의 사육제 중 사자)',
		]);
		expectSameSong([
			'Le Carnaval des Animaux No.1, Le Lion (Short Version)',
			'Le Lion (Le Carnaval des Animaux_동물의 사육제 중 사자) Short Version',
		]);
		expectSameSong([
			'Le Carnaval des Animaux No.4, Tortues',
			'Turtles (Le Carnaval des Animaux_동물의 사육제 중 거북이)',
		]);
	});

	it('표기 차이만 있는 곡을 합친다', () => {
		expectSameSong([
			'String Quartet No.1 II.Andante Cantabile (안단테 칸타빌레)',
			'String Quartet No.1 Andante Cantabile (안단테 칸타빌레)',
		]);
		expectSameSong([
			'Piano trio no.2 E-flat D.929 op.100 2nd mvt (해피엔드 OST)',
			'Piano trio no.2 E-flat D.929 op.100 2nd',
		]);
		expectSameSong(['Preghiera (Piano concerto No.2 mov.2)', 'Preghiera (기도)']);
		expectSameSong([
			'Death and the Maiden (죽음과 소녀) String Quartet No.14 D.810 1. Allegro',
			'Death and the Maiden (죽음과 소녀) String Quartet No.14 D.810 1.Allegro',
		]);
		expectSameSong([
			'Il Barbiere di Siviglia Overture (세비야의 이발사 서곡)',
			'Il Barbiere di Siviglia Overture (세빌리야의 이발사 서곡)',
		]);
	});

	it('브란덴부르크 협주곡 3번은 1악장으로 합친다', () => {
		expectSameSong([
			'Brandenburg Concerto No. 3 in G Major 1st Mov (BWV 1048)',
			'Brandenburg Concerto No. 3 in G Major (BWV 1048)',
		]);
		expectSameSong([
			'Brandenburg Concerto No. 3 in G Major 1st Mov (BWV 1048) Easy version',
			'Brandenburg Concerto No. 3 in G Major (BWV 1048) Easy version',
		]);
		expectSameSong([
			'Brandenburg Concerto No. 3 in G Major 1st Mov (BWV 1048) Easy version in C',
			'Brandenburg Concerto No. 3 in G Major (BWV 1048) Easy version in C',
		]);
	});

	it('G선상의 아리아 C Major는 in C 버전으로 일반 버전과 구분한다', () => {
		expect(normalizeSalesTitle('Air On The G String C Major (G선상의 아리아)')).toBe(
			'Air On The G String (G선상의 아리아) in C',
		);
		expectDifferentSongs(['Air On The G String C Major (G선상의 아리아)', 'Air On The G String (G선상의 아리아)']);
	});

	it('편성만 다른 파사칼리아는 같은 곡으로 본다', () => {
		expectSameSong(['Passacaglia (파사칼리아)', 'Passacaglia (파사칼리아) 첼로 낮은음자리표 악보']);
	});

	it('버전 표기 대소문자 차이는 무시한다', () => {
		expectSameSong(['Die Forelle (The Trout_송어) Easy Version', 'Die Forelle (The Trout_송어) Easy version']);
		expectSameSong([
			'The Four Seasons - Summer 3rd Movement (사계_여름 3악장) Storm (Easy version)',
			'The Four Seasons - Summer 3rd Movement (사계_여름 3악장) Storm (Easy Version)',
			'The Four Seasons - Summer 3rd Movement (사계_여름 3악장) Easy Version',
		]);
	});

	it('보이지 않는 BOM 문자를 제거한다', () => {
		expectSameSong(["Plaisir d'amo\uFEFFur (Easy Version) in G", "Plaisir d'amour (Easy Version) in G"]);
	});

	it('버전·이조·악장이 다르면 다른 곡으로 둔다', () => {
		expectDifferentSongs([
			'벼랑 위의 포뇨 Main Theme',
			'벼랑 위의 포뇨 Main Theme (in C)',
			'벼랑 위의 포뇨 Main Theme (in G)',
		]);
		expectDifferentSongs(['Passacaglia (파사칼리아)', 'Passacaglia (파사칼리아) Easy Version', 'Passacaglia (파사칼리아) Hard Version']);
		expectDifferentSongs([
			'The Four Seasons - Winter 1st Movement (사계_겨울 1악장)',
			'The Four Seasons - Winter 2nd Movement (사계_겨울 2악장)',
		]);
		expectDifferentSongs(['Ave Maria (아베마리아_구노)', 'Ave Maria D.839 B flat Major (아베마리아_슈베르트)']);
	});
});
