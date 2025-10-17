import {
  generateAnonymousColor,
  generateAnonymousColorFromSeed,
  getColorPoolSize,
  getColorBrightness,
  getContrastTextColor,
} from './anonymous-color.generator';

describe('AnonymousColorGenerator', () => {
  describe('generateAnonymousColor', () => {
    it('색상을 생성해야 함', () => {
      const color = generateAnonymousColor();
      expect(color).toBeDefined();
      expect(typeof color).toBe('string');
      expect(color).toMatch(/^#[0-9A-F]{6}$/i);
    });

    it('여러 번 호출 시 유효한 HEX 색상 코드를 반환해야 함', () => {
      for (let i = 0; i < 100; i++) {
        const color = generateAnonymousColor();
        expect(color).toMatch(/^#[0-9A-F]{6}$/i);
      }
    });
  });

  describe('generateAnonymousColorFromSeed', () => {
    it('동일한 시드에 대해 동일한 색상을 생성해야 함', () => {
      const seed = 'test-seed-123';
      const color1 = generateAnonymousColorFromSeed(seed);
      const color2 = generateAnonymousColorFromSeed(seed);
      expect(color1).toBe(color2);
    });

    it('다른 시드에 대해 다른 색상을 생성할 가능성이 높음', () => {
      const colors = new Set();
      for (let i = 0; i < 100; i++) {
        colors.add(generateAnonymousColorFromSeed(`seed-${i}`));
      }
      expect(colors.size).toBeGreaterThan(10);
    });

    it('유효한 HEX 색상 코드를 반환해야 함', () => {
      const color = generateAnonymousColorFromSeed('test-seed');
      expect(color).toMatch(/^#[0-9A-F]{6}$/i);
    });
  });

  describe('getColorPoolSize', () => {
    it('색상 팔레트 크기를 반환해야 함', () => {
      const poolSize = getColorPoolSize();
      expect(poolSize).toBeGreaterThan(0);
      expect(typeof poolSize).toBe('number');
    });

    it('30개의 색상이 있어야 함', () => {
      const poolSize = getColorPoolSize();
      expect(poolSize).toBe(30);
    });
  });

  describe('getColorBrightness', () => {
    it('흰색의 밝기는 높아야 함', () => {
      const brightness = getColorBrightness('#FFFFFF');
      expect(brightness).toBeCloseTo(255, 0);
    });

    it('검은색의 밝기는 낮아야 함', () => {
      const brightness = getColorBrightness('#000000');
      expect(brightness).toBe(0);
    });

    it('0-255 범위의 값을 반환해야 함', () => {
      const colors = ['#FF0000', '#00FF00', '#0000FF', '#888888'];
      colors.forEach((color) => {
        const brightness = getColorBrightness(color);
        expect(brightness).toBeGreaterThanOrEqual(0);
        expect(brightness).toBeLessThanOrEqual(255);
      });
    });
  });

  describe('getContrastTextColor', () => {
    it('밝은 배경에는 검은색 텍스트를 반환해야 함', () => {
      const textColor = getContrastTextColor('#FFFFFF');
      expect(textColor).toBe('#000000');
    });

    it('어두운 배경에는 흰색 텍스트를 반환해야 함', () => {
      const textColor = getContrastTextColor('#000000');
      expect(textColor).toBe('#FFFFFF');
    });

    it('중간 밝기 색상에 대해 적절한 대비 색상을 반환해야 함', () => {
      const textColor = getContrastTextColor('#808080');
      expect(textColor).toMatch(/^#(000000|FFFFFF)$/);
    });
  });
});
