import { Test, TestingModule } from '@nestjs/testing';

import { AuthMiddleware } from './auth.middleware';

describe('AuthMiddleware', () => {
  let service: AuthMiddleware;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthMiddleware],
    }).compile();

    service = module.get<AuthMiddleware>(AuthMiddleware);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
