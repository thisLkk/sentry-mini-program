import { API } from "@sentry/core";
import { Event, Response, Transport, TransportOptions } from "@sentry/types";
import { makePromiseBuffer, PromiseBuffer, SentryError } from "@sentry/utils";

/** Base Transport class implementation */
export abstract class BaseTransport implements Transport {
  /**
   * @inheritDoc
   */
  public url: string;

  /** A simple buffer holding all requests. */
  protected readonly _buffer: PromiseBuffer<Response> = makePromiseBuffer(30);

  public constructor(public options: TransportOptions) {
    // TODO:若是升级版本注意此处
    this.url = new API(this.options.dsn).getStoreEndpointWithUrlEncodedAuth();
  }

  /**
   * @inheritDoc
   */
  public sendEvent(_: Event): PromiseLike<Response> {
    throw new SentryError(
      "Transport Class has to implement `sendEvent` method"
    );
  }

  /**
   * @inheritDoc
   */
  public close(timeout?: number): PromiseLike<boolean> {
    return this._buffer.drain(timeout);
  }
}
