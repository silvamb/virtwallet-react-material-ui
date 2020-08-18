import React, { useState, useEffect } from 'react'
import { useIntl } from 'react-intl'
import Page from 'material-ui-shell/lib/containers/Page/Page'

import { makeStyles, useTheme } from "@material-ui/core/styles";
import useMediaQuery from '@material-ui/core/useMediaQuery'

import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';
import Fab from '@material-ui/core/Fab';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from "@material-ui/core/ListItemText";
import ListSubheader from "@material-ui/core/ListSubheader";
import Snackbar from '@material-ui/core/Snackbar';
import AddIcon from '@material-ui/icons/Add';

import NewExpressionRule from './NewExpressionRule';
import EditExpressionRule from './EditExpressionRule';
import { DataLoader, createCategoryRule , saveCategoryRule, deleteCategoryRule} from './CategoryRule';

class MessageHandler {
  constructor(showMessageFn, intl) {
    this.showMessageFn = showMessageFn;
    this.intl = intl;
  }

  showMessage(messageKey) {
    const message = this.intl.formatMessage({ id: messageKey });
    this.showMessageFn(message);
  }

}

const useStyles = makeStyles((theme) => ({
  root: {
    "overflow-x": "hidden",
    padding: theme.spacing(1),
  },
  listSection: {
    backgroundColor: 'inherit',
  },
  ul: {
    backgroundColor: 'inherit',
    padding: 0,
  },
  fab: {
    position: 'absolute',
    bottom: theme.spacing(3),
    right: theme.spacing(3),
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: '#fff',
  },
  categoryItem: {
    margin:theme.spacing(1)
  },
  nestedLevel1: {
    paddingLeft: theme.spacing(4)
  },
  nestedLevel2: {
    paddingLeft: theme.spacing(6)
  },
  grayText: {
    color: 'gray',
  }
}));

const ExpressionRulesList = ({category, expressionRules, classes, intl, openDetails}) => {
  const emptyList = (
    <ul className={classes.ul}>
      <ListSubheader>{category.name}</ListSubheader>
      <ListItem>
        <ListItemText classes={{primary: classes.grayText}} inset primary={intl.formatMessage({ id: 'empty' })} />
      </ListItem>
    </ul>
  );

  if(expressionRules == null) {
    return emptyList;
  }

  const filteredRules = expressionRules.filter(rule => rule.categoryId === category.categoryId);

  if(filteredRules.length === 0) {
    return emptyList;
  }

  return (
    <ul className={classes.ul}>
      <ListSubheader>{category.name}</ListSubheader>
      {filteredRules.map((rule, i) => (
        <ListItem key={`item-${i}`} button onClick={() => openDetails(rule)}>
          <ListItemText inset primary={rule.name} />
        </ListItem>
      ))}
    </ul>
  );
}

const ExpressionRulesByCategoryList = ({categories, expressionRules, classes, intl, openDetails}) => {
  return (
    <List subheader={<li />}>
      {categories.map((category) => (
        <li key={`section-${category.categoryId}`} className={classes.listSection}>
          <ExpressionRulesList
            category={category}
            expressionRules={expressionRules}
            classes={classes}
            intl={intl}
            openDetails={openDetails}
          />
        </li>
      ))}
    </List>
  );
}

const ExpressionRulesPage = (props) => {
  const intl = useIntl();
  const theme = useTheme();
  const classes = useStyles();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const [message, setMessage] = useState('');
  const messageHandler = new MessageHandler(setMessage, intl);

  const [data, setData] = useState(null);
  const [fetchingData, setFetchingData] = useState(false);
  const dataLoader = new DataLoader(setData, messageHandler, 'expression');
  const categories = data && data.categories;
  const expressionRules = data && data.rules;
  const loading = data === null;

  const accountId = props.match.params.accountId;

  useEffect(() => {
    if(!fetchingData) {
      setFetchingData(true);
      dataLoader.load(accountId);
    }
  }, [fetchingData, dataLoader, accountId]);

  const [selectedCategoryRule, setCategoryRule] = useState(null);
  const [editing, setEditing] = useState(false);
  const [creating, setCreating] = useState(false);
  const [originalCategoryRule, setOriginalCategoryRule] = useState(null);

  const showDetails = selectedCategoryRule !== null;

  function openDetails(categoryRule) {
    setCategoryRule(categoryRule);
  }

  function closeDetails() {
    setCategoryRule(null);
    setEditing(false);
    setOriginalCategoryRule(null);
  }

  function save(updatedCategoryRule) {
    messageHandler.showMessage("Saving expression rule...");
    closeDetails();

    const reload = () => {
      messageHandler.showMessage("Expression rule saved!");
      dataLoader.load(accountId);
    };

    // Update category not supported yet
    saveCategoryRule(originalCategoryRule, updatedCategoryRule, reload, messageHandler);
  }

  function create(expressionRule) {
    messageHandler.showMessage("Creating expression rule...");
    setCreating(false);

    const reload = () => {
      messageHandler.showMessage("Expression Rule created!");
      dataLoader.load(accountId);
    };

    createCategoryRule(expressionRule, reload, messageHandler);
  }
 
  function toggleEditing(editing = true) {
    setEditing(editing);
    setOriginalCategoryRule(selectedCategoryRule);
  }

  function remove() {
    messageHandler.showMessage("Deleting rule...");
    closeDetails();

    const reload = () => {
      messageHandler.showMessage("Expression rule deleted!");
      dataLoader.load(accountId);
    };

    // Update category not supported yet
    deleteCategoryRule(selectedCategoryRule, reload, messageHandler);
  }

  return (
    <Page pageTitle={intl.formatMessage({ id: 'expression_rules' })}>
      <div className={classes.root}>
        {creating && (
          <NewExpressionRule
            accountId={accountId}
            isOpen={creating}
            closeAction={() => setCreating(false)}
            saveAction={create}
            fullScreen={fullScreen}
          />
        )}
        {showDetails && (
          <EditExpressionRule
            expressionRule={selectedCategoryRule}
            isOpen={showDetails}
            viewMode={!editing}
            closeAction={closeDetails}
            saveAction={save}
            deleteAction={remove}
            editAction={toggleEditing}
            definedClasses={classes}
            fullScreen={fullScreen}
          />
        )}
        <ExpressionRulesByCategoryList
          categories={categories || []}
          expressionRules={expressionRules}
          classes={classes}
          intl={intl}
          openDetails={openDetails}
        />

        <Fab color="primary" aria-label="add" className={classes.fab} onClick={() => setCreating(true)}>
          <AddIcon />
        </Fab>
        <Snackbar
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
          open={message !== ''}
          autoHideDuration={6000}
          onClose={() => setMessage('')}
          message={message}
        />
        <Backdrop className={classes.backdrop} open={loading}>
          <CircularProgress color="inherit" />
        </Backdrop>
      </div>
    </Page>
  );
}

export default ExpressionRulesPage;