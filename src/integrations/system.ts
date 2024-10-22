import { addGlobalEventProcessor, getCurrentHub } from "@sentry/core";
import { Event, Integration } from "@sentry/types";

import { Platform } from "../platform";
import { mergeObjectsWithFixedLength } from "../utils/helper";

/** UserAgent */
export class System implements Integration {
  /**
   * @inheritDoc
   */
  public static id: string = "System";

  /**
   * @inheritDoc
   */
  public name: string = System.id;

  /**
   * 处理不同端一些系统信息。以微信为基础
   */

  private _handleSystemInfo() {
    // https://developers.weixin.qq.com/miniprogram/dev/api/base/system/wx.getAppBaseInfo.html
    let appBaseInfo = {
      SDKVersion: '', // 客户端基础库版本
      host: '', // 当前小程序运行的宿主环境
      language: '', // 客户端语言
      version: '', // 客户端版本
      theme: '', // 主题
    }
    // https://developers.weixin.qq.com/miniprogram/dev/api/base/system/wx.getDeviceInfo.html
    let device = {
      benchmarkLevel: '', // 设备性能等级
      brand: '', // 设备品牌
      model: '', // 设备型号
      system: '', // 操作系统及版本
      platform: '', // 客户端平台
      cpuType: '', // 设备CPU类型
      memorySize: '', // 设备内存大小
    }
    let windowInfo = {
      pixelRatio: '', // 设备像素比
      screenWidth: '', // 屏幕宽度
      screenHeight: '', // 屏幕高度
      windowWidth: '', // 可使用窗口宽度
      windowHeight: '', // 可使用窗口高度
      statusBarHeight: '', // 状态栏的高度
      screenTop: '', // 窗口上边缘的y值
    }
    if (Platform.getAppName() === 'weapp') {
      const sdk = Platform.getSDK();
      if (sdk) {
        appBaseInfo = sdk.getAppBaseInfo?.() || appBaseInfo;
        device = sdk.getDeviceInfo?.() || device;
        windowInfo = sdk.getWindowInfo?.() || windowInfo;
      }
    }
    if (Platform.getAppName() === 'xhs') {
      const data = Platform.getSDK().getSystemInfoSync();
      if (data) {
        appBaseInfo = mergeObjectsWithFixedLength(appBaseInfo, data) as typeof appBaseInfo;
        device = mergeObjectsWithFixedLength(device, data) as typeof device;
        windowInfo = mergeObjectsWithFixedLength(windowInfo, data) as typeof windowInfo;
      }
    }
    return { appBaseInfo, device, windowInfo };
  }

  /**
   * @inheritDoc
   */
  public setupOnce(): void {
    addGlobalEventProcessor((event: Event) => {
      if (getCurrentHub().getIntegration(System)) {
        try {
          const currentAppName = Platform.getAppName();
          const { appBaseInfo, device, windowInfo } = this._handleSystemInfo();
          return {
            ...event,
            contexts: {
              ...event.contexts,
              device,
              extra: {
                app: currentAppName,
                ...appBaseInfo,
                ...windowInfo,
              }
            }
          };
        } catch (e) {
          console.warn(`sentry-miniprogram get system info fail: ${e}`);
        }
      }

      return event;
    });
  }
}
