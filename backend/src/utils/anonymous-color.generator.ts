/**
 * 랜덤 익명 색상 생성기
 * 읽기 쉽고 구별하기 좋은 색상 팔레트에서 선택
 */

const COLOR_PALETTE = [
  '#FF6B6B', // 빨강
  '#4ECDC4', // 청록
  '#45B7D1', // 하늘색
  '#FFA07A', // 연어색
  '#98D8C8', // 민트
  '#F7DC6F', // 노랑
  '#BB8FCE', // 라벤더
  '#85C1E2', // 파랑
  '#F8B500', // 주황
  '#52B788', // 초록
  '#E63946', // 진한 빨강
  '#457B9D', // 남색
  '#F4A261', // 복숭아
  '#2A9D8F', // 청록색
  '#E76F51', // 테라코타
  '#8338EC', // 보라
  '#FF006E', // 마젠타
  '#FB5607', // 오렌지
  '#FFBE0B', // 금색
  '#3A86FF', // 파랑
  '#06FFA5', // 네온 민트
  '#C77DFF', // 연보라
  '#FF99C8', // 핑크
  '#FCF6BD', // 크림
  '#D0F4DE', // 연초록
  '#A9DEF9', // 연파랑
  '#E4C1F9', // 연보라
  '#FF9770', // 코랄
  '#FFD670', // 골드
  '#70D6FF', // 스카이블루
];

/**
 * 랜덤 색상 생성
 * @returns HEX 색상 코드
 */
export function generateAnonymousColor(): string {
  return COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)];
}

/**
 * 시드 값을 기반으로 결정적인 색상 생성
 * @param seed 시드 값 (예: IP 해시)
 * @returns HEX 색상 코드
 */
export function generateAnonymousColorFromSeed(seed: string): string {
  const hash = seed.split('').reduce((acc, char) => {
    return ((acc << 5) - acc + char.charCodeAt(0)) | 0;
  }, 0);

  const colorIndex = Math.abs(hash) % COLOR_PALETTE.length;
  return COLOR_PALETTE[colorIndex];
}

/**
 * 색상 팔레트 크기 반환
 * @returns 사용 가능한 색상의 총 개수
 */
export function getColorPoolSize(): number {
  return COLOR_PALETTE.length;
}

/**
 * 색상의 밝기를 계산 (WCAG 기준)
 * @param hexColor HEX 색상 코드
 * @returns 0-255 사이의 밝기 값
 */
export function getColorBrightness(hexColor: string): number {
  const rgb = hexToRgb(hexColor);
  if (!rgb) return 0;

  return (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
}

/**
 * HEX 색상을 RGB로 변환
 * @param hex HEX 색상 코드
 * @returns RGB 객체 또는 null
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * 색상에 적합한 텍스트 색상 반환 (접근성 고려)
 * @param backgroundColor 배경 HEX 색상 코드
 * @returns 텍스트에 적합한 HEX 색상 코드 (흰색 또는 검정색)
 */
export function getContrastTextColor(backgroundColor: string): string {
  const brightness = getColorBrightness(backgroundColor);
  return brightness > 128 ? '#000000' : '#FFFFFF';
}
