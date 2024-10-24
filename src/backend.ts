import { BaseBackend } from "@sentry/core";
import { Event, EventHint, Options, Severity, Transport } from "@sentry/types";
import { addExceptionMechanism, resolvedSyncPromise } from '@sentry/utils';

import { eventFromString, eventFromUnknownInput } from './eventbuilder';
import { XHRTransport } from "./transports/index";
import { PlatformOptions } from "./platform";


/**
 * 用户可配置的参数信息
 */
export interface MiniappOptions extends Options {
  /**
   * 小程序平台类型
   * 若是传入，则依据传入值初始化平台特有的配置。不会走默认的初始化逻辑
   */
  platform?: PlatformOptions;

  /**
   * 黑名单 - 不上报错误
   */
  blacklistUrls?: Array<string | RegExp>;

  /**
   * 白名单 - 上报错误
   */
  whitelistUrls?: Array<string | RegExp>;
}

/**
 * sdk后端能力。在core内会被baseclient 调用是实例化这个类
 */
export class MiniappBackend extends BaseBackend<MiniappOptions> {
  /**
   * 设置请求
   */
  protected _setupTransport(): Transport {
    if (!this._options.dsn) {
      // 父类的_setupTransport 会new NoopTransport 类
      // 最终会返回一个同步的promise结果，其实就是错误信息
      return super._setupTransport(); 
    }

    const transportOptions = {
      ...this._options.transportOptions,
      dsn: this._options.dsn
    };

    // 使用用户的请求方式
    if (this._options.transport) {
      return new this._options.transport(transportOptions);
    }

    // 使用小程序的默认上报请求方式
    return new XHRTransport(transportOptions);
  }

  /**
   * @inheritDoc 处理异常并将其转换为事件
   * - 捕获到异常调用
   */
  public eventFromException(exception: any, hint?: EventHint): PromiseLike<Event> {
    const syntheticException = (hint && hint.syntheticException) || undefined;
    const event = eventFromUnknownInput(exception, syntheticException, {
      attachStacktrace: this._options.attachStacktrace,
    });
    addExceptionMechanism(event, {
      handled: true,
      type: 'generic',
    });
    event.level = Severity.Error;
    if (hint && hint.event_id) {
      event.event_id = hint.event_id;
    }
    return resolvedSyncPromise(event);
  }
  /**
   * @inheritDoc 处理消息并将其转换为事件
   * - 捕获到异常调用
   */
  public eventFromMessage(message: string, level: Severity = Severity.Info, hint?: EventHint): PromiseLike<Event> {
    const syntheticException = (hint && hint.syntheticException) || undefined;
    const event = eventFromString(message, syntheticException, {
      attachStacktrace: this._options.attachStacktrace,
    });
    event.level = level;
    if (hint && hint.event_id) {
      event.event_id = hint.event_id;
    }
    return resolvedSyncPromise(event);
  }
}
