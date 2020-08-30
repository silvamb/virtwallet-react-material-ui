import React, { useState } from "react";
import { useIntl } from "react-intl";
import { Link as RouterLink } from "react-router-dom";

import { makeStyles } from "@material-ui/core/styles";

import AppBar from "@material-ui/core/AppBar";
import Button from "@material-ui/core/Button";
import CloseIcon from "@material-ui/icons/Close";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import Divider from "@material-ui/core/Divider";
import Drawer from "@material-ui/core/Drawer";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Grid from "@material-ui/core/Grid";
import IconButton from "@material-ui/core/IconButton";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Switch from "@material-ui/core/Switch";
import TextField from "@material-ui/core/TextField";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";

import NavigateNextIcon from "@material-ui/icons/NavigateNext";
import EditIcon from "@material-ui/icons/Edit";
import { cloneAccount } from "./Account";

const useStyles = makeStyles((theme) => ({
  appBar: {
    position: "static",
  },
  title: {
    marginLeft: theme.spacing(2),
    flex: 1,
  },
  dialogBody: {
    "overflow-x": "hidden",
    marginTop: theme.spacing(2),
  },
  accountInfo: {
    marginTop: theme.spacing(1),
  },
  section: {
    margin: theme.spacing(2),
  },
  sectionTitle: {
    marginBottom: theme.spacing(2),
  },
  sectionBody: {
    margin: theme.spacing(2),
  },
}));

function ListItemLink(props) {
  const { primary, to } = props;

  const renderLink = React.useMemo(
    () =>
      React.forwardRef((itemProps, ref) => (
        <RouterLink to={to} ref={ref} {...itemProps} />
      )),
    [to]
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

function CategoryRulesDrawer({ account, open, toggleDrawer }) {
  const intl = useIntl();

  return (
    <Drawer anchor="bottom" open={open} onClose={() => toggleDrawer(false)}>
      <List component="nav" aria-label="category rules options">
        <ListItemLink
          to={`/account/${account.accountId}/categoryRule/keywords`}
          primary={intl.formatMessage({ id: "keywords" })}
        />
        <ListItemLink
          to={`/account/${account.accountId}/categoryRule/expressionRules`}
          primary={intl.formatMessage({ id: "expression_rules" })}
        />
      </List>
    </Drawer>
  );
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
  fullScreen = false,
}) {
  const intl = useIntl();
  const classes = useStyles();

  const [updatedAccount, setAccount] = useState(cloneAccount(account));

  function save() {
    console.log("Saving account changes", updatedAccount);
    saveAction(updatedAccount);
  }

  function setValue(field, event) {
    event.preventDefault();

    const value = event.target.value;
    const updated = Object.assign({}, updatedAccount);
    updated[field] = value;

    setAccount(updated);
  }

  function setMonthStartDateValue(field, event) {
    event.preventDefault();

    const value = event.target.value;
    const updated = Object.assign({}, updatedAccount);
    updated.monthStartDateRule[field] = value;

    setAccount(updated);
  }

  function setCurrentMonth(field, event) {
    const value = event.target.checked;
    const updated = Object.assign({}, updatedAccount);
    updated.monthStartDateRule[field] = value;

    setAccount(updated);
  }

  function resetFields() {
    setAccount(cloneAccount(account));
    editAction(false);
  }

  return (
    <Dialog open={isOpen} fullScreen={fullScreen}>
      <AppBar className={classes.appBar}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => closeAction()}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
          <Typography variant="h6" className={classes.title}>
            {intl.formatMessage({ id: "edit_account" })}
          </Typography>
          {viewMode && (
            <IconButton edge="end" aria-label="edit" onClick={editAction}>
              <EditIcon />
            </IconButton>
          )}
        </Toolbar>
      </AppBar>
      <div className={classes.dialogBody}>
        <div className={classes.section}>
          <div className={classes.sectionTitle}>
            <Typography variant="h6">
              {intl.formatMessage({ id: "account_details" })}
            </Typography>
          </div>
          <div className={classes.sectionBody}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  id="account-name"
                  label={intl.formatMessage({ id: "name" })}
                  value={updatedAccount.name}
                  InputProps={{
                    readOnly: viewMode,
                  }}
                  fullWidth
                  onChange={(e) => setValue("name", e)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  id="account-description"
                  label={intl.formatMessage({ id: "description" })}
                  value={updatedAccount.description}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  InputProps={{
                    readOnly: viewMode,
                  }}
                  fullWidth
                  onChange={(e) => setValue("description", e)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  id="account-owner"
                  label={intl.formatMessage({ id: "owner" })}
                  defaultValue={account.ownerId}
                  InputProps={{
                    readOnly: true,
                  }}
                  fullWidth
                  disabled={!viewMode}
                />
              </Grid>
            </Grid>
          </div>
        </div>
        <Divider />
        <div className={classes.section}>
          <div className={classes.sectionTitle}>
            <Typography variant="h6">
              {intl.formatMessage({ id: "month_start_date_rule" })}
            </Typography>
          </div>
          <div className={classes.sectionBody}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={6}>
                <FormControlLabel
                  control={
                    <Switch
                      edge="end"
                      checked={updatedAccount.monthStartDateRule.currentMonth}
                      onChange={(e) => setCurrentMonth("currentMonth", e)}
                      inputProps={{ "aria-labelledby": "current-month-switch" }}
                      color="primary"
                      disabled={viewMode}
                    />
                  }
                  label={
                    <Typography variant="caption" color="textSecondary">
                      {intl.formatMessage({ id: "current_month" })}
                    </Typography>
                  }
                  labelPlacement="top"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  id="month-start-date"
                  label={intl.formatMessage({ id: "day_of_the_month" })}
                  value={updatedAccount.monthStartDateRule.dayOfMonth}
                  InputProps={{
                    readOnly: viewMode,
                  }}
                  fullWidth
                  onChange={(e) => setMonthStartDateValue("dayOfMonth", e)}
                />
              </Grid>
            </Grid>
          </div>
        </div>
        <List component="nav" aria-label="manually set periods">
            <ListItemLink
              to={`/account/${account.accountId}/manuallySetPeriods`}
              primary={intl.formatMessage({ id: "manually_set_periods" })}
            />
          </List>
        <Divider />
        <List component="nav" aria-label="secondary account details">
          <ListItemLink
            to={`/account/${account.accountId}/members`}
            primary={intl.formatMessage({ id: "members" })}
          />
          <ListItemLink
            to={`/account/${account.accountId}/wallets`}
            primary={intl.formatMessage({ id: "wallets" })}
          />
          <ListItemLink
            to={`/account/${account.accountId}/categories`}
            primary={intl.formatMessage({ id: "categories" })}
          />
          <ListItem button onClick={() => toggleDrawer(true)}>
            <ListItemText
              primary={intl.formatMessage({ id: "categories_rules" })}
            />
            <NavigateNextIcon />
          </ListItem>
        </List>
      </div>

      <CategoryRulesDrawer
        account={account}
        open={categoryRuleDrawerOpen}
        toggleDrawer={toggleDrawer}
      />
      {!viewMode && (
        <DialogActions>
          <Button onClick={resetFields}>
            {intl.formatMessage({ id: "cancel" })}
          </Button>
          <Button color="primary" variant="contained" onClick={save}>
            {intl.formatMessage({ id: "save" })}
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
}
