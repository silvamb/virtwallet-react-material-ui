import React, { useState, useEffect } from "react";
import { useIntl } from "react-intl";

import Page from "material-ui-shell/lib/containers/Page/Page";
import IconButton from "@material-ui/core/IconButton";
import Container from "@material-ui/core/Container";
import Fab from "@material-ui/core/Fab";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import ListItemText from "@material-ui/core/ListItemText";
import Snackbar from "@material-ui/core/Snackbar"
import { makeStyles, useTheme } from "@material-ui/core/styles";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import AddIcon from "@material-ui/icons/Add";
import DeleteIcon from "@material-ui/icons/Delete";

import { AccountLoader, cloneAccount } from "./Account";
import EditManuallySetPeriod from "./EditManuallySetPeriod";


const useStyles = makeStyles((theme) => ({
  root: {
    "overflow-x": "hidden",
    padding: theme.spacing(1),
  },
  dates: {
    display: "flex",
    flexDirection: "column",
    width: "auto",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  fab: {
    position: 'absolute',
    bottom: theme.spacing(3),
    right: theme.spacing(3),
  },
}));

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

export default function ListManuallySetPeriods(props) {
  const intl = useIntl();
  const classes = useStyles();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const accountId = props.match.params.accountId;

  const [message, setMessage] = useState("");
  const messageHandler = new MessageHandler(setMessage, intl);

  const emptyAccount = {
    empty: true,
    accountId: accountId,
    monthStartDateRule: {
      currentMonth: true,
      dayOfMonth: 1,
      manuallySetPeriods: [],
    },
  };
  const [account, setAccount] = useState(emptyAccount);
  const accountLoader = new AccountLoader(setAccount, messageHandler);

  useEffect(() => {
    if (account.empty) {
      accountLoader.loadAccount(accountId);
    }
  }, [account, accountLoader, accountId]);

  const periods = account.monthStartDateRule.manuallySetPeriods;

  const [selectedPeriod, setSelectedPeriod] = useState();
  const [periodIndex, setPeriodIndex] = useState(-1);
  const [dialogOpened, showDialog] = useState(false);
  const [createMode, setCreateMode] = useState(false);

  function goBack() {
    props.history.goBack();
  }

  function openEditDialog(period, index) {
    setSelectedPeriod(period);
    setPeriodIndex(index);
    showDialog(true);
    setCreateMode(false);
  }

  function openCreateDialog() {
    setSelectedPeriod(undefined);
    showDialog(true);
    setCreateMode(true);
  }

  function closeDialog() {
    showDialog(false);
  }

  function addPeriod(period) {
    showDialog(false);
    messageHandler.showMessage("adding_period");

    const updated = cloneAccount(account);
    updated.monthStartDateRule.manuallySetPeriods.push(period);

    // const _reload = () => {
    //   messageHandler.showMessage("period_created");
    //   accountLoader.loadAccounts();
    // };

    setAccount(updated);
    //saveAccount(originalAccount, updatedAccount, reload, messageHandler);
  }

  function updatePeriod(period) {
    showDialog(false);
    messageHandler.showMessage("saving_period");

    const updated = cloneAccount(account);
    updated.monthStartDateRule.manuallySetPeriods[periodIndex] = period;

    console.log("Updated account", updated);
    // const reload = () => {
    //   messageHandler.showMessage("period_updated");
    //   accountLoader.loadAccounts();
    // };

    setAccount(updated);
    //saveAccount(originalAccount, updatedAccount, reload, messageHandler);
  }

  function deletePeriod(index) {
    showDialog(false);
    messageHandler.showMessage("deleting_period");

    const updated = cloneAccount(account);
    updated.monthStartDateRule.manuallySetPeriods.splice(index);

    console.log("Updated account", updated);
    // const reload = () => {
    //   messageHandler.showMessage("period_deleted");
    //   accountLoader.loadAccounts();
    // };

    setAccount(updated);
    //saveAccount(originalAccount, updatedAccount, reload, messageHandler);
  }

  return (
    <Page
      pageTitle={intl.formatMessage({ id: "manually_added_periods" })}
      onBackClick={goBack}
    >
      <Container maxWidth="sm">
        <List>
          {periods.length === 0 ? (
            <ListItem>
              <ListItemText primary={intl.formatMessage({ id: "empty" })} />
            </ListItem>
          ) : (
            account.monthStartDateRule.manuallySetPeriods.map((period, index) => {
              return (
                <ListItem button key={period.month} onClick={() => openEditDialog(period, index)}>
                  <ListItemText
                    primary={period.month}
                    secondary={`${period.startDate} to ${period.endDate}`}
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      aria-label="edit"
                      onClick={() => deletePeriod(index)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              );
            })
          )}
        </List>
        {dialogOpened && (
          <EditManuallySetPeriod
            manuallySetPeriod={selectedPeriod}
            isOpen={dialogOpened}
            closeAction={closeDialog}
            saveAction={createMode ? addPeriod : updatePeriod}
            fullScreen={fullScreen}
            editMode={!createMode}
          />
        )}
        <Fab color="primary" aria-label="add" className={classes.fab} onClick={openCreateDialog}>
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
      </Container>
    </Page>
  );
}
