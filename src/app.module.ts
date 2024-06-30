import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthMiddleware } from './middleware/auth/auth.middleware';
import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { RedisModule } from '@liaoliaots/nestjs-redis';
import { Web3TokenInformationModule } from './web3-token-information/web3-token-information.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    RedisModule.forRoot({
      config: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT),
      },
    }),
    Web3TokenInformationModule
  ],
  controllers: [AppController],
  providers: [AppService, AuthMiddleware],
})
export class AppModule { }
