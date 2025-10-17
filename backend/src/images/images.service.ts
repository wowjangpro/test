import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { supabase, STORAGE_BUCKET } from '../lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';

@Injectable()
export class ImagesService {
  constructor(private prisma: PrismaService) {}

  private readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  private readonly ALLOWED_MIME_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
  ];
  private readonly MAX_IMAGE_WIDTH = 1920;
  private readonly MAX_IMAGE_HEIGHT = 1080;
  private readonly WEBP_QUALITY = 85;

  async uploadImage(
    file: Express.Multer.File,
    postId: string,
  ): Promise<{ id: string; url: string; thumbnail: string }> {
    this.validateFile(file);

    const fileName = `${uuidv4()}.webp`;
    const thumbnailName = `${uuidv4()}_thumb.webp`;
    const filePath = `posts/${postId}/${fileName}`;
    const thumbnailPath = `posts/${postId}/${thumbnailName}`;

    let processedBuffer: Buffer;
    let thumbnailBuffer: Buffer;

    if (file.mimetype === 'image/gif') {
      processedBuffer = file.buffer;
      thumbnailBuffer = await sharp(file.buffer)
        .resize(300, 300, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: this.WEBP_QUALITY })
        .toBuffer();
    } else {
      processedBuffer = await sharp(file.buffer)
        .resize(this.MAX_IMAGE_WIDTH, this.MAX_IMAGE_HEIGHT, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .webp({ quality: this.WEBP_QUALITY })
        .toBuffer();

      thumbnailBuffer = await sharp(file.buffer)
        .resize(300, 300, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: this.WEBP_QUALITY })
        .toBuffer();
    }

    const [mainUpload, thumbUpload] = await Promise.all([
      supabase.storage.from(STORAGE_BUCKET).upload(filePath, processedBuffer, {
        contentType: 'image/webp',
        upsert: false,
      }),
      supabase.storage.from(STORAGE_BUCKET).upload(thumbnailPath, thumbnailBuffer, {
        contentType: 'image/webp',
        upsert: false,
      }),
    ]);

    if (mainUpload.error) {
      throw new BadRequestException(`이미지 업로드 실패: ${mainUpload.error.message}`);
    }

    if (thumbUpload.error) {
      throw new BadRequestException(`썸네일 업로드 실패: ${thumbUpload.error.message}`);
    }

    const image = await this.prisma.image.create({
      data: {
        post_id: postId,
        file_path: mainUpload.data.path,
        file_name: file.originalname,
        file_size: processedBuffer.length,
        mime_type: 'image/webp',
      },
    });

    const { data: urlData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(mainUpload.data.path);

    const { data: thumbUrlData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(thumbUpload.data.path);

    return {
      id: image.id,
      url: urlData.publicUrl,
      thumbnail: thumbUrlData.publicUrl,
    };
  }

  async uploadImages(
    files: Express.Multer.File[],
    postId: string,
  ): Promise<Array<{ id: string; url: string; thumbnail: string }>> {
    if (files.length > 5) {
      throw new BadRequestException('최대 5개의 이미지만 업로드할 수 있습니다');
    }

    const uploadPromises = files.map((file) => this.uploadImage(file, postId));
    return Promise.all(uploadPromises);
  }

  async getImagesByPostId(postId: string) {
    const images = await this.prisma.image.findMany({
      where: { post_id: postId },
      orderBy: { created_at: 'asc' },
    });

    return images.map((image) => {
      const { data } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(image.file_path);

      return {
        id: image.id,
        url: data.publicUrl,
        fileName: image.file_name,
        fileSize: image.file_size,
        mimeType: image.mime_type,
        createdAt: image.created_at,
      };
    });
  }

  async deleteImage(imageId: string): Promise<void> {
    const image = await this.prisma.image.findUnique({
      where: { id: imageId },
    });

    if (!image) {
      throw new BadRequestException('이미지를 찾을 수 없습니다');
    }

    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([image.file_path]);

    if (error) {
      console.error('Supabase Storage 삭제 실패:', error);
    }

    await this.prisma.image.delete({
      where: { id: imageId },
    });
  }

  async deleteImagesByPostId(postId: string): Promise<void> {
    const images = await this.prisma.image.findMany({
      where: { post_id: postId },
    });

    if (images.length === 0) return;

    const filePaths = images.map((img) => img.file_path);

    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove(filePaths);

    if (error) {
      console.error('Supabase Storage 삭제 실패:', error);
    }

    await this.prisma.image.deleteMany({
      where: { post_id: postId },
    });
  }

  private validateFile(file: Express.Multer.File): void {
    if (!file) {
      throw new BadRequestException('파일이 없습니다');
    }

    if (file.size > this.MAX_FILE_SIZE) {
      throw new BadRequestException(
        `파일 크기는 ${this.MAX_FILE_SIZE / 1024 / 1024}MB를 초과할 수 없습니다`,
      );
    }

    if (!this.ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        '지원되지 않는 파일 형식입니다. (jpeg, jpg, png, gif, webp만 가능)',
      );
    }
  }
}
