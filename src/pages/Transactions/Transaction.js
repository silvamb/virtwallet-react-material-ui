
import { CategoryLoader } from '../Category/Category';
import { ChangeSet, create, load, loadFromStorage, update, remove } from '../../utils/dataSync';

function merger(transactions, changeSet) {
  console.log("Looking for transaction ", changeSet.oldState.txId);
  const tx = transactions.find(transaction => transaction.txId === changeSet.oldState.txId);
  const indexOfTx = transactions.indexOf(tx);
  console.log("Found transaction ",changeSet.oldState.txId, " at index ", indexOfTx);
  const updatedTransactions = transactions.slice();
  updatedTransactions[indexOfTx] = changeSet.newState;

  return updatedTransactions;
}

function diff(changeSet) {
  const originalTransaction = changeSet.oldState;
  const updatedTransaction = changeSet.newState;
  const old = {};
  const updated = {};

  for(let attr in originalTransaction) {
    if(originalTransaction[attr] !== updatedTransaction[attr]) {
      old[attr] = originalTransaction[attr];
      updated[attr] = updatedTransaction[attr];
    }
  }

  return {
    txDate: originalTransaction.txDate,
    old: old,
    "new": updated
  }
}

export function saveTransaction(originalTransaction, updatedTransaction, onSave) {
  const changeSet = new ChangeSet(originalTransaction, updatedTransaction, diff);
  
  const changes = diff(changeSet);
  if(Object.keys(changes.old) == 0) {
    console.log("No changes made to transaction, ignoring");
    return;
  }

  const txId = originalTransaction.txId;
  const accountId = originalTransaction.accountId;
  const walletId = originalTransaction.walletId;
  const resourcePath = `/account/${accountId}/wallet/${walletId}/transaction/${txId}`;

  update({
    key: `transactions_${accountId}_${walletId}`,
    changeSet: changeSet,
    merger: merger,
    resourcePath: resourcePath,
    callback: onSave,
  });

}

class TransactionLoader {

  constructor(setTransactions, messageHandler) {
    this.setTransactions = setTransactions;
    this.messageHandler = messageHandler;
  }

  async load(accountId, walletId, dateFilter) {
    console.log("Loading transactions for account", accountId, "and wallet", walletId, "period", dateFilter);
    // TODO think a simple logic to load recent transactions
    const params = {
      key: `transactions_${accountId}_${walletId}`,
      resourcePath: `/account/${accountId}/wallet/${walletId}/transaction`,
      queryParams: {
        from: dateFilter.startDate,
        to: dateFilter.endDate
      }
    }

    try {
      const loadedTransactions = await load(params);

      const filteredTransactions = loadedTransactions.filter(tx => tx.txDate >= dateFilter.startDate && tx.txDate <= dateFilter.endDate); 
      this.setTransactions(filteredTransactions);
    } catch(err) {
      console.log("Error loading transactions", err);
      this.messageHandler.showMessage("error_loading_transactions");
      this.setTransactions([]);
    }
  }

}

export class DataLoader {
  constructor(setter, messageHandler) {
    this.setter = setter;
    this.messageHandler = messageHandler;
  }

  async load(accountId, walletId, dateFilter) {
    const data = {
      categories: [],
      transactions: [],
    };

    const categorySetter = (categories) => data.categories = categories;
    const transactionSetter = (transactions) => data.transactions = transactions;

    const categoryLoader = new CategoryLoader(
      categorySetter,
      this.messageHandler
    );
    const transactionLoader = new TransactionLoader(transactionSetter, this.messageHandler);

    await Promise.all([
      categoryLoader.loadCategories(accountId, walletId, dateFilter),
      transactionLoader.load(accountId, walletId, dateFilter)
    ]);

    this.setter(data);
  }
}