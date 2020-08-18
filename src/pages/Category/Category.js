import { ChangeSet, create, load, update } from '../../utils/dataSync';

function merger(categories, changeSet) {
  console.log("Looking for category ", changeSet.oldState.categoryId);
  const category = categories.find(category => category.categoryId === changeSet.oldState.categoryId);
  const indexOfCategoryId = categories.indexOf(category);
  console.log("Found category ",changeSet.oldState.categoryId, " at index ", indexOfCategoryId);
  const updatedCategories = categories.slice();
  updatedCategories[indexOfCategoryId] = changeSet.newState;

  return updatedCategories;
}

function diff(changeSet) {
  const originalCategory = changeSet.oldState;
  const updatedCategory = changeSet.newState;
  const old = {};
  const updated = {};

  for(let attr in originalCategory) {
    if(originalCategory[attr] !== updatedCategory[attr]) {
      old[attr] = originalCategory[attr];
      updated[attr] = updatedCategory[attr];
    }
  }

  return {
    old: old,
    "new": updated
  }
}

export function saveCategory(originalCategory, updatedCategory, onSave, messageHandler) {
  const changeSet = new ChangeSet(originalCategory, updatedCategory, diff);
  
  const changes = diff(changeSet);
  if(Object.keys(changes.old).length === 0) {
    messageHandler.showMessage('no_changes_made');
    console.log("No changes made to category, ignoring");
    return;
  }

  console.log("Changes", changes);

  const accountId = originalCategory.accountId;
  const categoryId = originalCategory.categoryId;
  const resourcePath = `/account/${accountId}/category/${categoryId}`;


    update({
      key: `categories_${accountId}`,
      changeSet: changeSet,
      merger: merger,
      resourcePath: resourcePath,
      callback: onSave,
    }).catch(() => {
      messageHandler.showMessage("error_saving_category");
    });
}

export function createCategory(accountId, category, onCreate, messageHandler) {
  const resourcePath = `/account/${accountId}/category`;

  const merger = (current, created) => {
    return current.concat(created);
  }
  const body = Object.assign({accountId: accountId}, category);

  create({
    key: `categories_${accountId}`,
    merger: merger,
    resourcePath: resourcePath,
    body: [body],
    callback: onCreate,
  }).catch(() => {
    messageHandler.showMessage("error_creating_category");
  });
}

export class CategoryLoader {

  constructor(setter, messageHandler) {
    this.setter = setter;
    this.messageHandler = messageHandler;
  }

  async loadCategories(accountId) {
    console.log("Loading categories for account: ", accountId);
    const params = {
      key: `categories_${accountId}`,
      resourcePath: `/account/${accountId}/category`
    }

    try {
      const loadedCategories = await load(params);
      this.setter(loadedCategories);
    } catch(err) {
      console.log("Error loading categories", err);
      this.messageHandler.showMessage("error_loading_categories");
      this.setter([]);
    }
  }

}