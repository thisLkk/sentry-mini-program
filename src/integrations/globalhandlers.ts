import { getCurrentHub } from "@sentry/core";
import { Integration } from "@sentry/types";
import { Platform } from "../platform";
import { Logger } from "../utils/logger";
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
    Logger.log('GlobalHandlers constructor', ['init']);
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
      this._installGlobalOnErrorHandler();
    }
    if (this._options.onunhandledrejection) {
      this._installGlobalOnUnhandledRejectionHandler();
    }
    if (this._options.onpagenotfound) {
      this._installGlobalOnPageNotFoundHandler();
    }
    if (this._options.onmemorywarning) {
      this._installGlobalOnMemoryWarningHandler();
    }
  }

  private _installGlobalOnErrorHandler(): void {
    if (this._onErrorHandlerInstalled) {
      return;
    }
    const onError = Platform.getSDK().onError;
    if (!!onError) {
      const currentHub = getCurrentHub();
      onError((err: string | object) => {
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
    const onUnhandledRejection = Platform.getSDK().onUnhandledRejection;
    if (!!onUnhandledRejection) {
      const currentHub = getCurrentHub();
      interface OnUnhandledRejectionRes {
        reason: string | object;
        promise: Promise<any>;
      }
      onUnhandledRejection(
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
    const onPageNotFound = Platform.getSDK().onPageNotFound;
    if (!!onPageNotFound) {
      const currentHub = getCurrentHub();
      onPageNotFound((res: { path: string }) => {
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
    const onMemoryWarning = Platform.getSDK().onMemoryWarning;
    if (!!onMemoryWarning) {
      const currentHub = getCurrentHub();
      onMemoryWarning(({ level = -1 }: { level: number }) => {
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
