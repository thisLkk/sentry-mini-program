import { addGlobalEventProcessor, getCurrentHub } from "@sentry/core";
import { Event, Integration } from "@sentry/types";
import { Logger } from "../utils/logger";

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
    Logger.log('Router constructor', ['init']); 
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
              (route: { route: string; options: object }) => ({
                route: route.route,
                options: route.options,
              })
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
