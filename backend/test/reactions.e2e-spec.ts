import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Reactions API (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let testPostId: string;
  let testCommentId: string;
  const testSessionId = 'test-session-123';

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
        title: '반응 테스트 게시글',
        content: '반응 테스트 내용',
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
        content: '반응 테스트 댓글',
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
    await prisma.reaction.deleteMany({
      where: {
        OR: [
          { target_id: testPostId },
          { target_id: testCommentId },
        ],
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

  describe('POST /reactions/toggle', () => {
    it('게시글에 좋아요를 추가할 수 있어야 함', async () => {
      const response = await request(app.getHttpServer())
        .post('/reactions/toggle')
        .send({
          targetType: 'post',
          targetId: testPostId,
          reactionType: 'like',
          sessionId: testSessionId,
        })
        .expect(201);

      expect(response.body.action).toBe('created');
      expect(response.body.reactionType).toBe('like');
    });

    it('동일한 반응을 다시 누르면 제거되어야 함', async () => {
      const response = await request(app.getHttpServer())
        .post('/reactions/toggle')
        .send({
          targetType: 'post',
          targetId: testPostId,
          reactionType: 'like',
          sessionId: testSessionId,
        })
        .expect(201);

      expect(response.body.action).toBe('removed');
      expect(response.body.reactionType).toBe('like');
    });

    it('다른 반응으로 변경할 수 있어야 함', async () => {
      // 먼저 좋아요 추가
      await request(app.getHttpServer())
        .post('/reactions/toggle')
        .send({
          targetType: 'post',
          targetId: testPostId,
          reactionType: 'like',
          sessionId: testSessionId,
        })
        .expect(201);

      // 싫어요로 변경
      const response = await request(app.getHttpServer())
        .post('/reactions/toggle')
        .send({
          targetType: 'post',
          targetId: testPostId,
          reactionType: 'dislike',
          sessionId: testSessionId,
        })
        .expect(201);

      expect(response.body.action).toBe('updated');
      expect(response.body.reactionType).toBe('dislike');
    });

    it('댓글에 반응을 추가할 수 있어야 함', async () => {
      const response = await request(app.getHttpServer())
        .post('/reactions/toggle')
        .send({
          targetType: 'comment',
          targetId: testCommentId,
          reactionType: 'like',
          sessionId: testSessionId,
        })
        .expect(201);

      expect(response.body.action).toBe('created');
      expect(response.body.reactionType).toBe('like');
    });

    it('잘못된 targetType 입력 시 실패해야 함', async () => {
      await request(app.getHttpServer())
        .post('/reactions/toggle')
        .send({
          targetType: 'invalid',
          targetId: testPostId,
          reactionType: 'like',
          sessionId: testSessionId,
        })
        .expect(400);
    });

    it('잘못된 reactionType 입력 시 실패해야 함', async () => {
      await request(app.getHttpServer())
        .post('/reactions/toggle')
        .send({
          targetType: 'post',
          targetId: testPostId,
          reactionType: 'invalid',
          sessionId: testSessionId,
        })
        .expect(400);
    });

    it('targetId가 UUID가 아니면 실패해야 함', async () => {
      await request(app.getHttpServer())
        .post('/reactions/toggle')
        .send({
          targetType: 'post',
          targetId: 'not-a-uuid',
          reactionType: 'like',
          sessionId: testSessionId,
        })
        .expect(400);
    });

    it('sessionId 없이 요청 시 실패해야 함', async () => {
      await request(app.getHttpServer())
        .post('/reactions/toggle')
        .send({
          targetType: 'post',
          targetId: testPostId,
          reactionType: 'like',
        })
        .expect(400);
    });
  });

  describe('GET /reactions/counts', () => {
    beforeAll(async () => {
      // 테스트를 위한 반응 데이터 정리 및 새로 생성
      await prisma.reaction.deleteMany({
        where: {
          OR: [
            { target_id: testPostId },
            { target_id: testCommentId },
          ],
        },
      });

      // 좋아요 2개, 싫어요 1개 추가
      await prisma.reaction.createMany({
        data: [
          {
            target_type: 'post',
            target_id: testPostId,
            reaction_type: 'like',
            session_id: 'session-1',
          },
          {
            target_type: 'post',
            target_id: testPostId,
            reaction_type: 'like',
            session_id: 'session-2',
          },
          {
            target_type: 'post',
            target_id: testPostId,
            reaction_type: 'dislike',
            session_id: 'session-3',
          },
        ],
      });
    });

    it('게시글의 반응 카운트를 조회할 수 있어야 함', async () => {
      const response = await request(app.getHttpServer())
        .get('/reactions/counts')
        .query({
          targetType: 'post',
          targetId: testPostId,
        })
        .expect(200);

      expect(response.body).toHaveProperty('like');
      expect(response.body).toHaveProperty('dislike');
      expect(response.body.like).toBe(2);
      expect(response.body.dislike).toBe(1);
    });

    it('반응이 없는 대상은 0을 반환해야 함', async () => {
      const response = await request(app.getHttpServer())
        .get('/reactions/counts')
        .query({
          targetType: 'comment',
          targetId: testCommentId,
        })
        .expect(200);

      expect(response.body.like).toBe(0);
      expect(response.body.dislike).toBe(0);
    });
  });

  describe('GET /reactions/user', () => {
    beforeAll(async () => {
      // 테스트용 사용자 반응 추가
      await prisma.reaction.deleteMany({
        where: {
          target_id: testCommentId,
          session_id: 'user-session-test',
        },
      });

      await prisma.reaction.create({
        data: {
          target_type: 'comment',
          target_id: testCommentId,
          reaction_type: 'like',
          session_id: 'user-session-test',
        },
      });
    });

    it('사용자의 반응을 조회할 수 있어야 함', async () => {
      const response = await request(app.getHttpServer())
        .get('/reactions/user')
        .query({
          targetType: 'comment',
          targetId: testCommentId,
          sessionId: 'user-session-test',
        })
        .expect(200);

      expect(response.body).toHaveProperty('reactionType');
      expect(response.body.reactionType).toBe('like');
    });

    it('반응하지 않은 대상은 빈 객체를 반환해야 함', async () => {
      const response = await request(app.getHttpServer())
        .get('/reactions/user')
        .query({
          targetType: 'post',
          targetId: testPostId,
          sessionId: 'non-existent-session',
        })
        .expect(200);

      expect(response.body).toEqual({});
    });
  });
});
