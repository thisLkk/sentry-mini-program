import { BaseClient } from "@sentry/core";
import { MiniappBackend, MiniappOptions } from "./backend";

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
}
