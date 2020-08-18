import React, { useState } from 'react';
import { useIntl } from 'react-intl'
import { Route, MemoryRouter } from 'react-router';
import { Link as RouterLink } from 'react-router-dom';

import { makeStyles } from '@material-ui/core/styles';

import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import CloseIcon from '@material-ui/icons/Close';
import Dialog from '@material-ui/core/Dialog';
import Drawer from '@material-ui/core/Drawer';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import ListItemText from "@material-ui/core/ListItemText";
import TextField from '@material-ui/core/TextField';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';

import NavigateNextIcon from '@material-ui/icons/NavigateNext';

const useStyles = makeStyles((theme) => ({
  appBar: {
    position: 'static',
  },
  title: {
    marginLeft: theme.spacing(2),
    flex: 1,
  },
  dialogBody: {
    "overflow-x": "hidden",
    padding: theme.spacing(1),
    marginTop: theme.spacing(2)
  },
  accountInfo: {
    marginTop: theme.spacing(1)
  }
}));

function ListItemLink(props) {
  const { primary, to } = props;

  const renderLink = React.useMemo(
    () => React.forwardRef((itemProps, ref) => <RouterLink to={to} ref={ref} {...itemProps} />),
    [to],
  );

  return (
    <li>
      <ListItem button component={renderLink}>
        <ListItemText primary={primary} />
        <NavigateNextIcon />
      </ListItem>
    </li>
  );
}

function ActionButton ({text, action}) {
  return (
    <Button color="inherit" onClick={action}>
      {text}
    </Button>
  );
}

function CategoryRulesDrawer({account, open, toggleDrawer}) {
  const intl = useIntl();

  return (
    <Drawer anchor="bottom" open={open} onClose={() => toggleDrawer(false)}>
      <List component="nav" aria-label="category rules options">
        <ListItemLink to={`/account/${account.accountId}/categoryRule/keywords`} primary={intl.formatMessage({ id: 'keywords' })} />
        <ListItemLink to={`/account/${account.accountId}/categoryRule/expressionRules`} primary={intl.formatMessage({ id: 'expression_rules' })} />
      </List>
    </Drawer>
  )
}

export default function AccountDetails({
  account, 
  isOpen,
  viewMode = true,
  closeAction,
  saveAction,
  deleteAction,
  editAction,
  toggleDrawer,
  categoryRuleDrawerOpen,
  fullScreen=false 
}) {

  const intl = useIntl();
  const classes = useStyles();
  let updatedAccount = Object.assign({}, account);

  function save() {
    console.log("Saving account changes", updatedAccount);
    saveAction(updatedAccount);
  }

  function setValue(field, event) {
    event.preventDefault();

    const value = event.target.value;
    const updated = Object.assign({}, account);
    updated[field] = value;

    updatedAccount = updated;
  }

  function PrimaryActionButton() {
    if(viewMode) {
      return <ActionButton text={"Edit"} action={editAction} />
    } else {
      return <ActionButton text={"Save"} action={save} />
    }
  }

  return (
    <Dialog open={isOpen} fullScreen={fullScreen}>
      <AppBar className={classes.appBar}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => closeAction()} aria-label="close">
            <CloseIcon />
          </IconButton>
          <Typography variant="h6" className={classes.title}>
            {intl.formatMessage({ id: 'account_details' })}
          </Typography>
          <PrimaryActionButton/>
        </Toolbar>
      </AppBar>
      <div className={classes.dialogBody}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              id="account-name"
              label={intl.formatMessage({ id: 'name' })}
              defaultValue={account.name}
              InputProps={{
                readOnly: viewMode,
              }}
              fullWidth
              variant="outlined"
              onChange={(e) => setValue('name', e)}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
                id="account-description"
                label={intl.formatMessage({ id: "description" })}
                defaultValue={account.description}
                InputLabelProps={{
                  shrink: true,
                }}
                InputProps={{
                  readOnly: viewMode,
                }}
                fullWidth
                variant="outlined"
                onChange={(e) => setValue('description', e)}
              />
          </Grid>
          <Grid item xs={12}>
            <TextField
              id="account-owner"
              label={intl.formatMessage({ id: 'owner' })}
              defaultValue={account.ownerId}
              InputProps={{
                readOnly: true,
              }}
              fullWidth
              variant="outlined"
              disabled={!viewMode}
            />
          </Grid>
          <Grid item xs={12}>
            <List component="nav" aria-label="secondary account details">
              <ListItemLink to={`/account/${account.accountId}/members`} primary={intl.formatMessage({ id: 'members' })} />
              <ListItemLink to={`/account/${account.accountId}/wallets`} primary={intl.formatMessage({ id: 'wallets' })} />
              <ListItemLink to={`/account/${account.accountId}/categories`} primary={intl.formatMessage({ id: 'categories' })} />
              <ListItem button onClick={() => toggleDrawer(true)}>
                <ListItemText primary={intl.formatMessage({ id: 'categories_rules' })} />
                <NavigateNextIcon />
              </ListItem>
            </List>
          </Grid>
        </Grid>
      </div>
      <CategoryRulesDrawer account={account} open={categoryRuleDrawerOpen} toggleDrawer={toggleDrawer}/>
    </Dialog>
  );
}
