import React, { useState } from 'react';
import { useIntl } from 'react-intl'
import { makeStyles } from '@material-ui/core/styles';

import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import CloseIcon from '@material-ui/icons/Close';
import Dialog from '@material-ui/core/Dialog';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import TextField from '@material-ui/core/TextField';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';

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
  }
}));

export default function NewCategory({
  isOpen,
  closeAction,
  saveAction,
  fullScreen=false 
}) {

  const intl = useIntl();
  const classes = useStyles();
  let newCategory = {};

  function save() {
    console.log("Create new category", newCategory);
    saveAction(newCategory);
  }

  function setValue(field, event) {
    event.preventDefault();

    const value = event.target.value;
    const updated = Object.assign({}, newCategory);
    updated[field] = value;

    newCategory = updated;
  }

  return (
    <Dialog open={isOpen} fullScreen={fullScreen}>
      <AppBar className={classes.appBar}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => closeAction()} aria-label="close">
            <CloseIcon />
          </IconButton>
          <Typography variant="h6" className={classes.title}>
            {intl.formatMessage({ id: 'create_category' })}
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
            id="category-name"
            label={intl.formatMessage({ id: 'category_name' })}
            variant="outlined"
            onChange={(e) => setValue('name', e)}
            fullWidth
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
              id="category-description"
              label={intl.formatMessage({ id: "category_description" })}
              variant="outlined"
              onChange={(e) => setValue('description', e)}
              fullWidth
            />
        </Grid>
      </Grid>
      </div>
    </Dialog>
  );
}
