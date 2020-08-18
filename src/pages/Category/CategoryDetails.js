import React, { useState } from 'react';
import { useIntl } from 'react-intl'
import { makeStyles } from '@material-ui/core/styles';

import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import CloseIcon from '@material-ui/icons/Close';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import Dialog from '@material-ui/core/Dialog';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import TextField from '@material-ui/core/TextField';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';

import SaveIcon from '@material-ui/icons/Save';

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
  categoryInfo: {
    marginTop: theme.spacing(1)
  },
  button: {
    margin: theme.spacing(1),
  },
}));

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

export default function CategoryDetails({
  category, 
  isOpen,
  viewMode = true,
  closeAction,
  saveAction,
  deleteAction,
  editAction,
  fullScreen=false 
}) {
  console.log("Re-rendering the whole thing");
  const intl = useIntl();
  const classes = useStyles();
  let updatedCategory = Object.assign({}, category);

  function save() {
    console.log("Saving category changes", updatedCategory);
    saveAction(updatedCategory);
  }

  function setValue(field, event) {
    event.preventDefault();

    const value = event.target.value;
    const updated = Object.assign({}, category);
    updated[field] = value;

    updatedCategory = updated;
  }

  let actionButtons;
  let editActionButtons;

  if(viewMode) {
    actionButtons = <ActionButtons onClickDelete={deleteAction} onClickEdit={editAction} /> 
  } else {
    editActionButtons = <EditActionButtons 
                          cancelText={intl.formatMessage({ id: 'cancel' })}
                          saveText={intl.formatMessage({ id: 'save' })}
                          classes={classes}
                          onClickSave={saveAction}
                          onClickCancel={() => editAction(false)}
                        />;
  }

  return (
    <Dialog open={isOpen} fullScreen={fullScreen}>
      <AppBar className={classes.appBar}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => closeAction()} aria-label="close">
            <CloseIcon />
          </IconButton>
          <Typography variant="h6" className={classes.title}>
            {intl.formatMessage({ id: 'category_details' })}
          </Typography>
          {actionButtons}
        </Toolbar>
      </AppBar>
      <div className={classes.dialogBody}>
      <Grid container spacing={2}>
        <Grid item xs={4}>
          <TextField
            id="category-id"
            label={intl.formatMessage({ id: 'category_id' })}
            defaultValue={category.categoryId}
            InputProps={{
              readOnly: true,
            }}
            variant="outlined"
            disabled={!viewMode}
          />
        </Grid>
        <Grid item xs={8}>
          <TextField
            id="category-name"
            label={intl.formatMessage({ id: 'category_name' })}
            defaultValue={category.name}
            InputProps={{
              readOnly: viewMode,
            }}
            variant="outlined"
            onChange={(e) => setValue('name', e)}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
              id="category-description"
              label={intl.formatMessage({ id: "category_description" })}
              defaultValue={category.description}
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
        {editActionButtons}
      </Grid>
      </div>
    </Dialog>
  );
}
