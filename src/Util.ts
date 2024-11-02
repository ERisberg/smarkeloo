import { Logger, LoggerInjected } from "./Logger";

export class Util implements LoggerInjected {
  public logger: Logger;

  constructor() {
    this.logger = Logger.getLogger("[ERLib Util]");
  }

  public static getCookie(cname: string) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(";");
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == " ") {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  }

  public static getSessionID() {
    return this.getCookie("sessionid");
  }

  public static getWalletInfo() {
    return (window as any).g_rgWalletInfo;
  }

  public static getInputValue(identifier: string) {
    return document.querySelector<HTMLInputElement>(identifier)?.value;
  }

  public static getCustomerInfo() {
    const first_name = this.getInputValue("#first_name");

    const last_name = this.getInputValue("#last_name");

    const billing_address = this.getInputValue("#billing_address");

    const billing_address_two = this.getInputValue("#billing_address_two");

    const billing_country = this.getInputValue("#billing_country");

    const billing_city = this.getInputValue("#billing_city");

    const billing_state = this.getInputValue("#billing_state");

    const billing_postal_code = this.getInputValue("#billing_postal_code");

    const save_my_address = this.getInputValue("#save_my_address");

    return {
      first_name,
      last_name,
      billing_address,
      billing_address_two,
      billing_country,
      billing_city,
      billing_state,
      billing_postal_code,
      save_my_address,
    };
  }
}
