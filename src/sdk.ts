import {
    initAndBind,
  } from "@sentry/core";

import { MiniappOptions } from "./backend";
import { MiniappClient } from "./client";
  

  export function init(options: MiniappOptions = {}): void {
  
    initAndBind(MiniappClient, options);
  }
  