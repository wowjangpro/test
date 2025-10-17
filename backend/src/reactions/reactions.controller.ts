import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  ValidationPipe,
  UsePipes,
} from '@nestjs/common';
import { ReactionsService } from './reactions.service';
import { CreateReactionDto } from './dto';

@Controller('reactions')
export class ReactionsController {
  constructor(private readonly reactionsService: ReactionsService) {}

  @Post('toggle')
  @UsePipes(new ValidationPipe({ transform: true }))
  toggle(@Body() createReactionDto: CreateReactionDto) {
    return this.reactionsService.toggle(createReactionDto);
  }

  @Get('counts')
  getCounts(
    @Query('targetType') targetType: string,
    @Query('targetId') targetId: string,
  ) {
    return this.reactionsService.getCountsByTarget(targetType, targetId);
  }

  @Get('user')
  getUserReaction(
    @Query('targetType') targetType: string,
    @Query('targetId') targetId: string,
    @Query('sessionId') sessionId: string,
  ) {
    return this.reactionsService.getUserReaction(
      targetType,
      targetId,
      sessionId,
    );
  }
}
