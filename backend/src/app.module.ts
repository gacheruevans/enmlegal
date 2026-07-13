import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConsultationController } from './consultation/consultation.controller';
import { ConsultationService } from './consultation/consultation.service';
import { AuthModule } from './auth/auth.module';
import { CategoriesModule } from './categories/categories.module';
import { PostsModule } from './posts/posts.module';

@Module({
  imports: [AuthModule, CategoriesModule, PostsModule],
  controllers: [AppController, ConsultationController],
  providers: [AppService, ConsultationService],
})
export class AppModule {}
