import { Test, TestingModule } from '@nestjs/testing';
import { Web3TokenInformationService } from './web3-token-information.service';

describe('Web3TokenInformationService', () => {
  let service: Web3TokenInformationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [Web3TokenInformationService],
    }).compile();

    service = module.get<Web3TokenInformationService>(Web3TokenInformationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
