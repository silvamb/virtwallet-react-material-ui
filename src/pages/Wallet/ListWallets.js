import React, { useState, useEffect } from "react";
import { useIntl } from "react-intl";
import Page from "material-ui-shell/lib/containers/Page/Page";

import { makeStyles, useTheme } from "@material-ui/core/styles";
import useMediaQuery from "@material-ui/core/useMediaQuery";

import Backdrop from "@material-ui/core/Backdrop";
import CircularProgress from "@material-ui/core/CircularProgress";
import Fab from "@material-ui/core/Fab";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListSubheader from "@material-ui/core/ListSubheader";
import Snackbar from "@material-ui/core/Snackbar";
import AddIcon from "@material-ui/icons/Add";

import NewWallet from "./NewWallet";
import EditWallet from "./EditWallet";
import { WalletsLoader, createWallet, saveWallet, deleteWallet } from "./Wallet";

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
    backgroundColor: "inherit",
  },
  ul: {
    backgroundColor: "inherit",
    padding: 0,
  },
  fab: {
    position: "absolute",
    bottom: theme.spacing(3),
    right: theme.spacing(3),
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: "#fff",
  },
  categoryItem: {
    margin: theme.spacing(1),
  },
  nestedLevel1: {
    paddingLeft: theme.spacing(4),
  },
  nestedLevel2: {
    paddingLeft: theme.spacing(6),
  },
  grayText: {
    color: "gray",
  },
}));

const WalletList = ({ wallets, openDetails, classes, intl }) => {
  const emptyList = (
    <List>
      <ListItem>
        <ListItemText classes={{primary: classes.grayText}} primary={intl.formatMessage({ id: 'empty' })} />
      </ListItem>
    </List>
  );

  if(wallets == null) {
    return emptyList;
  }

  return (
    <List>
      {wallets.map((wallet, index) => {
        return (
          <ListItem
            key={index}
            button
            onClick={() => openDetails(wallet)}
          >
            <ListItemText
              primary={wallet.name}
              secondary={wallet.description}
            />
          </ListItem>
        );
      })}
    </List>
  );
};

const WalletsPage = (props) => {
  const intl = useIntl();
  const theme = useTheme();
  const classes = useStyles();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const [message, setMessage] = useState("");
  const messageHandler = new MessageHandler(setMessage, intl);

  const [data, setData] = useState(null);
  const [fetchingData, setFetchingData] = useState(false);
  const dataLoader = new WalletsLoader(setData, messageHandler);
  const loading = data === null;

  const accountId = props.match.params.accountId;

  useEffect(() => {
    if (!fetchingData) {
      setFetchingData(true);
      if(accountId) { 
        dataLoader.load(accountId);
      } else {
        dataLoader.loadAll();
      }
    }
  }, [fetchingData, dataLoader, accountId]);

  const [selectedWallet, setWallet] = useState(null);
  const [editing, setEditing] = useState(false);
  const [creating, setCreating] = useState(false);
  const [originalWallet, setOriginalWallet] = useState(null);

  const showDetails = selectedWallet !== null;

  function openDetails(wallet) {
    setWallet(wallet);
  }

  function closeDetails() {
    setWallet(null);
    setEditing(false);
    setOriginalWallet(null);
  }

  function save(updatedWallet) {
    messageHandler.showMessage("Saving Wallet...");
    closeDetails();

    const reload = () => {
      messageHandler.showMessage("Wallet saved!");
      dataLoader.load(accountId);
    };

    saveWallet(originalWallet, updatedWallet, reload, messageHandler);
  }

  function create(wallet) {
    messageHandler.showMessage("Creating Wallet...");
    setCreating(false);

    const reload = () => {
      messageHandler.showMessage("Wallet created!");
      dataLoader.load(accountId);
    };

    createWallet(wallet, reload, messageHandler);
  }

  function toggleEditing(editing = true) {
    setEditing(editing);
    setOriginalWallet(selectedWallet);
  }

  function remove() {
    messageHandler.showMessage("Deleting wallet...");
    closeDetails();

    const reload = () => {
      messageHandler.showMessage("Wallet deleted!");
      dataLoader.load(accountId);
    };

    deleteWallet(selectedWallet, reload, messageHandler);
  }

  return (
    <Page pageTitle={intl.formatMessage({ id: "wallets" })}>
      <div className={classes.root}>
        {creating && (
          <NewWallet
            accountId={accountId}
            isOpen={creating}
            closeAction={() => setCreating(false)}
            saveAction={create}
            fullScreen={fullScreen}
          />
        )}
        {showDetails && (
          <EditWallet
            wallet={selectedWallet}
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
        <WalletList
          wallets={data}
          openDetails={openDetails}
          classes={classes}
          intl={intl}
        />

        <Fab
          color="primary"
          aria-label="add"
          className={classes.fab}
          onClick={() => setCreating(true)}
        >
          <AddIcon />
        </Fab>
        <Snackbar
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "center",
          }}
          open={message !== ""}
          autoHideDuration={6000}
          onClose={() => setMessage("")}
          message={message}
        />
        <Backdrop className={classes.backdrop} open={loading}>
          <CircularProgress color="inherit" />
        </Backdrop>
      </div>
    </Page>
  );
};

export default WalletsPage;
