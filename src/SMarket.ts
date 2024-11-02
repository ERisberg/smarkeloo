import { SCurrencies } from ".";
import { Logger, LoggerInjected } from "./Logger";
import { Util } from "./Util";

export class SMarket implements LoggerInjected {
  public logger: Logger;

  private static intervals: Map<string, NodeJS.Timeout> = new Map();

  private static fetchKeys: Map<string, boolean> = new Map();

  constructor() {
    this.logger = Logger.getLogger("[ERLib Market]");
  }

  static RES_FAILURE = 42;
  static RES_SUCCESS = 1;

  public cancelBuyOrderCreation(mItemName: string) {
    const interval = SMarket.intervals.get(mItemName);
    clearInterval(interval);

    this.logger.log(`Canceled buy order attempt: ${mItemName}`);

    SMarket.intervals.delete(mItemName);
  }

  public async tryCreateBuyOrderInterval(
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

    let response = null;
    let attempt = 0;

    const createOrder = async () => {
      return await this.createBuyOrder(
        appid,
        mHashName,
        mItemName,
        quantity,
        price
      );
    };

    const dispose = () => {
      clearInterval(interval);
      SMarket.intervals.delete(mItemName);
    };

    const interval = setInterval(async () => {
      this.logger.log(
        `(${attempt}) Trying to create buy order: ${mItemName} | ${quantity}x${price}${currencyDisp} (${
          price * quantity
        }${currencyDisp})`
      );

      attempt++;
      response = await createOrder();

      if (response.success === SMarket.RES_FAILURE) {
        this.logger.log(
          `(${attempt}) Failed: ${mItemName}, ${response.message}`
        );
      } else if (response.success === SMarket.RES_SUCCESS) {
        this.logger.log(`(${attempt}) Success: ${mItemName}`);
        dispose();
        return response;
      }

      if (attempt === attempts || response.success === SMarket.RES_SUCCESS) {
        dispose();
        return response;
      }
    }, delayMS);

    SMarket.intervals.set(mItemName, interval);
    return response;
  }

  public cancelBuyOrderAttempt(mItemName: string) {
    SMarket.fetchKeys.delete(mItemName);
  }

  public async tryCreateBuyOrder(
    appid: number,
    mHashName: string,
    mItemName: string,
    quantity: number,
    price: number,
    attempts: number
  ) {
    SMarket.fetchKeys.set(mItemName, true);

    const { wallet_currency } = Util.getWalletInfo();
    const currencyDisp = SCurrencies[wallet_currency - 1].symbol;

    let attempt = 0;

    const createOrder = async () => {
      return await this.createBuyOrder(
        appid,
        mHashName,
        mItemName,
        quantity,
        price
      );
    };

    let response = await createOrder();

    const checkKey = () => {
      const val = SMarket.fetchKeys.get(mItemName);
      if (val === false || val === undefined) return false;

      return true;
    };

    const checkAttempt = () => {
      if (attempts < 0) return true;

      return attempt < attempts;
    };

    while (
      response.success === SMarket.RES_FAILURE &&
      checkKey() &&
      checkAttempt()
    ) {
      this.logger.log(
        `(${attempt}) Trying to create buy order: ${mItemName} | ${quantity}x${currencyDisp}${price} (${currencyDisp}${
          price * quantity
        })`
      );

      response = await createOrder();
      attempt++;

      if (response.success === SMarket.RES_FAILURE) {
        this.logger.log(`(${attempt}) Failed: retrying ${mItemName}`);
      }
    }

    if (response.success === SMarket.RES_SUCCESS) {
      this.logger.log(
        `(${attempt}) Buy order success: ${mItemName} | ${quantity}x${currencyDisp}${price} (${currencyDisp}${
          price * quantity
        })`
      );
    }

    SMarket.fetchKeys.delete(mItemName);
    return response;
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
