// 연도별 작품 판매 수에서 같은 곡의 상품명 표기 차이(OST 표기, 한/영 제목 순서, 띄어쓰기)를 하나로 합친다.
// 버전(easy/hard/pro/short), 이조(in C 등), 악장이 다르면 다른 곡으로 남긴다.
export const normalizeSalesTitle = (title: string): string =>
	title.replace(/\uFEFF/g, '').trim()
		.replace(/세빌리야의 이발사 서곡/g, '세비야의 이발사 서곡')
		.replace(/Le Carnaval des Animaux No\.1, Le Lion/g, 'Le Lion (Le Carnaval des Animaux_동물의 사육제 중 사자)')
		.replace(/Le Carnaval des Animaux No\.13, Le Cygne/g, 'Le Cygne (Le Carnaval des Animaux_동물의 사육제 중 백조)')
		.replace(/Le Carnaval des Animaux No\.6, Kangourous/g, 'Kangourous (Le Carnaval des Animaux_동물의 사육제 중 캥거루)')
		.replace(/Le Carnaval des Animaux No\.4, Tortues/g, 'Tortues (Le Carnaval des Animaux_동물의 사육제 중 거북이)')
		.replace(/^([^()]+) \(Le Carnaval des Animaux_동물의 사육제 중 ([^)]+)\)(.*)$/i, 'Le Carnaval des Animaux - $1 ($2)$3')
		.replace(/Le Carnaval des Animaux - Turtles \(거북이\)/i, 'Le Carnaval des Animaux - Tortues (거북이)')
		.replace(/version\s*2/gi, 'version')
		.replace(/String Quartet No\.1 Andante Cantabile \(안단테 칸타빌레\)/g, 'String Quartet No.1 II.Andante Cantabile (안단테 칸타빌레)')
		.replace(/(The Four Seasons - Summer 3rd Movement \(사계_여름 3악장\)) easy version/i, '$1 Storm easy version')
		// 악장 표기가 없는 브란덴부르크 협주곡 3번은 1악장이다.
		.replace(/Brandenburg Concerto No\. 3 in G Major \(BWV 1048\)/g, 'Brandenburg Concerto No. 3 in G Major 1st Mov (BWV 1048)')
		// "C Major"는 원곡 조성이 아닌 C장조 이조 버전이라 일반 버전과 구분한다.
		.replace(/^Air On The G String C Major (\(G선상의 아리아\))(.*)$/, (_, name: string, rest: string) =>
			`Air On The G String ${name}${rest.trim() ? rest : ' in C'}`)
		.replace(/^Preghiera \(기도\)/, 'Preghiera (Piano concerto No.2 mov.2)')
		.replace(/D\.810 1\.Allegro/g, 'D.810 1. Allegro')
		// 편성(악보 음자리표)만 다른 표기는 같은 곡으로 본다.
		.replace(/\s*첼로 낮은음자리표 악보$/, '')
		.replace(/\bmvt\.?/gi, '')
		.replace(/\s*\([^()]*OST[^()]*\)/gi, '')
		.replace(/\s+\((in\s+[A-G](?:#|b|♯|♭)?(?:m|(?:\s+(?:major|minor)))?)\)$/i, ' $1')
		.replace(/\s+\(((?:easy|hard|pro|short|long)\s+(?:version|ver\.))\)$/i, ' $1')
		.replace(/\s+((?:easy|hard|pro|short|long)\s+(?:version|ver\.))$/i, (_, version: string) => ` ${version.toLowerCase()}`)
		.replace(/\s+/g, ' ')
		.trim();
