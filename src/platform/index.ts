declare const wx: any; // 微信小程序、微信小游戏
declare const tt: any; // 字节小程序
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
}

// 单例模式 确保sdk和appName只初始化一次
export class Platform {
  private static instance: Platform;
  private static _SDK: SDK | undefined;
  private static _appName: PlatformOptions;

  private constructor(options?: PlatformOptions) {
    Platform.initSDK(options);
  }

  private static setupDefaultPlatform = () => {
    if (typeof wx === "object") {
      Platform._SDK = wx;
      Platform._appName = 'weapp';
    } else if (typeof tt === "object") {
      Platform._SDK = tt;
      Platform._appName = 'tt';
    } else {
      throw new Error("***sentry-miniprogram*** 暂不支持此平台");
    }
    console.log(`【Sentry-mini-program】当前运行环境为: `, Platform._appName, Platform._SDK);
  };

  private static setupUserPlatform = (options: PlatformOptions) => {
    if (options === 'weapp') {
      Platform._SDK = wx;
      Platform._appName = 'weapp';
    } else if (options === 'tt') {
      Platform._SDK = tt;
      Platform._appName = 'tt';
    } else {
      throw new Error("***sentry-miniprogram*** 暂不支持此平台");
    }
    console.log(`【Sentry-mini-program】当前运行环境为: `, Platform._appName, Platform._SDK);
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
