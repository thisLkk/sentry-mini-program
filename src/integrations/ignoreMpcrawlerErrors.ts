import { addGlobalEventProcessor, getCurrentHub } from "@sentry/core";
import { Event, Integration } from "@sentry/types";
import { Platform } from "../platform";
import { Logger } from "../utils/logger";

/**
 * IgnoreMpcrawlerErrors
 *
 * https://developers.weixin.qq.com/miniprogram/dev/reference/configuration/sitemap.html
 */
export class IgnoreMpcrawlerErrors implements Integration {
  /**
   * @inheritDoc
   */
  public static id: string = "IgnoreMpcrawlerErrors";
  
  /**
   * @inheritDoc
   */
  public name: string = IgnoreMpcrawlerErrors.id;


  /**
   * @inheritDoc
   */
  public setupOnce(): void {
    Logger.log('IgnoreMpcrawlerErrors setupOnce', ['init']);
    addGlobalEventProcessor((event: Event) => {
      const currentAppName = Platform.getAppName();
      const currentSdk = Platform.getSDK();
      if (
        getCurrentHub().getIntegration(IgnoreMpcrawlerErrors) &&
        currentAppName === "weapp" &&
        currentSdk.getLaunchOptionsSync
      ) {
        const options = currentSdk.getLaunchOptionsSync();

        if (options.scene === 1129) {
          return null;
        }
      }

      return event;
    });
  }
}
