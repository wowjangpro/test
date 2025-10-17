import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Rate Limiting (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

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
    await prisma.$disconnect();
    await app.close();
  });

  describe('Global Rate Limiting', () => {
    it('전역 Rate Limit (1분에 10번) 초과 시 429 에러 반환', async () => {
      const requests = [];

      for (let i = 0; i < 11; i++) {
        requests.push(
          request(app.getHttpServer())
            .get('/posts')
            .expect((res) => {
              if (i < 10) {
                expect([200, 429]).toContain(res.status);
              }
            }),
        );
      }

      const responses = await Promise.all(requests);
      const tooManyRequests = responses.filter(r => r.status === 429);

      expect(tooManyRequests.length).toBeGreaterThan(0);
    }, 15000);
  });

  describe('Post Creation Rate Limiting', () => {
    it('게시글 작성 시 30초에 2번 제한 초과 시 429 에러 반환', async () => {
      const postData = {
        title: 'Rate Limit Test Post',
        content: 'Testing rate limiting',
      };

      await request(app.getHttpServer())
        .post('/posts')
        .send(postData)
        .expect(201);

      await request(app.getHttpServer())
        .post('/posts')
        .send(postData)
        .expect(201);

      const response = await request(app.getHttpServer())
        .post('/posts')
        .send(postData);

      expect(response.status).toBe(429);
    });
  });

  describe('Comment Creation Rate Limiting', () => {
    it('댓글 작성 시 30초에 2번 제한 초과 시 429 에러 반환', async () => {
      const post = await prisma.post.create({
        data: {
          title: 'Test Post for Comments',
          content: 'Test Content',
          anonymous_name: 'Anonymous',
          anonymous_color: '#FF5733',
          ip_hash: 'test-hash',
        },
      });

      const commentData = {
        content: 'Rate Limit Test Comment',
      };

      await request(app.getHttpServer())
        .post(`/posts/${post.id}/comments`)
        .send(commentData)
        .expect(201);

      await request(app.getHttpServer())
        .post(`/posts/${post.id}/comments`)
        .send(commentData)
        .expect(201);

      const response = await request(app.getHttpServer())
        .post(`/posts/${post.id}/comments`)
        .send(commentData);

      expect(response.status).toBe(429);

      await prisma.comment.deleteMany({ where: { post_id: post.id } });
      await prisma.post.delete({ where: { id: post.id } });
    });
  });
});
