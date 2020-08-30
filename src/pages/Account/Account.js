import { load } from "../../utils/dataSync";

export class AccountLoader {
  constructor(setter, messageHandler) {
    this.setter = setter;
    this.messageHandler = messageHandler;
  }

  async loadAccounts() {
    console.log("Loading accounts");
    const params = {
      key: "accounts",
      resourcePath: "/account",
    };

    try {
      const loadedAccounts = await load(params);
      this.setter(loadedAccounts);
      return loadedAccounts;
    } catch (err) {
      console.log("Error loading accounts", err);
      this.messageHandler.showMessage("error_loading_accounts");
      this.setter([]);
      return [];
    }
  }

  async loadAccount(accountId) {
    console.log("Loading account");
    const params = {
      key: "accounts",
      resourcePath: "/account",
    };

    try {
      const loadedAccounts = await load(params);
      const account = loadedAccounts.find(
        (account) => account.accountId === accountId
      );

      if (!account) {
        throw new Error(`Account not found ${accountId}`);
      }

      this.setter(account);
      return account;
    } catch (err) {
      console.log("Error loading accounts", err);
      this.messageHandler.showMessage("error_loading_accounts");
      this.setter();
    }
  }
}

export function cloneAccount(account) {
  const clone = Object.assign({}, account);
  clone.monthStartDateRule = Object.assign({}, account.monthStartDateRule);

  return clone;
}
