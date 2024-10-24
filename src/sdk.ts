import { initAndBind, Integrations as CoreIntegrations, } from "@sentry/core";
import { MiniappOptions } from "./backend";
import { MiniappClient } from "./client";
import { Platform } from "./platform";

import {
  GlobalHandlers,
  IgnoreMpcrawlerErrors,
  LinkedErrors,
  Router,
  System,
  TryCatch,
} from "./integrations/index";

export const defaultIntegrations = [
  new CoreIntegrations.InboundFilters(),
  new CoreIntegrations.FunctionToString(),
  new TryCatch(),
  new GlobalHandlers(),
  new LinkedErrors(),

  new System(),
  new Router(),
  new IgnoreMpcrawlerErrors(),
];

export function init(options: MiniappOptions = {}): void {
  Platform.getInstance(options.platform);
  if (options.defaultIntegrations === undefined) {
    options.defaultIntegrations = defaultIntegrations;
  }
  // https://github.com/lizhiyao/sentry-miniapp/issues/23
  options.normalizeDepth = options.normalizeDepth || 5;
  initAndBind(MiniappClient, options);
  console.log('【Sentry-mini-program】SDK init success');
}
