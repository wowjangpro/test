import { IsString, IsEnum, IsOptional, MaxLength } from 'class-validator';

export enum ReportReason {
  SPAM = 'spam',
  INAPPROPRIATE = 'inappropriate',
  HARASSMENT = 'harassment',
  FALSE_INFO = 'false_info',
  OTHER = 'other',
}

export class CreateReportDto {
  @IsEnum(['post', 'comment'])
  targetType: 'post' | 'comment';

  @IsString()
  targetId: string;

  @IsEnum(ReportReason)
  reason: ReportReason;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;
}
