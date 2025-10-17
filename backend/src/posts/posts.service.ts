import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto, UpdatePostDto } from './dto';
import { hashIp } from '../utils/ip-hash.helper';
import { generateAnonymousName } from '../utils/anonymous-name.generator';
import { generateAnonymousColor } from '../utils/anonymous-color.generator';
import { hashPasswordIfProvided, verifyPassword } from '../utils/password.helper';

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) {}

  async create(createPostDto: CreatePostDto, clientIp: string) {
    const ipHash = hashIp(clientIp);
    const passwordHash = await hashPasswordIfProvided(createPostDto.password);

    return this.prisma.post.create({
      data: {
        title: createPostDto.title,
        content: createPostDto.content,
        category: createPostDto.category,
        anonymous_name: generateAnonymousName(),
        anonymous_color: generateAnonymousColor(),
        password_hash: passwordHash,
        ip_hash: ipHash,
      },
    });
  }

  async findAll(params?: {
    category?: string;
    page?: number;
    limit?: number;
    sort?: string;
  }) {
    const page = params?.page || 1;
    const limit = params?.limit || 20;
    const skip = (page - 1) * limit;

    const where = {
      deleted_at: null,
      ...(params?.category && { category: params.category }),
    };

    const orderBy =
      params?.sort === 'popular'
        ? { view_count: 'desc' as const }
        : { created_at: 'desc' as const };

    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        select: {
          id: true,
          title: true,
          content: true,
          category: true,
          anonymous_name: true,
          anonymous_color: true,
          view_count: true,
          created_at: true,
          updated_at: true,
          _count: {
            select: {
              comments: true,
            },
          },
        },
      }),
      this.prisma.post.count({ where }),
    ]);

    return {
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const post = await this.prisma.post.findUnique({
      where: { id, deleted_at: null },
      include: {
        images: true,
        _count: {
          select: {
            comments: true,
          },
        },
      },
    });

    if (!post) {
      throw new NotFoundException('게시글을 찾을 수 없습니다');
    }

    await this.prisma.post.update({
      where: { id },
      data: { view_count: { increment: 1 } },
    });

    return post;
  }

  async update(id: string, updatePostDto: UpdatePostDto, clientIp: string) {
    const post = await this.prisma.post.findUnique({
      where: { id, deleted_at: null },
    });

    if (!post) {
      throw new NotFoundException('게시글을 찾을 수 없습니다');
    }

    if (!post.password_hash) {
      throw new ForbiddenException('비밀번호가 설정되지 않은 게시글입니다');
    }

    const isValid = await verifyPassword(
      updatePostDto.password,
      post.password_hash,
    );

    if (!isValid) {
      throw new ForbiddenException('비밀번호가 일치하지 않습니다');
    }

    return this.prisma.post.update({
      where: { id },
      data: {
        title: updatePostDto.title,
        content: updatePostDto.content,
        category: updatePostDto.category,
      },
    });
  }

  async remove(id: string, password: string) {
    const post = await this.prisma.post.findUnique({
      where: { id, deleted_at: null },
    });

    if (!post) {
      throw new NotFoundException('게시글을 찾을 수 없습니다');
    }

    if (!post.password_hash) {
      throw new ForbiddenException('비밀번호가 설정되지 않은 게시글입니다');
    }

    const isValid = await verifyPassword(password, post.password_hash);

    if (!isValid) {
      throw new ForbiddenException('비밀번호가 일치하지 않습니다');
    }

    return this.prisma.post.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
  }

  async search(params: {
    q: string;
    category?: string;
    page?: number;
    limit?: number;
  }) {
    if (!params.q) {
      throw new BadRequestException('검색어를 입력해주세요');
    }

    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const where = {
      deleted_at: null,
      AND: [
        {
          OR: [
            { title: { contains: params.q, mode: 'insensitive' as const } },
            { content: { contains: params.q, mode: 'insensitive' as const } },
          ],
        },
        ...(params.category ? [{ category: params.category }] : []),
      ],
    };

    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          title: true,
          content: true,
          category: true,
          anonymous_name: true,
          anonymous_color: true,
          view_count: true,
          created_at: true,
          updated_at: true,
          _count: {
            select: {
              comments: true,
            },
          },
        },
      }),
      this.prisma.post.count({ where }),
    ]);

    return {
      posts,
      query: params.q,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
