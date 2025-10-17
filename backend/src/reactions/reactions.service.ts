import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReactionDto } from './dto';

@Injectable()
export class ReactionsService {
  constructor(private prisma: PrismaService) {}

  async toggle(createReactionDto: CreateReactionDto) {
    const { targetType, targetId, reactionType, sessionId } = createReactionDto;

    const existingReaction = await this.prisma.reaction.findFirst({
      where: {
        target_type: targetType,
        target_id: targetId,
        session_id: sessionId,
      },
    });

    if (existingReaction) {
      if (existingReaction.reaction_type === reactionType) {
        await this.prisma.reaction.delete({
          where: { id: existingReaction.id },
        });
        return { action: 'removed', reactionType };
      } else {
        const updated = await this.prisma.reaction.update({
          where: { id: existingReaction.id },
          data: { reaction_type: reactionType },
        });
        return { action: 'updated', reactionType: updated.reaction_type };
      }
    }

    const newReaction = await this.prisma.reaction.create({
      data: {
        target_type: targetType,
        target_id: targetId,
        reaction_type: reactionType,
        session_id: sessionId,
      },
    });

    return { action: 'created', reactionType: newReaction.reaction_type };
  }

  async getCountsByTarget(targetType: string, targetId: string) {
    const reactions = await this.prisma.reaction.groupBy({
      by: ['reaction_type'],
      where: {
        target_type: targetType,
        target_id: targetId,
      },
      _count: {
        reaction_type: true,
      },
    });

    const counts = {
      like: 0,
      dislike: 0,
    };

    reactions.forEach((r) => {
      if (r.reaction_type === 'like') {
        counts.like = r._count.reaction_type;
      } else if (r.reaction_type === 'dislike') {
        counts.dislike = r._count.reaction_type;
      }
    });

    return counts;
  }

  async getUserReaction(
    targetType: string,
    targetId: string,
    sessionId: string,
  ) {
    const reaction = await this.prisma.reaction.findFirst({
      where: {
        target_type: targetType,
        target_id: targetId,
        session_id: sessionId,
      },
    });

    return reaction ? { reactionType: reaction.reaction_type } : null;
  }
}
