import { IsString, IsEnum, IsUUID } from 'class-validator';

export enum TargetType {
  POST = 'post',
  COMMENT = 'comment',
}

export enum ReactionType {
  LIKE = 'like',
  DISLIKE = 'dislike',
}

export class CreateReactionDto {
  @IsEnum(TargetType)
  targetType: TargetType;

  @IsUUID()
  targetId: string;

  @IsEnum(ReactionType)
  reactionType: ReactionType;

  @IsString()
  sessionId: string;
}
