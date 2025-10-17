import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { PostsModule } from './posts/posts.module';
import { CommentsModule } from './comments/comments.module';
import { ReactionsModule } from './reactions/reactions.module';
import { ImagesModule } from './images/images.module';
import { ReportsModule } from './reports/reports.module';

@Module({
  imports: [PrismaModule, PostsModule, CommentsModule, ReactionsModule, ImagesModule, ReportsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
