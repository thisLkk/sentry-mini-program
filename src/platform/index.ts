declare const wx: any; // 微信小程序、微信小游戏
declare const tt: any; // 字节小程序
declare const xhs: any; // 小红书小程序
export type PlatformOptions = "tt" | "weapp" | "xhs" | "kwai" | "swan" | "alipay" | "h5" | "rn" | "quickapp" | "qq" | "jd"; // 扩展平台选项

interface SDK {
  request: Function;
  httpRequest?: Function; // 针对钉钉小程序
  getSystemInfoSync: Function;
  onError?: Function;
  onUnhandledRejection?: Function;
  onPageNotFound?: Function;
  onMemoryWarning?: Function;
  getLaunchOptionsSync?: Function;
  getAppBaseInfo?: Function;
  getDeviceInfo?: Function;
  getWindowInfo?: Function;
}

// 单例模式 确保sdk和appName只初始化一次
export class Platform {
  private static instance: Platform;
  private static _SDK: SDK | undefined;
  private static _appName: PlatformOptions;

  private constructor(options?: PlatformOptions) {
    Platform.initSDK(options);
  }

  private static setupPlatform = (sdk: any, appName: PlatformOptions) => {
    Platform._SDK = sdk;
    Platform._appName = appName;
    console.log(`【Sentry-mini-program】当前运行环境为: `, Platform._appName, Platform._SDK);
  };

  private static setupDefaultPlatform = () => {
    if (typeof wx === "object") {
      Platform.setupPlatform(wx, 'weapp');
    } else if (typeof tt === "object") {
      Platform.setupPlatform(tt, 'tt');
    } else if (typeof xhs === "object") {
      Platform.setupPlatform(xhs, 'xhs');
    } else {
      throw new Error("***sentry-miniprogram*** 暂不支持此平台");
    }
  };

  private static setupUserPlatform = (options: PlatformOptions) => {
    switch (options) {
      case 'weapp':
        Platform.setupPlatform(wx, 'weapp');
        break;
      case 'tt':
        Platform.setupPlatform(tt, 'tt');
        break;
      case 'xhs':
        Platform.setupPlatform(xhs, 'xhs');
        break;
      default:
        throw new Error("***sentry-miniprogram*** 暂不支持此平台");
    }
  };

  private static initSDK(options?: PlatformOptions): void {
    if (!options) {
      this.setupDefaultPlatform();
      return;
    }
    this.setupUserPlatform(options);
  }

  public static getInstance(options?: PlatformOptions): Platform {
    if (!Platform.instance) {
      Platform.instance = new Platform(options);
    }
    return Platform.instance;
  }

  public static getSDK(): SDK {
    if (!this._SDK) {
      throw new Error("***sentry-miniprogram*** 暂不支持此平台");
    }
    return this._SDK;
  }

  public static getAppName(): PlatformOptions {
    return this._appName;
  }
}

const getCurrentSdk = () => Platform.getSDK();
const getCurrentAppName = () => Platform.getAppName();

export { getCurrentSdk, getCurrentAppName };
