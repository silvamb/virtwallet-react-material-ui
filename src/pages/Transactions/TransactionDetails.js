import React, { useState } from 'react';
import { useIntl } from 'react-intl'

import { makeStyles } from '@material-ui/core/styles';

import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import CloseIcon from '@material-ui/icons/Close';
import Dialog from '@material-ui/core/Dialog';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import TextField from '@material-ui/core/TextField';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import EditIcon from '@material-ui/icons/Edit';
import SaveIcon from '@material-ui/icons/Save';

import CategorySelect from '../Category/CategorySelect'
import TransactionExtraDetails from './TransactionExtraDetails';

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
  }
}));

function ActionButtons({onClickEdit}) {
  return (
    <>
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

// TODO
// Fix changing category.

export default function EditTransaction({
  transaction, 
  isOpen,
  viewMode = true,
  closeAction,
  saveAction,
  editAction,
  definedClasses,
  fullScreen=false 
}) {
  const classes = useStyles();
  const intl = useIntl();

  const [updatedTransaction, setTransaction] = useState(transaction);

  function save() {
    console.log("Saving transaction changes", updatedTransaction);
    saveAction(updatedTransaction);
  }

  function setValue(field, event) {
    event.preventDefault();

    const value = event.target.value;
    const updated = Object.assign({}, updatedTransaction);
    updated[field] = value;

    setTransaction(updated);
  }

  function resetFields() {
    setTransaction(transaction);
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
            {intl.formatMessage({ id: 'edit_transaction' })}
          </Typography>
          {viewMode && (<ActionButtons onClickEdit={editAction} />)}
        </Toolbar>
      </AppBar>
      <div className={classes.dialogBody}>
      <Grid container spacing={2}>
      <Grid item xs={4}>
          <TextField
            id="transaction-refmonth"
            label={intl.formatMessage({ id: "month" })}
            value={updatedTransaction.referenceMonth}
            InputProps={{
              readOnly: true,
            }}
            variant="outlined"
            disabled={!viewMode}
            />
        </Grid>
        <Grid item xs={4}>
          <TextField
            id="transaction-date"
            label={intl.formatMessage({ id: "transaction_date" })}
            value={updatedTransaction.txDate}
            InputProps={{
              readOnly: true,
            }}
            variant="outlined"
            disabled={!viewMode}
            />
        </Grid>
        <Grid item xs={4}>
          <TextField
              id="transaction-value"
              label={intl.formatMessage({ id: "transaction_value" })}
              type="number"
              InputLabelProps={{
                shrink: true,
              }}
              InputProps={{
                readOnly: true,
                startAdornment: (
                  <InputAdornment position="start">€</InputAdornment>
                ),
              }}
              value={updatedTransaction.value}
              variant="outlined"
              disabled={!viewMode}
            />
        </Grid>
        <Grid item xs={12}>
          <TextField
              id="transaction-description"
              label={intl.formatMessage({ id: "transaction_description" })}
              defaultValue={updatedTransaction.description}
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
              id="transaction-keyword"
              label={intl.formatMessage({ id: "transaction_keyword" })}
              defaultValue={updatedTransaction.keyword}
              InputLabelProps={{
                shrink: true,
              }}
              InputProps={{
                readOnly: viewMode,
              }}
              fullWidth
              variant="outlined"
              onChange={e => setValue('keyword', e)}
            />
        </Grid>
        <Grid item xs={6}>
        <CategorySelect
          accountId={updatedTransaction.accountId}
          category={updatedTransaction.categoryId}
          readOnly={viewMode}
          onChange={(e) => setValue('categoryId', e)}
        />
        </Grid>
        <Grid item xs={6}>
          <TextField
            id="transaction-type"
            label={intl.formatMessage({ id: "transaction_type" })}
            value={updatedTransaction.type}
            InputProps={{
              readOnly: true,
            }}
            variant="outlined"
            disabled={!viewMode}
          />
        </Grid>
        <Grid item xs={4}>
          <TextField
            id="balance"
            label={intl.formatMessage({ id: "balance" })}
            value={updatedTransaction.balance}
            InputProps={{
              readOnly: true,
              startAdornment: (
                <InputAdornment position="start">€</InputAdornment>
              ),
            }}
            variant="outlined"
            disabled={!viewMode}
          />
        </Grid>
        <Grid item xs={4}>
          <TextField
            id="balance-type"
            label={intl.formatMessage({ id: "balance_type" })}
            value={updatedTransaction.balanceType}
            InputProps={{
              readOnly: true,
            }}
            variant="outlined"
            disabled={!viewMode}
          />
        </Grid>
        <Grid item xs={4}>
          <TextField
            id="transaction-id"
            label={intl.formatMessage({ id: 'transaction_id' })}
            value={updatedTransaction.txId}
            InputProps={{
              readOnly: true,
            }}
            variant="outlined"
            disabled={!viewMode}
          />
        </Grid>
        <Grid item xs={12}>
          <TransactionExtraDetails transaction={transaction} disabled={!viewMode}/>
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
