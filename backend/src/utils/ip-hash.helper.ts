import { createHash } from 'crypto';

/**
 * IP 주소 해싱 유틸리티
 * SHA-256을 사용하여 IP 주소를 안전하게 해싱
 * 원본 IP 주소는 저장하지 않고 해시 값만 저장하여 개인정보 보호
 */

/**
 * IP 주소를 SHA-256으로 해싱
 * @param ip IP 주소 (IPv4 또는 IPv6)
 * @param salt 선택적 솔트 값 (환경변수에서 가져오는 것을 권장)
 * @returns SHA-256 해시 문자열 (64자 hex)
 */
export function hashIp(ip: string, salt?: string): string {
  const saltValue = salt || process.env.IP_HASH_SALT || 'whisper-board-salt';
  const hash = createHash('sha256');
  hash.update(`${ip}:${saltValue}`);
  return hash.digest('hex');
}

/**
 * Request 객체에서 실제 IP 주소 추출
 * 프록시 환경을 고려하여 X-Forwarded-For, X-Real-IP 헤더도 확인
 * @param request Express Request 객체 또는 IP 관련 헤더를 포함한 객체
 * @returns IP 주소 문자열
 */
export function getClientIp(request: any): string {
  // X-Forwarded-For 헤더 확인 (프록시 뒤에 있을 때)
  const forwardedFor = request.headers['x-forwarded-for'];
  if (forwardedFor) {
    const ips = forwardedFor.split(',');
    return ips[0].trim();
  }

  // X-Real-IP 헤더 확인 (nginx 등)
  const realIp = request.headers['x-real-ip'];
  if (realIp) {
    return realIp;
  }

  // 직접 연결된 경우
  return request.ip || request.connection?.remoteAddress || '0.0.0.0';
}

/**
 * Request 객체에서 IP를 추출하고 바로 해싱
 * @param request Express Request 객체
 * @param salt 선택적 솔트 값
 * @returns SHA-256 해시 문자열
 */
export function hashClientIp(request: any, salt?: string): string {
  const ip = getClientIp(request);
  return hashIp(ip, salt);
}

/**
 * IPv6 주소를 정규화 (IPv4-mapped IPv6 주소를 IPv4로 변환)
 * @param ip IP 주소
 * @returns 정규화된 IP 주소
 */
export function normalizeIp(ip: string): string {
  // IPv4-mapped IPv6 주소를 IPv4로 변환
  // ::ffff:192.0.2.1 -> 192.0.2.1
  if (ip.startsWith('::ffff:')) {
    return ip.substring(7);
  }

  // localhost 표현 통일
  if (ip === '::1' || ip === '127.0.0.1') {
    return '127.0.0.1';
  }

  return ip;
}
