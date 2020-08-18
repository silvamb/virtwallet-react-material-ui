import React, { useState, useEffect } from 'react'
import { useIntl } from 'react-intl'
import Page from 'material-ui-shell/lib/containers/Page/Page'

import { makeStyles, useTheme } from "@material-ui/core/styles";
import useMediaQuery from '@material-ui/core/useMediaQuery'

import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Snackbar from '@material-ui/core/Snackbar';
import Typography from '@material-ui/core/Typography';

import { AccountLoader } from './Account';
import AccountDetails from './AccountDetails';

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
  appBar: {
    position: 'static',
  },
  title: {
    marginLeft: theme.spacing(2),
    flex: 1,
  },
  fab: {
    position: 'absolute',
    bottom: theme.spacing(2),
    right: theme.spacing(2),
  }
}));

const AccountList = ({accounts, openDetails}) => {
  return (
    <List>
      {accounts.map(account => {
        return (
          <ListItem key={account.accountId} button onClick={() => openDetails(account)}>
            <ListItemText primary={account.name} secondary={account.description}/>
          </ListItem>
        );
      })}
    </List>
  );
}

const AccountsPage = () => {
  const intl = useIntl();
  const classes = useStyles();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const [message, setMessage] = useState('');
  const messageHandler = new MessageHandler(setMessage, intl);

  const [accounts, setAccounts] = useState(null);
  const accountLoader = new AccountLoader(setAccounts, messageHandler);
  const [selectedAccount, setAccount] = useState({});
  const [editing, setEditing] = useState(false);
  const [creating, setCreating] = useState(false);
  const [originalAccount, setOriginalAccount] = useState(null);
  const [categoryRuleDrawerOpen, toggleCategoryRuleDrawer] = useState(false);


  useEffect(() => {
    if(accounts == null) {
      accountLoader.loadAccounts();
    }
  }, [accounts]);

  function openDetails(account) {
    setAccount(account)
  }

  function closeDetails() {
    setAccount({});
    setEditing(false);
    setOriginalAccount(null);

  }

  function startEditing() {
    setEditing(true);
    setOriginalAccount(selectedAccount);
  }

  function save(updatedAccount) {
    messageHandler.showMessage("Saving account...");
    closeDetails();

    /*const reload = () => {
      messageHandler.showMessage("Account Saved!");
      accountLoader.loadAccounts();
    };*/

    // Update account not supported yet
    // TODO Save account
  }

  let pageBody;
  if(accounts == null) {
    pageBody = <Typography variant="body1">{intl.formatMessage({ id: 'loading_message' })}</Typography>
  } else if(accounts.length === 0) {
    pageBody = <Typography variant="body1">{intl.formatMessage({ id: 'no_accounts' })}</Typography>
  } else {
    pageBody = <AccountList accounts={accounts} openDetails={openDetails}/>
  }

  return (
    <Page pageTitle={intl.formatMessage({ id: 'accounts' })}>
      <div className={classes.root}>
        <AccountDetails 
          account={selectedAccount}
          isOpen={selectedAccount.accountId !== undefined}
          viewMode={!editing}
          closeAction={closeDetails}
          saveAction={save}
          editAction={startEditing}
          fullScreen={fullScreen}
          toggleDrawer={toggleCategoryRuleDrawer}
          categoryRuleDrawerOpen={categoryRuleDrawerOpen}
        />
        {pageBody}
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
      </div>
    </Page>
  );


}

export default AccountsPage;