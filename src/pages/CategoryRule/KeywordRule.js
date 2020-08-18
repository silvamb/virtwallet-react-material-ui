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

import NewKeyword from './NewKeyword';
import EditKeyword from './EditKeyword';
import { DataLoader, createCategoryRule, saveCategoryRule, deleteCategoryRule} from './CategoryRule';

// TODO ADD classes from Category Rule

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

const KeywordsList = ({category, keywords, classes, intl, openDetails}) => {
  const emptyList = (
    <ul className={classes.ul}>
      <ListSubheader>{category.name}</ListSubheader>
      <ListItem>
        <ListItemText classes={{primary: classes.grayText}} inset primary={intl.formatMessage({ id: 'empty' })} />
      </ListItem>
    </ul>
  );

  if(keywords == null) {
    return emptyList;
  }

  const filteredKeywords = keywords.filter(rule => rule.categoryId === category.categoryId);

  if(filteredKeywords.length === 0) {
    return emptyList;
  }

  return (
    <ul className={classes.ul}>
      <ListSubheader>{category.name}</ListSubheader>
      {filteredKeywords.map((rule, i) => (
        <ListItem key={`item-${i}`}  button onClick={() => openDetails(rule)}>
          <ListItemText inset primary={rule.keyword} />
        </ListItem>
      ))}
    </ul>
  );
}

const KeywordsByCategoryList = ({categories, keywords, classes, intl, openDetails}) => {

  return (
    <List subheader={<li />}>
      {categories.map((category) => (
        <li key={`section-${category.categoryId}`} className={classes.listSection}>
          <KeywordsList
            category={category}
            keywords={keywords}
            classes={classes}
            intl={intl}
            openDetails={openDetails}
          />
        </li>
      ))}
    </List>
  );
}

const KeywordRulesPage = (props) => {
  const intl = useIntl();
  const theme = useTheme();
  const classes = useStyles();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const [message, setMessage] = useState('');
  const messageHandler = new MessageHandler(setMessage, intl);

  const [data, setData] = useState(null);
  const [fetchingData, setFetchingData] = useState(false);
  const dataLoader = new DataLoader(setData, messageHandler, 'keyword');
  const categories = data && data.categories;
  const keywords = data && data.rules;
  const loading = data === null;

  const accountId = props.match.params.accountId;

  useEffect(() => {
    if(!fetchingData) {
      console.log("KeywordRulesPage.useEffect");
      setFetchingData(true);
      dataLoader.load(accountId);
    }
  }, [fetchingData, dataLoader, accountId]);

  const [selectedKeyword, setKeyword] = useState(null);
  const [editing, setEditing] = useState(false);
  const [creating, setCreating] = useState(false);
  const [originalKeyword, setOriginalKeyword] = useState(null);

  const showDetails = selectedKeyword !== null;

  function openDetails(keyword) {
    setKeyword(keyword);
  }

  function closeDetails() {
    setKeyword(null);
    setEditing(false);
    setOriginalKeyword(null);

  }

  function startEditing() {
    setEditing(true);
    setOriginalKeyword(selectedKeyword);
  }
  
  function save(updatedKeyword) {
    messageHandler.showMessage("Saving category rule...");
    closeDetails();

    const reload = () => {
      messageHandler.showMessage("Category rule saved!");
      dataLoader.load(accountId);
    };

    // Update category not supported yet
    saveCategoryRule(originalKeyword, updatedKeyword, reload, messageHandler);
  }

  function create(keyword) {
    messageHandler.showMessage("creating_keyword");
    setCreating(false);

    const reload = () => {
      messageHandler.showMessage("keyword_created");
      dataLoader.load(accountId);
    };

    createCategoryRule(keyword, reload, messageHandler)
  }
 

  function toggleEditing(editing = true) {
    setEditing(editing);
    setOriginalKeyword(selectedKeyword);
  }

  function remove() {
    messageHandler.showMessage("Deleting keyword...");
    closeDetails();

    const reload = () => {
      messageHandler.showMessage("Keyword deleted!");
      dataLoader.load(accountId);
    };

    deleteCategoryRule(selectedKeyword, reload, messageHandler);
  }

  return (
    <Page pageTitle={intl.formatMessage({ id: 'keywords' })}>
      <div className={classes.root}>
        {showDetails && (
          <EditKeyword
            keywordRule={selectedKeyword}
            isOpen={showDetails}
            viewMode={!editing}
            closeAction={closeDetails}
            saveAction={save}
            editAction={toggleEditing}
            deleteAction={remove}
            definedClasses={classes}
            fullScreen={fullScreen}
          />
        )}
        {creating && (
          <NewKeyword
            accountId={accountId}
            isOpen={creating}
            closeAction={() => setCreating(false)}
            saveAction={create}
            fullScreen={fullScreen}
          />
        )}
        <KeywordsByCategoryList
          categories={categories || []}
          keywords={keywords}
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

export default KeywordRulesPage;