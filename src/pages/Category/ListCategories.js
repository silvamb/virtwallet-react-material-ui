import React, { useState, useEffect } from 'react'
import { useIntl } from 'react-intl'
import Page from 'material-ui-shell/lib/containers/Page/Page'

import { makeStyles, useTheme } from "@material-ui/core/styles";
import useMediaQuery from '@material-ui/core/useMediaQuery'

import Backdrop from '@material-ui/core/Backdrop';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import Fab from '@material-ui/core/Fab';
import List from "@material-ui/core/List";
import ListSubheader from "@material-ui/core/ListSubheader"
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Snackbar from '@material-ui/core/Snackbar';
import Typography from '@material-ui/core/Typography';
import AddIcon from '@material-ui/icons/Add';

import CategoryDetails from './CategoryDetails';
import NewCategory from './NewCategory';
import { CategoryLoader, saveCategory, createCategory} from './Category';


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
  fab: {
    position: 'absolute',
    bottom: theme.spacing(3),
    right: theme.spacing(3),
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: '#fff',
  },
}));

const CategoryList = ({categories, openDetails}) => {
  return (
    <List
      component="nav"
      aria-labelledby="categories-for-account"
      subheader={
        <ListSubheader component="div" id="categories-for-account">
          Categories for Account
        </ListSubheader>
      }
    >
      {categories.map(category => {
        return (
          <ListItem key={category.categoryId} button onClick={() => openDetails(category)}>
            <ListItemText primary={category.name} secondary={category.description}/>
          </ListItem>
        );
      })}
    </List>
  );
}

const CategoriesPage = (props) => {
  const intl = useIntl();
  const theme = useTheme();
  const classes = useStyles();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const [message, setMessage] = useState('');
  const messageHandler = new MessageHandler(setMessage, intl);

  const [categories, setCategories] = useState(null);
  const categoryLoader = new CategoryLoader(setCategories, messageHandler);
  const loading = categories == null;

  const accountId = props.match.params.accountId;

  useEffect(() => {
    if(categories == null) {
      categoryLoader.loadCategories(accountId);
    }
  }, [categories, categoryLoader, accountId]);

  const [selectedCategory, setCategory] = useState({});
  const [editing, setEditing] = useState(false);
  const [creating, setCreating] = useState(false);
  const [originalCategory, setOriginalCategory] = useState(null);
  const [settingsOpened, showSettings] = useState(false);
  const [sorter, setSorter] = useState('date');
  const [groupBy, setGroupBy] = useState('none');
  const [ascending, setAscending] = useState(true);

  let pageBody;
  if(categories == null || categories.length === 0) {
    pageBody = <Typography variant="body1">{intl.formatMessage({ id: 'no_categories' })}</Typography>
  } else {
    pageBody = <CategoryList categories={categories} openDetails={openDetails}/>
  }

  function openDetails(category) {
    setCategory(category);
  }

  function closeDetails() {
    setCategory({});
    setEditing(false);
    setOriginalCategory(null);

  }

  function toggleEditing(editing = true) {
    setEditing(editing);
    setOriginalCategory(selectedCategory);
  }
  
  function save(updatedCategory) {
    messageHandler.showMessage("Saving category...");
    closeDetails();

    const reload = () => {
      messageHandler.showMessage("Category Saved!");
      categoryLoader.loadCategories(accountId);
    };

    // Update category not supported yet
    saveCategory(originalCategory, updatedCategory, reload, messageHandler);
  }

  function create(category) {
    messageHandler.showMessage("Creating category...");
    setCreating(false);

    const reload = () => {
      messageHandler.showMessage("Category Created!");
      categoryLoader.loadCategories(accountId);
    };

    createCategory(accountId, category, reload, messageHandler);
  }

  function UndoButton() {
    return (
      <Button color="inherit" size="small" onClick={() => console.log("Undoing delete")}>
        {intl.formatMessage({ id: 'undo' })}
      </Button>
    )
  }
 
  let backDropAction;

  return (
    <Page pageTitle={intl.formatMessage({ id: 'categories' })}>
      <div className={classes.root}>
      {selectedCategory.categoryId !== undefined &&
        <CategoryDetails
          category={selectedCategory}
          isOpen={selectedCategory.categoryId !== undefined}
          viewMode={!editing}
          closeAction={closeDetails}
          saveAction={save}
          editAction={toggleEditing}
          definedClasses={classes}
          fullScreen={fullScreen}
        />
      }
        <NewCategory
          isOpen={creating}
          closeAction={() => setCreating(false)}
          saveAction={create}
          fullScreen={fullScreen}
        />
        {pageBody}
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
          action={<UndoButton />}
        />
        <Backdrop className={classes.backdrop} open={loading}>
          <CircularProgress color="inherit" />
        </Backdrop>
      </div>
    </Page>
  );


}

export default CategoriesPage;