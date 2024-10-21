import { Event, Response } from "@sentry/types";
import { eventStatusFromHttpCode } from '@sentry/utils';

import { BaseTransport } from "./base";
import { Platform } from "../platform";

/** `XHR` based transport */
export class XHRTransport extends BaseTransport {
  /**
   * request 使用各端的request能力
   * TODO: 若是有新增的小程序，需要在sdk进行适配
   */
  public sendEvent(event: Event): PromiseLike<Response> | any {
    const request = Platform.getSDK().request || Platform.getSDK().httpRequest;
    return this._buffer.add(
      () => new Promise<Response>((resolve, reject) => {
        // tslint:disable-next-line: no-unsafe-any
        request({
          url: this.url,
          method: "POST",
          data: JSON.stringify(event),
          header: {
            "content-type": "application/json"
          },
          success(res: { statusCode: number }): void {
            resolve({
              status: eventStatusFromHttpCode(res.statusCode)
            });
          },
          fail(error: object): void {
            reject(error);
          }
        });
      })
    );
  }
}
