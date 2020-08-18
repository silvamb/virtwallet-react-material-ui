import React, { useState, useEffect } from 'react'
import { useIntl } from 'react-intl'

import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';

import { load } from '../../utils/dataSync';

class CategoryLoader {

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

      const noCategory = {
        accountId: accountId,
        categoryId: "NO_CATEGORY",
        name: "Uncategorized",
        description: "Uncategorized"
      };
      this.setter(loadedCategories.concat([noCategory]));
    } catch(err) {
      console.log("Error loading categories", err);
      this.messageHandler.showMessage("error_loading_categories");
      this.setter([]);
    }
  }

}

const loadingCategories = [
  {
    categoryId: "00",
    name: "Loading categories",
  },
];

function LoadingSelect({label, loadingText}) {
  return (
    <Select
      labelId="categories-label"
      id="loading-category"
      value={"00"}
      label={label}
      inputProps={{
        readOnly: true,
      }}
    >
      <MenuItem value={"00"}>
      {loadingText}
      </MenuItem>
    </Select>
  );
}

function CategoryOption(category) {
  return (
    <MenuItem key={category.categoryId} value={category.categoryId}>
      {category.name}
    </MenuItem>
  );
}

function CategorySelect({label, selected, categories, onChange, readOnly}) {
  return (
    <Select
      labelId="categories-label"
      id="category"
      value={selected}
      label={label}
      onChange={onChange}
      inputProps={{
        readOnly: readOnly,
      }}
    >
      {categories.map((category) => CategoryOption(category))}
    </Select>
  );
}



const CategoryFormControl = ({ accountId, category, readOnly = true, onChange, messageHandler, data }) => {
  const intl = useIntl();

  const [categories, setCategories] = useState(data || loadingCategories);
  const categoryLoader = new CategoryLoader(setCategories, messageHandler);

  const loading = categories === loadingCategories; 

  useEffect(() => {
    if (loading) {
      categoryLoader.loadCategories(accountId);
    }
  }, [loading, categoryLoader, accountId]);

  function changeSelection(e) {
    e.preventDefault();
    onChange(e);
  }

  let select;
  if(loading) {
    select = <LoadingSelect label={"Category"}  loadingText={"Loading..."}/>;
  } else {
    select = <CategorySelect 
                label={intl.formatMessage({ id: "category" })}
                selected={category}
                categories={categories}
                onChange={changeSelection}
                readOnly={readOnly}
             />
  }

  return (
    <FormControl fullWidth variant="outlined">
      <InputLabel id="categories-label">
        {intl.formatMessage({ id: "category" })}
      </InputLabel>
      {select}
    </FormControl>
  );
};

export default CategoryFormControl;
