import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ValidationPipe,
  UsePipes,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto, UpdateCommentDto } from './dto';
import { ClientIp } from '../common/decorators';

@Controller('posts/:postId/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  create(
    @Param('postId') postId: string,
    @Body() createCommentDto: CreateCommentDto,
    @ClientIp() clientIp: string,
  ) {
    return this.commentsService.create(postId, createCommentDto, clientIp);
  }

  @Get()
  findAllByPost(@Param('postId') postId: string) {
    return this.commentsService.findAllByPost(postId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.commentsService.findOne(id);
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe({ transform: true }))
  update(@Param('id') id: string, @Body() updateCommentDto: UpdateCommentDto) {
    return this.commentsService.update(id, updateCommentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Body('password') password: string) {
    return this.commentsService.remove(id, password);
  }
}
