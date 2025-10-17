import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { getClientIp } from '../../utils/ip-hash.helper';

/**
 * 클라이언트 IP 주소를 추출하는 커스텀 데코레이터
 * @example
 * @Post()
 * create(@ClientIp() ip: string) {
 *   console.log('Client IP:', ip);
 * }
 */
export const ClientIp = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    return getClientIp(request);
  },
);
