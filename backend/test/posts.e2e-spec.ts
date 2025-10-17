import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Posts API (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let createdPostId: string;
  let postPassword: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));

    prisma = app.get<PrismaService>(PrismaService);

    await app.init();
  });

  afterAll(async () => {
    // 테스트 데이터 정리
    if (createdPostId) {
      await prisma.post.deleteMany({
        where: { id: createdPostId },
      });
    }

    await app.close();
  });

  describe('POST /posts', () => {
    it('게시글을 생성할 수 있어야 함', async () => {
      postPassword = 'test1234';

      const response = await request(app.getHttpServer())
        .post('/posts')
        .send({
          title: '테스트 게시글',
          content: '테스트 내용입니다.',
          password: postPassword,
          category: '테스트',
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe('테스트 게시글');
      expect(response.body.content).toBe('테스트 내용입니다.');
      expect(response.body.category).toBe('테스트');
      expect(response.body).toHaveProperty('anonymous_name');
      expect(response.body).toHaveProperty('anonymous_color');

      createdPostId = response.body.id;
    });

    it('제목 없이 게시글 생성 시 실패해야 함', async () => {
      await request(app.getHttpServer())
        .post('/posts')
        .send({
          content: '테스트 내용입니다.',
        })
        .expect(400);
    });

    it('내용 없이 게시글 생성 시 실패해야 함', async () => {
      await request(app.getHttpServer())
        .post('/posts')
        .send({
          title: '테스트 게시글',
        })
        .expect(400);
    });
  });

  describe('GET /posts', () => {
    it('게시글 목록을 조회할 수 있어야 함', async () => {
      const response = await request(app.getHttpServer())
        .get('/posts')
        .expect(200);

      expect(response.body).toHaveProperty('posts');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.posts)).toBe(true);
      expect(response.body.pagination).toHaveProperty('page');
      expect(response.body.pagination).toHaveProperty('limit');
      expect(response.body.pagination).toHaveProperty('total');
      expect(response.body.pagination).toHaveProperty('totalPages');
    });

    it('페이지네이션이 작동해야 함', async () => {
      const response = await request(app.getHttpServer())
        .get('/posts?page=1&limit=10')
        .expect(200);

      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(10);
    });

    it('카테고리 필터링이 작동해야 함', async () => {
      await request(app.getHttpServer())
        .get('/posts?category=테스트')
        .expect(200);
    });
  });

  describe('GET /posts/search', () => {
    it('검색이 작동해야 함', async () => {
      const response = await request(app.getHttpServer())
        .get('/posts/search?q=테스트')
        .expect(200);

      expect(response.body).toHaveProperty('posts');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.posts)).toBe(true);
    });

    it('검색어 없이 요청 시 실패해야 함', async () => {
      await request(app.getHttpServer())
        .get('/posts/search')
        .expect(400);
    });
  });

  describe('GET /posts/:id', () => {
    it('특정 게시글을 조회할 수 있어야 함', async () => {
      const response = await request(app.getHttpServer())
        .get(`/posts/${createdPostId}`)
        .expect(200);

      expect(response.body.id).toBe(createdPostId);
      expect(response.body).toHaveProperty('title');
      expect(response.body).toHaveProperty('content');
      expect(response.body).toHaveProperty('view_count');
    });

    it('존재하지 않는 게시글 조회 시 404를 반환해야 함', async () => {
      await request(app.getHttpServer())
        .get('/posts/non-existent-id')
        .expect(404);
    });

    it('조회할 때마다 조회수가 증가해야 함', async () => {
      const response1 = await request(app.getHttpServer())
        .get(`/posts/${createdPostId}`)
        .expect(200);

      const viewCount1 = response1.body.view_count;

      const response2 = await request(app.getHttpServer())
        .get(`/posts/${createdPostId}`)
        .expect(200);

      const viewCount2 = response2.body.view_count;

      expect(viewCount2).toBeGreaterThan(viewCount1);
    });
  });

  describe('PATCH /posts/:id', () => {
    it('올바른 비밀번호로 게시글을 수정할 수 있어야 함', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/posts/${createdPostId}`)
        .send({
          title: '수정된 제목',
          content: '수정된 내용',
          password: postPassword,
        })
        .expect(200);

      expect(response.body.title).toBe('수정된 제목');
      expect(response.body.content).toBe('수정된 내용');
    });

    it('잘못된 비밀번호로 수정 시 실패해야 함', async () => {
      await request(app.getHttpServer())
        .patch(`/posts/${createdPostId}`)
        .send({
          title: '수정된 제목',
          content: '수정된 내용',
          password: 'wrongpassword',
        })
        .expect(403);
    });

    it('비밀번호 없이 수정 시 실패해야 함', async () => {
      await request(app.getHttpServer())
        .patch(`/posts/${createdPostId}`)
        .send({
          title: '수정된 제목',
          content: '수정된 내용',
        })
        .expect(400);
    });
  });

  describe('DELETE /posts/:id', () => {
    it('잘못된 비밀번호로 삭제 시 실패해야 함', async () => {
      await request(app.getHttpServer())
        .delete(`/posts/${createdPostId}`)
        .send({
          password: 'wrongpassword',
        })
        .expect(403);
    });

    it('올바른 비밀번호로 게시글을 삭제할 수 있어야 함', async () => {
      await request(app.getHttpServer())
        .delete(`/posts/${createdPostId}`)
        .send({
          password: postPassword,
        })
        .expect(200);

      // 삭제 후 조회 시 404
      await request(app.getHttpServer())
        .get(`/posts/${createdPostId}`)
        .expect(404);

      // 삭제된 ID를 null로 설정하여 afterAll에서 중복 삭제 방지
      createdPostId = null;
    });

    it('비밀번호 없이 삭제 시 실패해야 함', async () => {
      // 새로운 게시글 생성
      const createResponse = await request(app.getHttpServer())
        .post('/posts')
        .send({
          title: '삭제 테스트 게시글',
          content: '삭제 테스트 내용',
          password: 'test1234',
        })
        .expect(201);

      const tempPostId = createResponse.body.id;

      await request(app.getHttpServer())
        .delete(`/posts/${tempPostId}`)
        .send({})
        .expect(403);

      // 정리
      await prisma.post.deleteMany({
        where: { id: tempPostId },
      });
    });
  });
});
