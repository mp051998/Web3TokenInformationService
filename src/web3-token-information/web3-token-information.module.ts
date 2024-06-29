import { Module } from '@nestjs/common';
import { Web3TokenInformationService } from './web3-token-information.service';
import { Web3TokenInformationController } from './web3-token-information.controller';

@Module({
  providers: [Web3TokenInformationService],
  controllers: [Web3TokenInformationController]
})
export class Web3TokenInformationModule {}
