import { Controller, Get } from '@nestjs/common';

import { Web3TokenInformationService } from './web3-token-information.service';

@Controller('web3-token-information')
export class Web3TokenInformationController {

  constructor(private readonly web3TokenInformationService: Web3TokenInformationService) { }

  @Get('/')
  async getWeb3TokenInformation(): Promise<any> {
    return this.web3TokenInformationService.getWeb3TokenInformation();
  }

}
