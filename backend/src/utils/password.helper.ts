import * as bcrypt from 'bcrypt';

/**
 * 비밀번호 해싱 및 검증 유틸리티
 * bcrypt를 사용하여 안전한 비밀번호 저장
 */

const SALT_ROUNDS = 10;

/**
 * 비밀번호를 bcrypt로 해싱
 * @param password 평문 비밀번호
 * @returns bcrypt 해시 문자열
 */
export async function hashPassword(password: string): Promise<string> {
  if (!password || password.trim().length === 0) {
    throw new Error('비밀번호는 비어있을 수 없습니다');
  }

  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * 비밀번호와 해시를 비교하여 검증
 * @param password 평문 비밀번호
 * @param hash bcrypt 해시 문자열
 * @returns 비밀번호가 일치하면 true, 아니면 false
 */
export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  if (!password || !hash) {
    return false;
  }

  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    return false;
  }
}

/**
 * 비밀번호 강도 검증
 * @param password 평문 비밀번호
 * @returns 검증 결과 객체
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!password) {
    errors.push('비밀번호는 필수입니다');
    return { isValid: false, errors };
  }

  if (password.length < 4) {
    errors.push('비밀번호는 최소 4자 이상이어야 합니다');
  }

  if (password.length > 100) {
    errors.push('비밀번호는 최대 100자까지 가능합니다');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * 비밀번호가 제공되었는지 확인하고 해싱
 * @param password 평문 비밀번호 (optional)
 * @returns 해시 문자열 또는 null
 */
export async function hashPasswordIfProvided(
  password?: string,
): Promise<string | null> {
  if (!password || password.trim().length === 0) {
    return null;
  }

  const validation = validatePasswordStrength(password);
  if (!validation.isValid) {
    throw new Error(validation.errors.join(', '));
  }

  return hashPassword(password);
}
