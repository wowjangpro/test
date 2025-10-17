import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Comments API (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let testPostId: string;
  let testCommentId: string;
  let commentPassword: string;

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
        title: '댓글 테스트 게시글',
        content: '댓글 테스트 내용',
        anonymous_name: '익명1',
        anonymous_color: '#FF0000',
        ip_hash: 'test-hash',
      },
    });

    testPostId = post.id;
  });

  afterAll(async () => {
    // 테스트 데이터 정리
    await prisma.comment.deleteMany({
      where: { post_id: testPostId },
    });

    await prisma.post.deleteMany({
      where: { id: testPostId },
    });

    await app.close();
  });

  describe('POST /posts/:postId/comments', () => {
    it('댓글을 생성할 수 있어야 함', async () => {
      commentPassword = 'test1234';

      const response = await request(app.getHttpServer())
        .post(`/posts/${testPostId}/comments`)
        .send({
          content: '테스트 댓글입니다.',
          password: commentPassword,
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.content).toBe('테스트 댓글입니다.');
      expect(response.body.post_id).toBe(testPostId);
      expect(response.body).toHaveProperty('anonymous_name');
      expect(response.body).toHaveProperty('anonymous_color');
      expect(response.body.depth).toBe(0);

      testCommentId = response.body.id;
    });

    it('대댓글을 생성할 수 있어야 함', async () => {
      const response = await request(app.getHttpServer())
        .post(`/posts/${testPostId}/comments`)
        .send({
          content: '테스트 대댓글입니다.',
          password: 'test1234',
          parentId: testCommentId,
        })
        .expect(201);

      expect(response.body.parent_id).toBe(testCommentId);
      expect(response.body.depth).toBe(1);
    });

    it('내용 없이 댓글 생성 시 실패해야 함', async () => {
      await request(app.getHttpServer())
        .post(`/posts/${testPostId}/comments`)
        .send({
          password: 'test1234',
        })
        .expect(400);
    });

    it('존재하지 않는 게시글에 댓글 생성 시 실패해야 함', async () => {
      await request(app.getHttpServer())
        .post('/posts/non-existent-id/comments')
        .send({
          content: '테스트 댓글',
          password: 'test1234',
        })
        .expect(404);
    });
  });

  describe('GET /posts/:postId/comments', () => {
    it('게시글의 댓글 목록을 조회할 수 있어야 함', async () => {
      const response = await request(app.getHttpServer())
        .get(`/posts/${testPostId}/comments`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('content');
      expect(response.body[0]).toHaveProperty('anonymous_name');
    });

    it('댓글이 트리 구조로 반환되어야 함', async () => {
      const response = await request(app.getHttpServer())
        .get(`/posts/${testPostId}/comments`)
        .expect(200);

      // 부모 댓글 찾기
      const parentComment = response.body.find(
        (c: any) => c.id === testCommentId,
      );

      expect(parentComment).toBeDefined();
      expect(parentComment.replies).toBeDefined();
      expect(Array.isArray(parentComment.replies)).toBe(true);
      expect(parentComment.replies.length).toBeGreaterThan(0);
    });
  });

  describe('GET /posts/:postId/comments/:id', () => {
    it('특정 댓글을 조회할 수 있어야 함', async () => {
      const response = await request(app.getHttpServer())
        .get(`/posts/${testPostId}/comments/${testCommentId}`)
        .expect(200);

      expect(response.body.id).toBe(testCommentId);
      expect(response.body).toHaveProperty('content');
      expect(response.body).toHaveProperty('anonymous_name');
    });

    it('존재하지 않는 댓글 조회 시 404를 반환해야 함', async () => {
      await request(app.getHttpServer())
        .get(`/posts/${testPostId}/comments/non-existent-id`)
        .expect(404);
    });
  });

  describe('PATCH /posts/:postId/comments/:id', () => {
    it('올바른 비밀번호로 댓글을 수정할 수 있어야 함', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/posts/${testPostId}/comments/${testCommentId}`)
        .send({
          content: '수정된 댓글 내용',
          password: commentPassword,
        })
        .expect(200);

      expect(response.body.content).toBe('수정된 댓글 내용');
    });

    it('잘못된 비밀번호로 수정 시 실패해야 함', async () => {
      await request(app.getHttpServer())
        .patch(`/posts/${testPostId}/comments/${testCommentId}`)
        .send({
          content: '수정된 댓글 내용',
          password: 'wrongpassword',
        })
        .expect(403);
    });

    it('비밀번호 없이 수정 시 실패해야 함', async () => {
      await request(app.getHttpServer())
        .patch(`/posts/${testPostId}/comments/${testCommentId}`)
        .send({
          content: '수정된 댓글 내용',
        })
        .expect(400);
    });
  });

  describe('DELETE /posts/:postId/comments/:id', () => {
    it('잘못된 비밀번호로 삭제 시 실패해야 함', async () => {
      await request(app.getHttpServer())
        .delete(`/posts/${testPostId}/comments/${testCommentId}`)
        .send({
          password: 'wrongpassword',
        })
        .expect(403);
    });

    it('올바른 비밀번호로 댓글을 삭제할 수 있어야 함', async () => {
      await request(app.getHttpServer())
        .delete(`/posts/${testPostId}/comments/${testCommentId}`)
        .send({
          password: commentPassword,
        })
        .expect(200);

      // 삭제 후 조회 시 404
      await request(app.getHttpServer())
        .get(`/posts/${testPostId}/comments/${testCommentId}`)
        .expect(404);
    });

    it('비밀번호 없이 삭제 시 실패해야 함', async () => {
      // 새로운 댓글 생성
      const createResponse = await request(app.getHttpServer())
        .post(`/posts/${testPostId}/comments`)
        .send({
          content: '삭제 테스트 댓글',
          password: 'test1234',
        })
        .expect(201);

      const tempCommentId = createResponse.body.id;

      await request(app.getHttpServer())
        .delete(`/posts/${testPostId}/comments/${tempCommentId}`)
        .send({})
        .expect(403);

      // 정리
      await prisma.comment.deleteMany({
        where: { id: tempCommentId },
      });
    });
  });
});
