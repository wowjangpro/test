import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto, UpdateCommentDto } from './dto';
import { hashIp } from '../utils/ip-hash.helper';
import { generateAnonymousName } from '../utils/anonymous-name.generator';
import { generateAnonymousColor } from '../utils/anonymous-color.generator';
import { hashPasswordIfProvided, verifyPassword } from '../utils/password.helper';

@Injectable()
export class CommentsService {
  constructor(private prisma: PrismaService) {}

  async create(
    postId: string,
    createCommentDto: CreateCommentDto,
    clientIp: string,
  ) {
    // 게시글 존재 확인
    const post = await this.prisma.post.findUnique({
      where: { id: postId, deleted_at: null },
    });

    if (!post) {
      throw new NotFoundException('게시글을 찾을 수 없습니다');
    }

    const ipHash = hashIp(clientIp);
    const passwordHash = await hashPasswordIfProvided(
      createCommentDto.password,
    );

    let depth = 0;
    if (createCommentDto.parentId) {
      const parentComment = await this.prisma.comment.findUnique({
        where: { id: createCommentDto.parentId },
      });
      if (parentComment) {
        depth = parentComment.depth + 1;
      }
    }

    return this.prisma.comment.create({
      data: {
        post_id: postId,
        parent_id: createCommentDto.parentId || null,
        content: createCommentDto.content,
        anonymous_name: generateAnonymousName(),
        anonymous_color: generateAnonymousColor(),
        password_hash: passwordHash,
        ip_hash: ipHash,
        depth,
      },
    });
  }

  async findAllByPost(postId: string) {
    const comments = await this.prisma.comment.findMany({
      where: {
        post_id: postId,
        deleted_at: null,
      },
      orderBy: {
        created_at: 'asc',
      },
    });

    return this.buildCommentTree(comments);
  }

  private buildCommentTree(comments: any[]): any[] {
    const commentMap = new Map();
    const rootComments: any[] = [];

    comments.forEach((comment) => {
      commentMap.set(comment.id, { ...comment, replies: [] });
    });

    comments.forEach((comment) => {
      const commentWithReplies = commentMap.get(comment.id);
      if (comment.parent_id) {
        const parent = commentMap.get(comment.parent_id);
        if (parent) {
          parent.replies.push(commentWithReplies);
        }
      } else {
        rootComments.push(commentWithReplies);
      }
    });

    return rootComments;
  }

  async findOne(id: string) {
    const comment = await this.prisma.comment.findUnique({
      where: { id, deleted_at: null },
    });

    if (!comment) {
      throw new NotFoundException('댓글을 찾을 수 없습니다');
    }

    return comment;
  }

  async update(id: string, updateCommentDto: UpdateCommentDto) {
    const comment = await this.prisma.comment.findUnique({
      where: { id, deleted_at: null },
    });

    if (!comment) {
      throw new NotFoundException('댓글을 찾을 수 없습니다');
    }

    if (!comment.password_hash) {
      throw new ForbiddenException('비밀번호가 설정되지 않은 댓글입니다');
    }

    const isValid = await verifyPassword(
      updateCommentDto.password,
      comment.password_hash,
    );

    if (!isValid) {
      throw new ForbiddenException('비밀번호가 일치하지 않습니다');
    }

    return this.prisma.comment.update({
      where: { id },
      data: {
        content: updateCommentDto.content,
      },
    });
  }

  async remove(id: string, password: string) {
    const comment = await this.prisma.comment.findUnique({
      where: { id, deleted_at: null },
    });

    if (!comment) {
      throw new NotFoundException('댓글을 찾을 수 없습니다');
    }

    if (!comment.password_hash) {
      throw new ForbiddenException('비밀번호가 설정되지 않은 댓글입니다');
    }

    const isValid = await verifyPassword(password, comment.password_hash);

    if (!isValid) {
      throw new ForbiddenException('비밀번호가 일치하지 않습니다');
    }

    return this.prisma.comment.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
  }
}
