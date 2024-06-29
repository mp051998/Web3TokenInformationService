import { Test, TestingModule } from '@nestjs/testing';
import { Web3TokenInformationController } from './web3-token-information.controller';

describe('Web3TokenInformationController', () => {
  let controller: Web3TokenInformationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [Web3TokenInformationController],
    }).compile();

    controller = module.get<Web3TokenInformationController>(Web3TokenInformationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
