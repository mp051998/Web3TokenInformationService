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

  async getWeb3TokenInformation(): Promise<any> {
    return dummyWeb3TokenData;
  }
}
