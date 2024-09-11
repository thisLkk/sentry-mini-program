import { getCurrentHub } from "@sentry/core";
import { Integration } from "@sentry/types";
import { logger } from "@sentry/utils";
import { sdk } from "../crossPlatform";
interface GlobalHandlersIntegrations {
  onerror: boolean;
  onunhandledrejection: boolean;
  onpagenotfound: boolean;
  onmemorywarning: boolean;
}

/** 全局设置监听函数 - 小程序共有相同函数 */
export class GlobalHandlers implements Integration {
  public static id: string = "GlobalHandlers";
  public name: string = GlobalHandlers.id;
  private readonly _options: GlobalHandlersIntegrations;
  private _onErrorHandlerInstalled: boolean = false;
  private _onUnhandledRejectionHandlerInstalled: boolean = false;
  private _onPageNotFoundHandlerInstalled: boolean = false;
  private _onMemoryWarningHandlerInstalled: boolean = false;
  public constructor(options?: GlobalHandlersIntegrations) {
    this._options = {
      onerror: true,
      onunhandledrejection: true,
      onpagenotfound: true,
      onmemorywarning: true,
      ...options,
    };
  }
  public setupOnce(): void {
    if (this._options.onerror) {
      logger.log("Global Handler attached: onError");
      this._installGlobalOnErrorHandler();
    }
    if (this._options.onunhandledrejection) {
      logger.log("Global Handler attached: onunhandledrejection");
      this._installGlobalOnUnhandledRejectionHandler();
    }
    if (this._options.onpagenotfound) {
      logger.log("Global Handler attached: onPageNotFound");
      this._installGlobalOnPageNotFoundHandler();
    }
    if (this._options.onmemorywarning) {
      logger.log("Global Handler attached: onMemoryWarning");
      this._installGlobalOnMemoryWarningHandler();
    }
  }

  private _installGlobalOnErrorHandler(): void {
    if (this._onErrorHandlerInstalled) {
      return;
    }
    if (!!sdk.onError) {
      const currentHub = getCurrentHub();
      sdk.onError((err: string | object) => {
        console.info("【sentry-mini-program】=======>", err);
        const error = typeof err === 'string' ? new Error(err) : err
        currentHub.captureException(error);
      });
    }
    this._onErrorHandlerInstalled = true;
  }

  private _installGlobalOnUnhandledRejectionHandler(): void {
    if (this._onUnhandledRejectionHandlerInstalled) {
      return;
    }
    if (!!sdk.onUnhandledRejection) {
      const currentHub = getCurrentHub();
      interface OnUnhandledRejectionRes {
        reason: string | object;
        promise: Promise<any>;
      }
      sdk.onUnhandledRejection(
        ({ reason, promise }: OnUnhandledRejectionRes) => {
          // 为什么官方文档上说 reason 是 string 类型，但是实际返回的确实 object 类型
          const error = typeof reason === 'string' ? new Error(reason) : reason
          currentHub.captureException(error, {
            data: promise,
          });
        }
      );
    }
    this._onUnhandledRejectionHandlerInstalled = true;
  }

  private _installGlobalOnPageNotFoundHandler(): void {
    if (this._onPageNotFoundHandlerInstalled) {
      return;
    }
    if (!!sdk.onPageNotFound) {
      const currentHub = getCurrentHub();
      sdk.onPageNotFound((res: { path: string }) => {
        const url = res.path.split("?")[0];
        currentHub.setTag("pagenotfound", url);
        currentHub.setExtra("message", JSON.stringify(res));
        currentHub.captureMessage(`页面无法找到: ${url}`);
      });
    }

    this._onPageNotFoundHandlerInstalled = true;
  }
  private _installGlobalOnMemoryWarningHandler(): void {
    if (this._onMemoryWarningHandlerInstalled) {
      return;
    }
    if (!!sdk.onMemoryWarning) {
      const currentHub = getCurrentHub();
      sdk.onMemoryWarning(({ level = -1 }: { level: number }) => {
        let levelMessage = "没有获取到告警级别信息";
        switch (level) {
          case 5:
            levelMessage = "TRIM_MEMORY_RUNNING_MODERATE";
            break;
          case 10:
            levelMessage = "TRIM_MEMORY_RUNNING_LOW";
            break;
          case 15:
            levelMessage = "TRIM_MEMORY_RUNNING_CRITICAL";
            break;
          default:
            return;
        }
        currentHub.setTag("memory-warning", String(level));
        currentHub.setExtra("message", levelMessage);
        currentHub.captureMessage(`内存不足告警`);
      });
    }

    this._onMemoryWarningHandlerInstalled = true;
  }
}
