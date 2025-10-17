import {
  IsString,
  IsOptional,
  MinLength,
  MaxLength,
} from 'class-validator';

export class UpdatePostDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(50000)
  content?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  category?: string;

  @IsString()
  @MinLength(4)
  @MaxLength(100)
  password: string;
}
