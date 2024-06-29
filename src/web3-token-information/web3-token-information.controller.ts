import { Controller, Get, Headers } from '@nestjs/common';

import { Web3TokenInformationService } from './web3-token-information.service';

@Controller('web3-token-information')
export class Web3TokenInformationController {

  constructor(private readonly web3TokenInformationService: Web3TokenInformationService) { }

  @Get('/')
  async getWeb3TokenInformation(@Headers('Authorization') accessKey: string): Promise<any> {
    console.log(accessKey); // This will log the Authorization header value
    return this.web3TokenInformationService.getWeb3TokenInformation(accessKey);
  }

}
