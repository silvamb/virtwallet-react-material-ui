
import { CategoryLoader } from '../Category/Category';
import { ChangeSet, load, loadFromRestApi, saveInStorage, update } from '../../utils/dataSync';

class TransactionMetadata {
  constructor({
    max,
    min,
    lastQueryParams,
    lastQueryTime = new Date().getTime(),
    updatedAt = new Date(),
    updatedTime = new Date().getTime()
  }) {
    this.max = max;
    this.min = min;
    this.lastQueryParams = lastQueryParams;
    this.lastQueryTime = lastQueryTime;
    this.updatedAt = updatedAt;
    this.updatedTime = updatedTime;
  }
}

class TransactionData {
  constructor(transactionMetadata = new TransactionMetadata(), data = []) {
    this.metadata = transactionMetadata;
    this.data = data; 
  }
}

function merger(transactions = new TransactionData(), changeSet) {
  console.log("Looking for transaction ", changeSet.oldState.txId);
  const tx = transactions.data.find(transaction => transaction.txId === changeSet.oldState.txId);
  const indexOfTx = transactions.data.indexOf(tx);
  console.log("Found transaction ", changeSet.oldState.txId, " at index ", indexOfTx);
  const updatedTransactions = transactions.data.slice();
  updatedTransactions[indexOfTx] = changeSet.newState;

  return new TransactionData(transactions.metadata, updatedTransactions);
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
  console.log("Transaction changes", changes);

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

function shouldGetFromRestApi({from, to}, {max, min, lastQueryParams, lastQueryTime}) {
  const now = new Date().getTime();
  const twelveHours = 12 * 60 * 60 * 1000;

  console.log("Checking if transaction data should be retrieved from REST API", {from, to, max, min, lastQueryParams, lastQueryTime});

  // No transactions has been loaded
  if(!(max && min)) {
    return true;
  }

  const maxDateNeedUpdate = max < to && (lastQueryParams.to < to || now - lastQueryTime > twelveHours);
  const minDateNeedsUpdate = from < min && from < lastQueryParams.from;

  return maxDateNeedUpdate || minDateNeedsUpdate;
}

function transactionTransformer(transactions = [], queryParams) {

  if(transactions.length === 0) {
    return {
      metadata: {
        lastQueryParams: queryParams,
        lastQueryTime: new Date().getTime(),
        updatedAt: new Date(),
        updatedTime: new Date().getTime()
      },
      data: transactions
    };
  }

  const max = transactions.reduce((t1, t2) => t1.txDate >= t2.txDate ? t1 : t2);
  const min = transactions.reduce((t1, t2) => t1.txDate <= t2.txDate ? t1 : t2);

  return {
    metadata: {
      max: max.txDate,
      min: min.txDate,
      lastQueryParams: queryParams,
      lastQueryTime: new Date().getTime(),
      updatedAt: new Date(),
      updatedTime: new Date().getTime()
    },
    data: transactions
  };
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
      },
      transformer: transactionTransformer
    }

    try {
      let loadedTransactions = await load(params);

      if(shouldGetFromRestApi(params.queryParams, loadedTransactions.metadata)) {
        console.log("Checking for new transactions, params:", params.queryParams);
        const updatedTransactions = await loadFromRestApi(params.resourcePath, params.queryParams);
        loadedTransactions = transactionTransformer(updatedTransactions, params.queryParams);    
        saveInStorage(params.key, loadedTransactions);
      }

      const filteredTransactions = loadedTransactions.data.filter(tx => tx.txDate >= dateFilter.startDate && tx.txDate <= dateFilter.endDate); 
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