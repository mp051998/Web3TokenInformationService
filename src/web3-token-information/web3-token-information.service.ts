import { HttpException, HttpStatus, Injectable, NotFoundException, OnModuleInit, UnauthorizedException } from '@nestjs/common';
import Redis, { Redis as RedisClient } from 'ioredis';

import { AccessKey } from 'src/models/access-key.model';
import { AccessKeyUseResponse } from 'src/models/access-key-use-response.model';
import { RedisService } from '@liaoliaots/nestjs-redis';

const dummyWeb3TokenData = {
  data: "dummyWeb3TokenData"
};

@Injectable()
export class Web3TokenInformationService implements OnModuleInit {

  private subscriber: RedisClient;
  private redisClient: RedisClient;

  constructor(
    private readonly redisSvc: RedisService
  ) {
    this.subscriber = new Redis();
    this.redisClient = this.redisSvc.getClient();
  }

  onModuleInit() {
    this.subscriber.subscribe(process.env.REDIS_PUBSUB_CHANNEL, (err, count) => {
      if (err) {
        console.error('Failed to subscribe: %s', err.message);
      } else {
        console.log(`Subscribed successfully! This client is currently subscribed to ${count} channels.`);
      }
    });

    this.subscriber.on('message', (channel, message) => {
      console.log(`Received message from ${channel}: ${message}`);
      this.saveAccessToken(JSON.parse(message));
    });
  }

  private async saveAccessToken(accessKeyData: AccessKey): Promise<void> {
    console.log('saveWeb3TokenInformation');
    console.log(accessKeyData);
    const accessKey = `accessKey:${accessKeyData.key}`;
    const expireAt = accessKeyData.expireAt;
    const expireAtDate = new Date(expireAt);
    this.redisClient.setex(accessKey, Math.floor((expireAtDate.getTime() - Date.now()) / 1000), JSON.stringify(accessKeyData));
  }

  private async useAccessToken(key: string): Promise<AccessKeyUseResponse> {
    // Key for tracking rate limit usage
    const accessKey = `accessKey:${key}`;
    const rateLimitKey = `rateLimit:${key}`;

    // Get the current count for the key
    const currentCount = await this.redisClient.get(rateLimitKey);

    // Retrieve the access token data
    const accessTokenData = await this.redisClient.get(accessKey);
    if (!accessTokenData) {
      throw new NotFoundException('Access token not found');
    }
    const accessKeyData = JSON.parse(accessTokenData);

    // Check if the token has expired
    const { expireAt, rateLimitPerMin } = accessKeyData;
    if (new Date(expireAt) < new Date()) {
      throw new UnauthorizedException('Access token has expired');
    }

    if (currentCount === null) {
      // If the token hasn't been used this minute, set the counter to 1 and set expiration
      await this.redisClient.set(rateLimitKey, 1, 'EX', 60); // EX 60 sets the key to expire in 60 seconds
      const rateLimitData = await this.redisClient.get(rateLimitKey);
      const rateLimitRefreshInSeconds = await this.redisClient.ttl(rateLimitKey);
      return {
        accessKeyData,
        rateLimitData: JSON.parse(rateLimitData),
        rateLimitRefreshInSeconds,
        limitExceeded: false
      };
    } else if (parseInt(currentCount) < rateLimitPerMin) {
      // If the current count is less than the rate limit, increment the counter
      await this.redisClient.incr(rateLimitKey);
      const rateLimitData = await this.redisClient.get(rateLimitKey);
      const rateLimitRefreshInSeconds = await this.redisClient.ttl(rateLimitKey);
      return {
        accessKeyData,
        rateLimitData: JSON.parse(rateLimitData),
        rateLimitRefreshInSeconds,
        limitExceeded: false
      };
    } else {
      // Rate limit exceeded
      console.log("Rate limit exceeded");
      const rateLimitRefreshInSeconds = await this.redisClient.ttl(rateLimitKey);
      return {
        accessKeyData,
        rateLimitData: null,
        rateLimitRefreshInSeconds,
        limitExceeded: true
      };
    }
  }

  async getWeb3TokenInformation(key): Promise<any> {
    const accessKeyUseResponse = await this.useAccessToken(key);
    if (accessKeyUseResponse.limitExceeded) {
      throw new HttpException({
        message: 'Rate limit exceeded. Please try again later.',
        data: accessKeyUseResponse
      }
        , HttpStatus.TOO_MANY_REQUESTS);
    }
    return dummyWeb3TokenData;
  }
}
