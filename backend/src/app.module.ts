import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CategoriesModule } from './categories/categories.module';
import { PostsModule } from './posts/posts.module';
import { ConsultationModule } from './consultation/consultation.module';
import { ChatModule } from './chat/chat.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    CategoriesModule,
    PostsModule,
    ConsultationModule,
    ChatModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

