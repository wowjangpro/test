import {
  generateAnonymousName,
  generateAnonymousNameFromSeed,
  getNamePoolSize,
} from './anonymous-name.generator';

describe('AnonymousNameGenerator', () => {
  describe('generateAnonymousName', () => {
    it('닉네임을 생성해야 함', () => {
      const name = generateAnonymousName();
      expect(name).toBeDefined();
      expect(typeof name).toBe('string');
      expect(name.length).toBeGreaterThan(0);
    });

    it('형용사와 명사가 공백으로 구분되어야 함', () => {
      const name = generateAnonymousName();
      const parts = name.split(' ');
      expect(parts.length).toBe(2);
      expect(parts[0].length).toBeGreaterThan(0);
      expect(parts[1].length).toBeGreaterThan(0);
    });

    it('여러 번 호출 시 다양한 닉네임이 생성되어야 함', () => {
      const names = new Set();
      for (let i = 0; i < 100; i++) {
        names.add(generateAnonymousName());
      }
      expect(names.size).toBeGreaterThan(10);
    });
  });

  describe('generateAnonymousNameFromSeed', () => {
    it('동일한 시드에 대해 동일한 닉네임을 생성해야 함', () => {
      const seed = 'test-seed-123';
      const name1 = generateAnonymousNameFromSeed(seed);
      const name2 = generateAnonymousNameFromSeed(seed);
      expect(name1).toBe(name2);
    });

    it('다른 시드에 대해 다른 닉네임을 생성해야 함', () => {
      const name1 = generateAnonymousNameFromSeed('seed1');
      const name2 = generateAnonymousNameFromSeed('seed2');
      expect(name1).not.toBe(name2);
    });

    it('형용사와 명사가 공백으로 구분되어야 함', () => {
      const name = generateAnonymousNameFromSeed('test-seed');
      const parts = name.split(' ');
      expect(parts.length).toBe(2);
    });
  });

  describe('getNamePoolSize', () => {
    it('닉네임 풀 크기를 반환해야 함', () => {
      const poolSize = getNamePoolSize();
      expect(poolSize).toBeGreaterThan(0);
      expect(typeof poolSize).toBe('number');
    });

    it('형용사 50개 * 명사 68개 = 3400 조합이어야 함', () => {
      const poolSize = getNamePoolSize();
      expect(poolSize).toBe(3400);
    });
  });
});
