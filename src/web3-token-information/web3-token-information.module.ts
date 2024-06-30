import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';

import { AuthMiddleware } from 'src/middleware/auth/auth.middleware';
import { Web3TokenInformationController } from './web3-token-information.controller';
import { Web3TokenInformationService } from './web3-token-information.service';

@Module({
  providers: [Web3TokenInformationService],
  controllers: [Web3TokenInformationController]
})
export class Web3TokenInformationModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes(Web3TokenInformationController); // Apply to all routes of UsersController
    // .forRoutes({ path: 'web3-token-information', method: RequestMethod.GET }); // Or apply to specific routes
  }
}
