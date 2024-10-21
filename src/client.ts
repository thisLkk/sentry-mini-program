import { BaseClient, Scope } from "@sentry/core";
import { MiniappBackend, MiniappOptions } from "./backend";
import { Event, EventHint } from "@sentry/types";
import { SDK_NAME, SDK_VERSION } from "./meta-info/constants";

/**
 * 小程序的实例类，提供给sentry/core使用
 * 继承于sentry/coreBaseClient
 */
export class MiniappClient extends BaseClient<MiniappBackend, MiniappOptions> {
  /**
   * 调用父类，获取继承能力
   */
  public constructor(options: MiniappOptions = {}) {
    // BaseClient 会执行new backendClass 类型
    super(MiniappBackend, options);
  }
  /**
   * @inheritDoc
   */
  protected _prepareEvent(event: Event, scope?: Scope, hint?: EventHint): PromiseLike<Event | null> {
    event.platform = event.platform || "javascript";
    event.sdk = {
      ...event.sdk,
      name: SDK_NAME,
      packages: [
          ...((event.sdk && event.sdk.packages) || []),
          {
            name: "npm:@sentry/miniprogram",
            version: SDK_VERSION
          }
        ],
      version: SDK_VERSION
    };

    return super._prepareEvent(event, scope, hint);
  }
}
