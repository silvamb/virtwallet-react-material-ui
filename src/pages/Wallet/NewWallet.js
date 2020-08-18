import React, { useState, useEffect } from 'react';
import { useIntl } from 'react-intl'
import { makeStyles } from '@material-ui/core/styles';

import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import CloseIcon from '@material-ui/icons/Close';
import Dialog from '@material-ui/core/Dialog';
import FormControl from '@material-ui/core/FormControl';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import TextField from '@material-ui/core/TextField';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';

import CategorySelect from '../Category/CategorySelect'

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

export default function NewWallet({
  accountId,
  walletId,
  isOpen,
  closeAction,
  saveAction,
  fullScreen=false 
}) {

  const intl = useIntl();
  const classes = useStyles();

  const walletTemplate = {
    accountId: accountId,
    walletId: walletId,
    name: "",
    description: "",
    type: "Checking Account",
  };

  const [newWallet, setWallet] = useState(walletTemplate);

  function save() {
    console.log("Saving wallet", newWallet);
    saveAction(newWallet);
  }

  function setValue(field, event) {
    event.preventDefault();

    const value = event.target.value;
    const updated = Object.assign({}, newWallet);
    updated[field] = value;

    setWallet(updated);
  }

  return (
    <Dialog open={isOpen} fullScreen={fullScreen}>
      <AppBar className={classes.appBar}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => closeAction()} aria-label="close">
            <CloseIcon />
          </IconButton>
          <Typography variant="h6" className={classes.title}>
            {intl.formatMessage({ id: 'create_wallet' })}
          </Typography>
          <Button color="inherit" onClick={save}>
            {intl.formatMessage({ id: 'save' })}
          </Button>
        </Toolbar>
      </AppBar>
      <div className={classes.dialogBody}>
      <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              id="wallet-name"
              label={intl.formatMessage({ id: 'name' })}
              variant="outlined"
              onChange={(e) => setValue('name', e)}
              fullWidth
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
                id="wallet-description"
                label={intl.formatMessage({ id: "description" })}
                InputLabelProps={{
                  shrink: true,
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
                InputLabelProps={{
                  shrink: true,
                }}
                fullWidth
                variant="outlined"
                onChange={(e) => setValue('type', e)}
              />
          </Grid>
        </Grid>
      </div>
    </Dialog>
  );
}
