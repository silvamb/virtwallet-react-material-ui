import { ChangeSet, create, load, update, remove } from '../../utils/dataSync';
function getRuleIdField(ruleType) {
  return ruleType === 'keyword' ? 'keyword' : 'ruleId';
}

function getRuleTypeList(ruleType) {
  return ruleType === 'keyword' ? 'keywordRules' : 'expressionRules';
}

function merger(categoryRules, changeSet) {
  console.log("Merging", categoryRules, changeSet);
  const ruleIdField =  getRuleIdField(changeSet.oldState.ruleType);
  const listToUpdate =  getRuleTypeList(changeSet.oldState.ruleType);
  const rulesList = categoryRules[listToUpdate];

  const rule = rulesList.find(rule => rule[ruleIdField] === changeSet.oldState[ruleIdField]);
  const indexOfRule = rulesList.indexOf(rule);
  console.log("Found item", rule, "at", indexOfRule);

  const updatedRules = Object.assign({}, categoryRules);
  updatedRules[listToUpdate][indexOfRule] = changeSet.newState;

  console.log("Merged", updatedRules);

  return updatedRules;
}

function deleteMerger(categoryRules, itemToDelete) {
  console.log("Removing item", itemToDelete);
  const ruleIdField =  getRuleIdField(itemToDelete.ruleType);
  const listToUpdate =  getRuleTypeList(itemToDelete.ruleType);
  const rulesList = categoryRules[listToUpdate];

  console.log("List to update: " + ruleIdField);
  const rule = rulesList.find(rule => rule[ruleIdField] === itemToDelete[ruleIdField]);
  const indexOfRule = rulesList.indexOf(rule);
  console.log("Found item", rule, "at", indexOfRule);

  const updatedRules = Object.assign({}, categoryRules);
  updatedRules[listToUpdate].splice(indexOfRule, 1);

  console.log("Merged", updatedRules);

  return updatedRules;
}

function diff(changeSet) {
  const oldState = changeSet.oldState;
  const newState = changeSet.newState;
  const old = {};
  const updated = {};

  for(let attr in oldState) {
    if(oldState[attr] !== newState[attr]) {
      old[attr] = oldState[attr];
      updated[attr] = newState[attr];
    }
  }

  return {
    old: old,
    "new": updated
  }
}

export function saveCategoryRule(originalCategoryRule, updatedCategoryRule, onSave, messageHandler) {
  const changeSet = new ChangeSet(originalCategoryRule, updatedCategoryRule, diff);
  
  const changes = diff(changeSet);
  if(Object.keys(changes.old).length === 0) {
    messageHandler.showMessage('no_changes_made');
    console.log("No changes made to category rule, ignoring");
    return;
  }

  console.log("Saving changes", changes);

  const accountId = originalCategoryRule.accountId; 
  const ruleType = originalCategoryRule.ruleType === 'keyword' ? 'keyword': 'expression';
  const categoryRuleId = ruleType === 'keyword' ? originalCategoryRule.keyword :  originalCategoryRule.ruleId;
  const resourcePath = `/account/${accountId}/categoryRule/${ruleType}/${categoryRuleId}`;

    update({
      key: `categoryRules_${accountId}`,
      changeSet: changeSet,
      merger: merger,
      resourcePath: resourcePath,
      callback: onSave,
    }).catch((err) => {
      console.log("Error saving category Rule", err);
      messageHandler.showMessage("error_saving_category_rule");
    });
}

export function createCategoryRule(categoryRule, onCreate, messageHandler) {
  const resourcePath = `/account/${categoryRule.accountId}/categoryRule`;

  const listToUpdate =  getRuleTypeList(categoryRule.ruleType);

  const merger = (current, created) => {
    const updated = Object.assign({}, current);
    updated[listToUpdate].push(created[0]);

    return updated;
  }

  create({
    key: `categoryRules_${categoryRule.accountId}`,
    merger: merger,
    resourcePath: resourcePath,
    body: [categoryRule],
    callback: onCreate,
  }).catch((err) => {
    console.log("Error creating categoryRule", err);
    messageHandler.showMessage("error_creating_category_rule");
  });
}

export function deleteCategoryRule(categoryRule, onDelete, messageHandler) {
  const accountId = categoryRule.accountId; 
  const ruleType = categoryRule.ruleType === 'keyword' ? 'keyword': 'expression';
  const categoryRuleId = ruleType === 'keyword' ? categoryRule.keyword :  categoryRule.ruleId;
  const resourcePath = `/account/${accountId}/categoryRule/${ruleType}/${categoryRuleId}`;

  remove({
    key: `categoryRules_${categoryRule.accountId}`,
    itemToDelete: categoryRule,
    merger: deleteMerger,
    resourcePath: resourcePath,
    callback: onDelete,
  }).catch((err) => {
    console.log("Error deleting categoryRule", err)
    messageHandler.showMessage("error_deleting_category_rule");
  });
}

class CategoryRulesLoader {

  constructor(setter, messageHandler, ruleType) {
    this.setter = setter;
    this.messageHandler = messageHandler;
    this.ruleType = ruleType;
  }

  async load(accountId) {
    console.log("Loading category rules for account: ", accountId);
    const params = {
      key: `categoryRules_${accountId}`,
      resourcePath: `/account/${accountId}/categoryRule`
    }

    try {
      const loadedCategoryRules = await load(params);

      this.setter(loadedCategoryRules[this.ruleType]);
    } catch(err) {
      console.log("Error loading category rules", err);
      this.messageHandler.showMessage("error_loading_category_rules");
      this.setter([]);
    }
  }

}

export class KeywordsLoader extends CategoryRulesLoader {
  constructor(setter, messageHandler) {
    super(setter, messageHandler, 'keywordRules');
  }
}

export class ExpressionsLoader extends CategoryRulesLoader {
  constructor(setter, messageHandler) {
    super(setter, messageHandler, 'expressionRules');
  }
}

export class CategoryLoader {

  constructor(setter, messageHandler) {
    this.setter = setter;
    this.messageHandler = messageHandler;
  }

  async load(accountId) {
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

export class DataLoader {
  constructor(setter, messageHandler, ruleType) {
    this.setter = setter;
    this.messageHandler = messageHandler;
    this.ruleType = ruleType;
  }

  async load(accountId) {
    const data = {
      categories: [],
      rules: [],
    };

    const categorySetter = (categories) => data.categories = categories;
    const rulesSetter = (rules) => data.rules = rules;

    const categoryLoader = new CategoryLoader(
      categorySetter,
      this.messageHandler
    );
    const rulesLoader =
      this.ruleType === "keyword"
        ? new KeywordsLoader(rulesSetter, this.messageHandler)
        : new ExpressionsLoader(rulesSetter, this.messageHandler);

    await categoryLoader.load(accountId);
    console.log("Categories loaded");
    await rulesLoader.load(accountId);
    console.log("Rules loaded");

    this.setter(data);
  }
}
