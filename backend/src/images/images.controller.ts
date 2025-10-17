import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ImagesService } from './images.service';

@Controller('images')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Post('upload/:postId')
  @UseInterceptors(FilesInterceptor('images', 5))
  async uploadImages(
    @Param('postId') postId: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('이미지 파일을 선택해주세요');
    }

    const images = await this.imagesService.uploadImages(files, postId);
    return {
      message: '이미지가 성공적으로 업로드되었습니다',
      images,
    };
  }

  @Get('post/:postId')
  async getImagesByPostId(@Param('postId') postId: string) {
    return this.imagesService.getImagesByPostId(postId);
  }

  @Delete(':imageId')
  async deleteImage(@Param('imageId') imageId: string) {
    await this.imagesService.deleteImage(imageId);
    return {
      message: '이미지가 삭제되었습니다',
    };
  }
}
