import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Reports API (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let testPostId: string;
  let testCommentId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));

    prisma = app.get<PrismaService>(PrismaService);

    await app.init();

    // 테스트용 게시글 생성
    const post = await prisma.post.create({
      data: {
        title: '신고 테스트 게시글',
        content: '신고 테스트 내용',
        anonymous_name: '익명1',
        anonymous_color: '#FF0000',
        ip_hash: 'test-hash',
      },
    });

    testPostId = post.id;

    // 테스트용 댓글 생성
    const comment = await prisma.comment.create({
      data: {
        post_id: testPostId,
        content: '신고 테스트 댓글',
        anonymous_name: '익명2',
        anonymous_color: '#00FF00',
        ip_hash: 'test-hash',
        depth: 0,
      },
    });

    testCommentId = comment.id;
  });

  afterAll(async () => {
    // 테스트 데이터 정리
    await prisma.report.deleteMany({
      where: {
        OR: [{ target_id: testPostId }, { target_id: testCommentId }],
      },
    });

    await prisma.comment.deleteMany({
      where: { id: testCommentId },
    });

    await prisma.post.deleteMany({
      where: { id: testPostId },
    });

    await app.close();
  });

  describe('POST /reports', () => {
    beforeEach(async () => {
      // 각 테스트 전 신고 데이터 정리
      await prisma.report.deleteMany({
        where: {
          OR: [{ target_id: testPostId }, { target_id: testCommentId }],
        },
      });
    });

    it('게시글을 신고할 수 있어야 함', async () => {
      const response = await request(app.getHttpServer())
        .post('/reports')
        .send({
          targetType: 'post',
          targetId: testPostId,
          reason: 'spam',
          description: '스팸 게시글입니다.',
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.target_type).toBe('post');
      expect(response.body.target_id).toBe(testPostId);
      expect(response.body.reason).toBe('spam');
      expect(response.body.status).toBe('pending');
    });

    it('댓글을 신고할 수 있어야 함', async () => {
      const response = await request(app.getHttpServer())
        .post('/reports')
        .send({
          targetType: 'comment',
          targetId: testCommentId,
          reason: 'inappropriate',
          description: '부적절한 댓글입니다.',
        })
        .expect(201);

      expect(response.body.target_type).toBe('comment');
      expect(response.body.target_id).toBe(testCommentId);
      expect(response.body.reason).toBe('inappropriate');
    });

    it('description 없이 신고할 수 있어야 함', async () => {
      const response = await request(app.getHttpServer())
        .post('/reports')
        .send({
          targetType: 'post',
          targetId: testPostId,
          reason: 'harassment',
        })
        .expect(201);

      expect(response.body.description).toBeNull();
    });

    it('중복 신고 시 실패해야 함', async () => {
      // 첫 번째 신고
      await request(app.getHttpServer())
        .post('/reports')
        .send({
          targetType: 'post',
          targetId: testPostId,
          reason: 'spam',
        })
        .expect(201);

      // 동일한 IP에서 중복 신고
      await request(app.getHttpServer())
        .post('/reports')
        .send({
          targetType: 'post',
          targetId: testPostId,
          reason: 'spam',
        })
        .expect(409);
    });

    it('잘못된 targetType 입력 시 실패해야 함', async () => {
      await request(app.getHttpServer())
        .post('/reports')
        .send({
          targetType: 'invalid',
          targetId: testPostId,
          reason: 'spam',
        })
        .expect(400);
    });

    it('잘못된 reason 입력 시 실패해야 함', async () => {
      await request(app.getHttpServer())
        .post('/reports')
        .send({
          targetType: 'post',
          targetId: testPostId,
          reason: 'invalid_reason',
        })
        .expect(400);
    });

    it('targetId 없이 신고 시 실패해야 함', async () => {
      await request(app.getHttpServer())
        .post('/reports')
        .send({
          targetType: 'post',
          reason: 'spam',
        })
        .expect(400);
    });

    it('description이 1000자 초과 시 실패해야 함', async () => {
      const longDescription = 'a'.repeat(1001);

      await request(app.getHttpServer())
        .post('/reports')
        .send({
          targetType: 'post',
          targetId: testPostId,
          reason: 'spam',
          description: longDescription,
        })
        .expect(400);
    });
  });

  describe('GET /reports', () => {
    beforeAll(async () => {
      // 테스트용 신고 데이터 생성
      await prisma.report.deleteMany({
        where: {
          OR: [{ target_id: testPostId }, { target_id: testCommentId }],
        },
      });

      await prisma.report.createMany({
        data: [
          {
            target_type: 'post',
            target_id: testPostId,
            reason: 'spam',
            ip_hash: 'hash-1',
            status: 'pending',
          },
          {
            target_type: 'post',
            target_id: testPostId,
            reason: 'inappropriate',
            ip_hash: 'hash-2',
            status: 'pending',
          },
          {
            target_type: 'comment',
            target_id: testCommentId,
            reason: 'harassment',
            ip_hash: 'hash-3',
            status: 'resolved',
          },
        ],
      });
    });

    it('신고 목록을 조회할 수 있어야 함', async () => {
      const response = await request(app.getHttpServer())
        .get('/reports')
        .expect(200);

      expect(response.body).toHaveProperty('reports');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.reports)).toBe(true);
      expect(response.body.reports.length).toBeGreaterThan(0);
    });

    it('status로 필터링할 수 있어야 함', async () => {
      const response = await request(app.getHttpServer())
        .get('/reports?status=pending')
        .expect(200);

      expect(response.body.reports.length).toBeGreaterThan(0);
      response.body.reports.forEach((report: any) => {
        expect(report.status).toBe('pending');
      });
    });

    it('targetType으로 필터링할 수 있어야 함', async () => {
      const response = await request(app.getHttpServer())
        .get('/reports?targetType=post')
        .expect(200);

      expect(response.body.reports.length).toBeGreaterThan(0);
      response.body.reports.forEach((report: any) => {
        expect(report.target_type).toBe('post');
      });
    });

    it('페이지네이션이 작동해야 함', async () => {
      const response = await request(app.getHttpServer())
        .get('/reports?page=1&limit=2')
        .expect(200);

      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(2);
      expect(response.body.reports.length).toBeLessThanOrEqual(2);
    });
  });

  describe('GET /reports/count/:targetType/:targetId', () => {
    beforeAll(async () => {
      // 신고 카운트 테스트를 위한 데이터 생성
      await prisma.report.deleteMany({
        where: { target_id: testPostId },
      });

      // 3개의 신고 생성 (블러 처리 기준)
      await prisma.report.createMany({
        data: [
          {
            target_type: 'post',
            target_id: testPostId,
            reason: 'spam',
            ip_hash: 'count-hash-1',
            status: 'pending',
          },
          {
            target_type: 'post',
            target_id: testPostId,
            reason: 'inappropriate',
            ip_hash: 'count-hash-2',
            status: 'pending',
          },
          {
            target_type: 'post',
            target_id: testPostId,
            reason: 'harassment',
            ip_hash: 'count-hash-3',
            status: 'pending',
          },
        ],
      });
    });

    it('신고 횟수를 조회할 수 있어야 함', async () => {
      const response = await request(app.getHttpServer())
        .get(`/reports/count/post/${testPostId}`)
        .expect(200);

      expect(response.body).toHaveProperty('count');
      expect(response.body).toHaveProperty('shouldBlur');
      expect(response.body.count).toBe(3);
    });

    it('신고 횟수가 3회 이상이면 블러 처리 해야 함', async () => {
      const response = await request(app.getHttpServer())
        .get(`/reports/count/post/${testPostId}`)
        .expect(200);

      expect(response.body.shouldBlur).toBe(true);
    });

    it('신고가 없는 대상은 count 0을 반환해야 함', async () => {
      const response = await request(app.getHttpServer())
        .get(`/reports/count/comment/${testCommentId}`)
        .expect(200);

      expect(response.body.count).toBe(0);
      expect(response.body.shouldBlur).toBe(false);
    });
  });
});
