import { AccessKey } from "./access-key.model";

export interface AccessKeyUseResponse {
  accessKeyData: AccessKey;
  rateLimitRefreshInSeconds: number;
  limitExceeded: boolean;
}
