import { ForbiddenException, HttpException, HttpStatus, Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

import { AccessKey } from 'src/models/access-key.model';
import { AccessKeyUseResponse } from 'src/models/access-key-use-response.model';
import { Redis as RedisClient } from 'ioredis';
import { RedisService } from '@liaoliaots/nestjs-redis';

@Injectable()
export class AuthMiddleware implements NestMiddleware {

  private redisClient: RedisClient;

  constructor(
    private readonly redisSvc: RedisService
  ) {
    this.redisClient = this.redisSvc.getClient();
  }

  private async getAccessToken(key: string): Promise<AccessKey> {
    const accessKey = `accessKey:${key}`;
    const accessKeyData = await this.redisClient.get(accessKey);
    if (!accessKeyData) {
      return null;
    }
    return JSON.parse(accessKeyData);
  }

  private async verifyRateLimit(accessKeyData: AccessKey): Promise<AccessKeyUseResponse> {
    // Set the rate limit count to 1
    const accessKey = `accessKey:${accessKeyData.key}`;
    const rateLimitKey = `rateLimit:${accessKey}`;

    const rateLimitPerMin = accessKeyData.rateLimitPerMin;

    // Get the current count for the key
    const currentCount = await this.redisClient.get(rateLimitKey);

    let limitExceeded = false;
    if (currentCount === null) {
      // If the token hasn't been used this minute, set the counter to 1 and set expiration
      await this.redisClient.set(rateLimitKey, 1, 'EX', 60); // EX 60 sets the key to expire in 60 seconds
    } else if (parseInt(currentCount) < rateLimitPerMin) {
      // If the current count is less than the rate limit, increment the counter
      await this.redisClient.incr(rateLimitKey);
    } else {
      // Rate limit exceeded
      limitExceeded = true;
    }

    const rateLimitRefreshInSeconds = await this.redisClient.ttl(rateLimitKey);

    return {
      accessKeyData,
      rateLimitRefreshInSeconds,
      limitExceeded
    }
  }

  async use(req: Request, res: Response, next: NextFunction) {
    console.log(req.headers);
    const authToken = req.headers.authorization.toString();
    if (!authToken) {
      throw new ForbiddenException('Authentication token is required');
    }

    // Check if the token is valid
    const accessKeyData = await this.getAccessToken(authToken);
    if (!accessKeyData) {
      throw new ForbiddenException('Invalid access token');
    }

    // Check if the token is active
    if (!accessKeyData.active) {
      throw new ForbiddenException('Inactive access token');
    }

    // Now check the rate limits
    const accessKeyUseResponse = await this.verifyRateLimit(accessKeyData);
    if (accessKeyUseResponse.limitExceeded) {
      throw new HttpException({
        message: 'Rate limit exceeded. Please try again later.',
        data: accessKeyUseResponse
      }
        , HttpStatus.TOO_MANY_REQUESTS);
    }

    next();
  }
}
