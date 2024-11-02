import { DOM } from "./DOM";
import { Logger } from "./Logger";
import { SMarket } from "./SMarket";
import { Util } from "./Util";

// Add this empty export to make this file a module
export {};

export const APPID = {
  Rust: 252490,
  CS2: 730,
};

export const SCurrencies = [
  { idx: 1, symbol: "$", name: "USD" },
  { idx: 2, symbol: "£", name: "GBP" },
  { idx: 3, symbol: "€", name: "EUR" },
];

declare global {
  interface Window {
    ERLib: {
      market: InstanceType<typeof SMarket>;
      dom: typeof DOM;
      util: typeof Util;
      logger: typeof Logger;
      APPID: typeof APPID;
    };
  }
}

// Create global instances
window.ERLib = {
  market: new SMarket(),
  dom: DOM,
  logger: Logger,
  util: Util,
  APPID,
};
