import { hashIp, getClientIp, hashClientIp, normalizeIp } from './ip-hash.helper';

describe('IpHashHelper', () => {
  describe('hashIp', () => {
    it('IP 주소를 SHA-256 해시로 변환해야 함', () => {
      const ip = '192.168.1.1';
      const hash = hashIp(ip);

      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
      expect(hash.length).toBe(64); // SHA-256은 64자 hex
      expect(hash).toMatch(/^[a-f0-9]{64}$/);
    });

    it('동일한 IP는 동일한 해시를 생성해야 함', () => {
      const ip = '192.168.1.1';
      const hash1 = hashIp(ip);
      const hash2 = hashIp(ip);

      expect(hash1).toBe(hash2);
    });

    it('다른 IP는 다른 해시를 생성해야 함', () => {
      const hash1 = hashIp('192.168.1.1');
      const hash2 = hashIp('192.168.1.2');

      expect(hash1).not.toBe(hash2);
    });

    it('솔트를 사용하면 다른 해시를 생성해야 함', () => {
      const ip = '192.168.1.1';
      const hash1 = hashIp(ip, 'salt1');
      const hash2 = hashIp(ip, 'salt2');

      expect(hash1).not.toBe(hash2);
    });

    it('IPv6 주소도 해싱할 수 있어야 함', () => {
      const ipv6 = '2001:0db8:85a3:0000:0000:8a2e:0370:7334';
      const hash = hashIp(ipv6);

      expect(hash).toBeDefined();
      expect(hash.length).toBe(64);
    });
  });

  describe('getClientIp', () => {
    it('X-Forwarded-For 헤더에서 IP를 추출해야 함', () => {
      const request = {
        headers: {
          'x-forwarded-for': '203.0.113.1, 198.51.100.1',
        },
      };

      const ip = getClientIp(request);
      expect(ip).toBe('203.0.113.1');
    });

    it('X-Real-IP 헤더에서 IP를 추출해야 함', () => {
      const request = {
        headers: {
          'x-real-ip': '203.0.113.1',
        },
      };

      const ip = getClientIp(request);
      expect(ip).toBe('203.0.113.1');
    });

    it('request.ip에서 IP를 추출해야 함', () => {
      const request = {
        headers: {},
        ip: '203.0.113.1',
      };

      const ip = getClientIp(request);
      expect(ip).toBe('203.0.113.1');
    });

    it('connection.remoteAddress에서 IP를 추출해야 함', () => {
      const request = {
        headers: {},
        connection: {
          remoteAddress: '203.0.113.1',
        },
      };

      const ip = getClientIp(request);
      expect(ip).toBe('203.0.113.1');
    });

    it('IP를 찾을 수 없으면 기본값을 반환해야 함', () => {
      const request = {
        headers: {},
      };

      const ip = getClientIp(request);
      expect(ip).toBe('0.0.0.0');
    });
  });

  describe('hashClientIp', () => {
    it('request에서 IP를 추출하고 해싱해야 함', () => {
      const request = {
        headers: {},
        ip: '192.168.1.1',
      };

      const hash = hashClientIp(request);
      expect(hash).toBeDefined();
      expect(hash.length).toBe(64);
      expect(hash).toBe(hashIp('192.168.1.1'));
    });
  });

  describe('normalizeIp', () => {
    it('IPv4-mapped IPv6 주소를 IPv4로 변환해야 함', () => {
      const ip = '::ffff:192.0.2.1';
      const normalized = normalizeIp(ip);
      expect(normalized).toBe('192.0.2.1');
    });

    it('::1을 127.0.0.1로 변환해야 함', () => {
      const ip = '::1';
      const normalized = normalizeIp(ip);
      expect(normalized).toBe('127.0.0.1');
    });

    it('127.0.0.1은 그대로 유지해야 함', () => {
      const ip = '127.0.0.1';
      const normalized = normalizeIp(ip);
      expect(normalized).toBe('127.0.0.1');
    });

    it('일반 IPv4 주소는 그대로 유지해야 함', () => {
      const ip = '192.168.1.1';
      const normalized = normalizeIp(ip);
      expect(normalized).toBe('192.168.1.1');
    });

    it('일반 IPv6 주소는 그대로 유지해야 함', () => {
      const ip = '2001:0db8:85a3::8a2e:0370:7334';
      const normalized = normalizeIp(ip);
      expect(normalized).toBe('2001:0db8:85a3::8a2e:0370:7334');
    });
  });
});
