import { SCurrencies } from ".";
import { Logger, LoggerInjected } from "./Logger";
import { Util } from "./Util";

export class SMarket implements LoggerInjected {
  public logger: Logger;

  private static intervals: Map<NodeJS.Timeout, { itemName: string }> =
    new Map();

  constructor() {
    this.logger = Logger.getLogger("[ERLib Market]");
  }

  public responseCodes = {
    1: "success",
    42: "failure",
  };

  public cancelBuyOrderCreation(interval: NodeJS.Timeout) {
    clearInterval(interval);

    const value = SMarket.intervals.get(interval);
    this.logger.log(`Canceled buy order attempt: ${value?.itemName}`);

    SMarket.intervals.delete(interval);
  }

  public async tryCreateBuyOrder(
    appid: number,
    mHashName: string,
    mItemName: string,
    quantity: number,
    price: number,
    attempts: number,
    delayMS: number
  ) {
    const { wallet_currency } = Util.getWalletInfo();
    const currencyDisp = SCurrencies[wallet_currency - 1].symbol;

    let attempt = 0;

    const interval = setInterval(async () => {
      this.logger.log(
        `(${attempt}) Trying to create buy order: ${mItemName} | ${quantity}x${currencyDisp}${price} (${currencyDisp}${
          price * quantity
        })`
      );

      attempt++;

      if (attempt === attempts) {
        clearInterval(interval);
        SMarket.intervals.delete(interval);
      }
    }, delayMS);

    SMarket.intervals.set(interval, { itemName: mItemName });
    return interval;
  }

  public async createBuyOrder(
    appid: number,
    mHashName: string,
    mItemName: string,
    quantity: number,
    price: number
  ) {
    const price_total = price * quantity * 100;

    const api_endpoint = "https://steamcommunity.com/market/createbuyorder/";
    const sessionid = Util.getSessionID();

    const {
      first_name,
      last_name,
      billing_address,
      billing_address_two,
      billing_country,
      billing_city,
      billing_state,
      billing_postal_code,
      save_my_address,
    } = Util.getCustomerInfo();

    const { wallet_currency } = Util.getWalletInfo();

    const body = `sessionid=${sessionid}&currency=${wallet_currency}&appid=${appid}&market_hash_name=${mHashName.replaceAll(
      " ",
      "+"
    )}&price_total=${price_total}&tradefee_tax=0&quantity=${quantity}&first_name=${first_name}&last_name=${last_name}&billing_address=${encodeURIComponent(
      billing_address?.replaceAll(" ", "+") as string
    )}&billing_address_two=${encodeURIComponent(
      billing_address_two?.replaceAll(" ", "+") as string
    )}&billing_country=${billing_country}&billing_city=${encodeURIComponent(
      billing_city as string
    )}&billing_state=${billing_state}&billing_postal_code=${billing_postal_code}&save_my_address=${save_my_address}`;

    const response = await fetch(api_endpoint, {
      credentials: "include",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:132.0) Gecko/20100101 Firefox/132.0",
        Accept: "*/*",
        "Accept-Language": "en-US,en;q=0.5",
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "X-KL-kfa-Ajax-Request": "Ajax_Request",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-origin",
        Priority: "u=0",
      },
      referrer: `https://steamcommunity.com/market/listings/252490/${encodeURIComponent(
        mItemName
      )}`,
      body,
      method: "POST",
      mode: "cors",
    });

    if (!response.ok) return { success: 42 };

    const data = (await response.json()) as {
      message?: string;
      success: number;
      buy_orderid?: string;
    };

    return {
      message: data.message,
      success: data.success,
      buy_orderid: data.buy_orderid,
    };
  }
}
