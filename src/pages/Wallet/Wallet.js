import { ChangeSet, create, load, update, remove, putInRestApi, cleanLocal } from '../../utils/dataSync';
import { AccountLoader } from '../Account/Account' 

export function createWallet(wallet, onCreate, messageHandler) {
    const resourcePath = `/account/${wallet.accountId}/wallet`;
  
    const merger = (current, created) => {
      const updated = current.slice();
      updated.push(created);
  
      return updated;
    }

    create({
      key: `wallets_${wallet.accountId}`,
      merger: merger,
      resourcePath: resourcePath,
      body: wallet,
      callback: onCreate,
    }).catch((err) => {
      console.log("Error creating wallet", err);
      messageHandler.showMessage("error_creating_wallet");
    });
  }

function updateMerger(wallets, changeSet) {
  console.log("Merging", wallets, changeSet);
  const walletId = changeSet.oldState.walletId;

  const oldWallet = wallets.find(wallet => wallet.walletId === walletId);
  const indexOfRule = wallets.indexOf(oldWallet);
  console.log("Found wallet", walletId, "at", indexOfRule);

  const updatedWallets = Object.assign({}, wallets);
  updatedWallets[indexOfRule] = changeSet.newState;

  console.log("Merged", updatedWallets);

  return updatedWallets;
}

export function saveWallet(originalWallet, updatedWallet, onSave, messageHandler) {
  const changeSet = new ChangeSet(originalWallet, updatedWallet);
  
  const changes = changeSet.diff();
  if(Object.keys(changes.old).length === 0) {
    messageHandler.showMessage('no_changes_made');
    console.log("No changes made to Wallet, ignoring");
    return;
  }

  console.log("Saving wallet changes", changes);

  const accountId = originalWallet.accountId; 
  const walletId = originalWallet.walletId;
  const resourcePath = `/account/${accountId}/wallet/${walletId}`;

    update({
      key: `wallets_${accountId}`,
      changeSet: changeSet,
      merger: updateMerger,
      resourcePath: resourcePath,
      callback: onSave,
    }).catch((err) => {
      console.log("Error saving Wallet", err);
      messageHandler.showMessage("error_saving_wallet");
    });
}

function deleteMerger(wallets, itemToDelete) {
  console.log("Removing", itemToDelete.walletId, "from", wallets);

  const walletId = itemToDelete.walletId;

  const oldWallet = wallets.find(wallet => wallet.walletId === walletId);
  const indexOfRule = wallets.indexOf(oldWallet);
  console.log("Found wallet", walletId, "at", indexOfRule);

  const updatedWallets = wallets.slice();
  updatedWallets.splice(indexOfRule, 1);

  console.log("Merged", updatedWallets);

  return updatedWallets;
}

export function deleteWallet(wallet, onDelete, messageHandler) {
  const accountId = wallet.accountId; 
  const walletId = wallet.walletId;
  const resourcePath = `/account/${accountId}/wallet/${walletId}`;

  remove({
    key: `wallets_${accountId}`,
    itemToDelete: wallet,
    merger: deleteMerger,
    resourcePath: resourcePath,
    callback: onDelete,
  }).catch((err) => {
    console.log("Error deleting wallet", err)
    messageHandler.showMessage("error_deleting_wallet");
  });
}

export async function reclassifyTransactions({accountId, walletId, fromDate, toDate, sourceType}) {
  const resourcePath = `/account/${accountId}/wallet/${walletId}/reclassify`;

  const queryParams = {
    filters: sourceType,
    from: fromDate,
    to: toDate
  }

  const response = await putInRestApi({resourcePath, queryParams});
  return response;
}

export function cleanTransactions(accountId, walletId) {
  cleanLocal(`transactions_${accountId}_${walletId}`);
}

function loadWallet(walletsLoader) {
  const walletsFromAllAccounts = []

  const setter = (wallets) => walletsFromAllAccounts.push(wallets);

  walletsLoader.load()
}

export class WalletsLoader {

  constructor(setter, messageHandler) {
    this.setter = setter;
    this.messageHandler = messageHandler;
  }

  async load(accountId) {
    console.log("Loading wallets for account: ", accountId);
    const params = {
      key: `wallets_${accountId}`,
      resourcePath: `/account/${accountId}/wallet`
    }

    try {
      const loadedWallets = await load(params);

      this.setter(loadedWallets);
    } catch(err) {
      console.log("Error loading wallets", err);
      this.messageHandler.showMessage("error_loading_wallets");
      this.setter([]);
    }
  }

  async loadAll() {
    const dummyAccountSetter = (account) => account;
    const dummyMessageHandler = { showMessage: (messageKey) => messageKey };
    const accountLoader = new AccountLoader(dummyAccountSetter, dummyMessageHandler);
    const accounts = await accountLoader.loadAccounts();

    console.log("Loading wallets for all accounts from the user");
    const promises = accounts.map(account => {
      const params = {
        key: `wallets_${account.accountId}`,
        resourcePath: `/account/${account.accountId}/wallet`
      };
      return load(params);
    })

    try {
      const wallets = await Promise.all(promises);
      const flatWallets = wallets.reduce((acc, val) => acc.concat(val), []);
      this.setter(flatWallets);
    } catch(err) {
      console.log("Error loading wallets", err);
      this.messageHandler.showMessage("error_loading_wallets");
      this.setter([]);
    }
  }

}

export class Wallet {

    constructor() {
        this.accountId = "";
        this.walletId = "";
        this.ownerId = "";
        this.name = "";
        this.description = "";
        this.type = "";
    }
}