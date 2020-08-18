import React, { useState } from 'react';
import { useIntl } from 'react-intl'
import { Link as RouterLink } from 'react-router-dom';

import { makeStyles } from '@material-ui/core/styles';

import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import CloseIcon from '@material-ui/icons/Close';
import Dialog from '@material-ui/core/Dialog';
import FormControl from '@material-ui/core/FormControl';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import TextField from '@material-ui/core/TextField';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';

import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import SaveIcon from '@material-ui/icons/Save';

import { cleanTransactions } from './Wallet';

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
  keywordInfo: {
    marginTop: theme.spacing(1)
  },
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

function ActionButtons({onClickDelete, onClickEdit}) {
  return (
    <>
      <IconButton edge="end" aria-label="delete" onClick={onClickDelete}>
        <DeleteIcon />
      </IconButton>
      <IconButton edge="end" aria-label="edit" onClick={onClickEdit}>
        <EditIcon />
      </IconButton>
    </>
  );
}

function EditActionButtons({cancelText, saveText, classes, onClickSave, onClickCancel}) {
  return (
    <Grid 
        item
        container 
        xs={12}
        direction="row"
        justify="flex-end"
        alignItems="center"
    >
      <Button
        variant="contained"
        size="medium"
        color="secondary"
        className={classes.button}
        onClick={onClickCancel}
      >
        {cancelText}
      </Button>
      <Button
        variant="contained"
        color="primary"
        size="medium"
        className={classes.button}
        startIcon={<SaveIcon />}
        onClick={onClickSave}
      >
        {saveText}
      </Button>
    </Grid>
  );
}


export default function EditWallet({
  wallet,
  isOpen,
  viewMode = true,
  closeAction,
  saveAction,
  deleteAction,
  editAction,
  fullScreen=false 
}) {

  const intl = useIntl();
  const classes = useStyles();

  const [updatedWallet, setWallet] = useState(wallet);

  function save() {
    console.log("Saving wallet", updatedWallet);
    saveAction(updatedWallet);
  }

  function setValue(field, event) {
    event.preventDefault();

    const value = event.target.value;
    const updated = Object.assign({}, updatedWallet);
    updated[field] = value;

    setWallet(updated);
  }

  function resetFields() {
    setWallet(wallet);
    editAction(false)
  }

  return (
    <Dialog open={isOpen} fullScreen={fullScreen}>
      <AppBar className={classes.appBar}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => closeAction()} aria-label="close">
            <CloseIcon />
          </IconButton>
          <Typography variant="h6" className={classes.title}>
            {intl.formatMessage({ id: 'edit_wallet' })}
          </Typography>
          {viewMode && (<ActionButtons onClickDelete={deleteAction} onClickEdit={editAction} />)}
        </Toolbar>
      </AppBar>
      <div className={classes.dialogBody}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              id="wallet-name"
              label={intl.formatMessage({ id: 'name' })}
              defaultValue={wallet.name}
              variant="outlined"
              onChange={(e) => setValue('name', e)}
              fullWidth
              InputProps={{
                readOnly: viewMode,
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
                id="wallet-description"
                label={intl.formatMessage({ id: "description" })}
                defaultValue={wallet.description}
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
                id="wallet-type"
                label={intl.formatMessage({ id: "type" })}
                defaultValue={wallet.type}
                InputLabelProps={{
                  shrink: true,
                }}
                InputProps={{
                  readOnly: true,
                }}
                fullWidth
                variant="outlined"
              />
          </Grid>
          <Grid item xs={12}>
            <List component="nav" aria-label="secondary wallet details">
              <ListItemLink to={`/account/${wallet.accountId}/wallet/${wallet.walletId}/transactions`} primary={intl.formatMessage({ id: 'transactions' })} />
              <ListItemLink to={`/account/${wallet.accountId}/wallet/${wallet.walletId}/upload-statement`} primary={intl.formatMessage({ id: 'upload_file' })} />
              <ListItemLink to={`/account/${wallet.accountId}/wallet/${wallet.walletId}/reclassify`} primary={intl.formatMessage({ id: 'reclassify_transactions' })} />
              <ListItem button onClick={() => cleanTransactions(wallet.accountId, wallet.walletId)}>
                <ListItemText primary={intl.formatMessage({ id: 'remove_transactions_cache' })} />
              </ListItem>
            </List>
          </Grid>
          {!viewMode && (
            <EditActionButtons 
              cancelText={intl.formatMessage({ id: 'cancel' })}
              saveText={intl.formatMessage({ id: 'save' })}
              classes={classes}
              onClickSave={save}
              onClickCancel={resetFields}
            />
          )}
        </Grid>
      </div>
    </Dialog>
  );
}
