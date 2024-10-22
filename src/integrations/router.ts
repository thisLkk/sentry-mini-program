import { addGlobalEventProcessor, getCurrentHub } from "@sentry/core";
import { Event, Integration } from "@sentry/types";
import { Platform } from "../platform";
import { parseQueryString } from "../utils/helper";

declare const getCurrentPages: any;

/** JSDoc */
interface RouterIntegrations {
  enable?: boolean;
}

/** UserAgent */
export class Router implements Integration {
  /**
   * @inheritDoc
   */
  public static id: string = "Router";

  /**
   * @inheritDoc
   */
  public name: string = Router.id;

  /** JSDoc */
  private readonly _options: RouterIntegrations;

  /**
   * @inheritDoc
   */
  public constructor(options?: RouterIntegrations) {
    this._options = {
      enable: true,
      ...options,
    };
  }

  /**
   * @inheritDoc
   */
  public setupOnce(): void {
    addGlobalEventProcessor((event: Event) => {
      if (getCurrentHub().getIntegration(Router)) {
        if (this._options.enable) {
          try {
            const routers = getCurrentPages().map(
              (route: { route: string; options: object; data: any }) => {
                let options = route.options
                // 小红书没有 options 字段
                if (Platform.getAppName() === 'xhs' && route?.data?.root?.uid) {
                  options = parseQueryString(route.data.root.uid)
                }
                return {
                  route: route.route,
                  options: options,
                }
              }
            );

            return {
              ...event,
              extra: {
                ...event.extra,
                routers,
              },
            };
          } catch (e) {
            console.warn(`sentry-miniprogram get router info fail: ${e}`);
          }
        }
      }

      return event;
    });
  }
}
