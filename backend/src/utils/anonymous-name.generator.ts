/**
 * 랜덤 익명 닉네임 생성기
 * 형용사 + 명사 조합으로 재미있는 닉네임 생성
 */

const ADJECTIVES = [
  '행복한',
  '슬픈',
  '화난',
  '즐거운',
  '신비로운',
  '용감한',
  '겁많은',
  '느긋한',
  '바쁜',
  '게으른',
  '똑똑한',
  '귀여운',
  '멋진',
  '이상한',
  '평범한',
  '특별한',
  '작은',
  '큰',
  '빠른',
  '느린',
  '조용한',
  '시끄러운',
  '따뜻한',
  '차가운',
  '밝은',
  '어두운',
  '신선한',
  '오래된',
  '새로운',
  '낡은',
  '깨끗한',
  '더러운',
  '달콤한',
  '쓴',
  '매운',
  '짠',
  '고소한',
  '시원한',
  '뜨거운',
  '차가운',
  '반짝이는',
  '빛나는',
  '투명한',
  '불투명한',
  '무거운',
  '가벼운',
  '단단한',
  '부드러운',
  '거친',
  '매끈한',
];

const NOUNS = [
  '고양이',
  '강아지',
  '토끼',
  '호랑이',
  '사자',
  '코끼리',
  '기린',
  '펭귄',
  '돌고래',
  '상어',
  '독수리',
  '참새',
  '까마귀',
  '비둘기',
  '앵무새',
  '햄스터',
  '다람쥐',
  '여우',
  '늑대',
  '곰',
  '판다',
  '코알라',
  '캥거루',
  '얼룩말',
  '하마',
  '악어',
  '거북이',
  '달팽이',
  '나비',
  '벌',
  '개미',
  '사슴',
  '양',
  '염소',
  '말',
  '당나귀',
  '낙타',
  '치타',
  '표범',
  '재규어',
  '미어캣',
  '수달',
  '물개',
  '바다표범',
  '고래',
  '문어',
  '오징어',
  '해파리',
  '불가사리',
  '소라',
  '조개',
  '게',
  '새우',
  '랍스터',
  '거미',
  '전갈',
  '도마뱀',
  '카멜레온',
  '이구아나',
  '개구리',
  '두꺼비',
  '올챙이',
  '공룡',
  '드래곤',
  '유니콘',
  '피닉스',
  '구미호',
  '용',
];

/**
 * 랜덤 익명 닉네임 생성
 * @returns 형용사 + 명사 조합의 닉네임
 */
export function generateAnonymousName(): string {
  const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  return `${adjective} ${noun}`;
}

/**
 * 시드 값을 기반으로 결정적인 닉네임 생성
 * @param seed 시드 값 (예: IP 해시)
 * @returns 형용사 + 명사 조합의 닉네임
 */
export function generateAnonymousNameFromSeed(seed: string): string {
  const hash = seed.split('').reduce((acc, char) => {
    return ((acc << 5) - acc + char.charCodeAt(0)) | 0;
  }, 0);

  const adjectiveIndex = Math.abs(hash) % ADJECTIVES.length;
  const nounIndex = Math.abs(hash >> 8) % NOUNS.length;

  return `${ADJECTIVES[adjectiveIndex]} ${NOUNS[nounIndex]}`;
}

/**
 * 닉네임 풀 크기 반환
 * @returns 가능한 닉네임 조합의 총 개수
 */
export function getNamePoolSize(): number {
  return ADJECTIVES.length * NOUNS.length;
}
