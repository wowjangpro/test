import {
  hashPassword,
  verifyPassword,
  validatePasswordStrength,
  hashPasswordIfProvided,
} from './password.helper';

describe('PasswordHelper', () => {
  describe('hashPassword', () => {
    it('비밀번호를 해시로 변환해야 함', async () => {
      const password = 'test1234';
      const hash = await hashPassword(password);

      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
      expect(hash).not.toBe(password);
      expect(hash.startsWith('$2')).toBe(true); // bcrypt 해시는 $2로 시작
    });

    it('동일한 비밀번호도 다른 해시를 생성해야 함 (salt 때문)', async () => {
      const password = 'test1234';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      expect(hash1).not.toBe(hash2);
    });

    it('빈 비밀번호는 에러를 발생시켜야 함', async () => {
      await expect(hashPassword('')).rejects.toThrow('비어있을 수 없습니다');
    });

    it('공백만 있는 비밀번호는 에러를 발생시켜야 함', async () => {
      await expect(hashPassword('   ')).rejects.toThrow('비어있을 수 없습니다');
    });
  });

  describe('verifyPassword', () => {
    it('올바른 비밀번호는 검증에 성공해야 함', async () => {
      const password = 'test1234';
      const hash = await hashPassword(password);

      const isValid = await verifyPassword(password, hash);
      expect(isValid).toBe(true);
    });

    it('잘못된 비밀번호는 검증에 실패해야 함', async () => {
      const password = 'test1234';
      const hash = await hashPassword(password);

      const isValid = await verifyPassword('wrong-password', hash);
      expect(isValid).toBe(false);
    });

    it('빈 비밀번호는 false를 반환해야 함', async () => {
      const hash = await hashPassword('test1234');
      const isValid = await verifyPassword('', hash);
      expect(isValid).toBe(false);
    });

    it('빈 해시는 false를 반환해야 함', async () => {
      const isValid = await verifyPassword('test1234', '');
      expect(isValid).toBe(false);
    });

    it('잘못된 형식의 해시는 false를 반환해야 함', async () => {
      const isValid = await verifyPassword('test1234', 'invalid-hash');
      expect(isValid).toBe(false);
    });
  });

  describe('validatePasswordStrength', () => {
    it('유효한 비밀번호는 검증에 성공해야 함', () => {
      const result = validatePasswordStrength('test1234');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('4자 미만 비밀번호는 검증에 실패해야 함', () => {
      const result = validatePasswordStrength('abc');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('비밀번호는 최소 4자 이상이어야 합니다');
    });

    it('100자 초과 비밀번호는 검증에 실패해야 함', () => {
      const longPassword = 'a'.repeat(101);
      const result = validatePasswordStrength(longPassword);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        '비밀번호는 최대 100자까지 가능합니다',
      );
    });

    it('빈 비밀번호는 검증에 실패해야 함', () => {
      const result = validatePasswordStrength('');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('비밀번호는 필수입니다');
    });

    it('4자 비밀번호는 검증에 성공해야 함', () => {
      const result = validatePasswordStrength('1234');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('100자 비밀번호는 검증에 성공해야 함', () => {
      const password = 'a'.repeat(100);
      const result = validatePasswordStrength(password);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('hashPasswordIfProvided', () => {
    it('비밀번호가 제공되면 해시를 반환해야 함', async () => {
      const password = 'test1234';
      const hash = await hashPasswordIfProvided(password);

      expect(hash).not.toBeNull();
      expect(typeof hash).toBe('string');
      expect(hash?.startsWith('$2')).toBe(true);
    });

    it('비밀번호가 없으면 null을 반환해야 함', async () => {
      const hash = await hashPasswordIfProvided();
      expect(hash).toBeNull();
    });

    it('빈 문자열이면 null을 반환해야 함', async () => {
      const hash = await hashPasswordIfProvided('');
      expect(hash).toBeNull();
    });

    it('공백만 있으면 null을 반환해야 함', async () => {
      const hash = await hashPasswordIfProvided('   ');
      expect(hash).toBeNull();
    });

    it('유효하지 않은 비밀번호는 에러를 발생시켜야 함', async () => {
      await expect(hashPasswordIfProvided('abc')).rejects.toThrow(
        '최소 4자 이상',
      );
    });
  });
});
