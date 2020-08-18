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
  }
}));

export default function NewKeyword({
  accountId,
  isOpen,
  closeAction,
  saveAction,
  fullScreen=false 
}) {

  const intl = useIntl();
  const classes = useStyles();

  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState("NO_CATEGORY"); 

  const newKeyword = {
    keyword: keyword,
    accountId: accountId,
    ruleType: "keyword",
    categoryId: category,
    priority: 100
  };

  function save(keyword) {
    console.log("Saving new keyword", keyword);
    saveAction(keyword);
  }

  return (
    <Dialog open={isOpen} fullScreen={fullScreen}>
      <AppBar className={classes.appBar}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => closeAction()} aria-label="close">
            <CloseIcon />
          </IconButton>
          <Typography variant="h6" className={classes.title}>
            {intl.formatMessage({ id: 'create_keyword' })}
          </Typography>
          <Button color="inherit" onClick={() => save(newKeyword)}>
            {intl.formatMessage({ id: 'save' })}
          </Button>
        </Toolbar>
      </AppBar>
      <div className={classes.dialogBody}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              id="keyword"
              label={intl.formatMessage({ id: 'keyword' })}
              variant="outlined"
              onChange={(e) => setKeyword(e.target.value)}
              fullWidth
            />
          </Grid>
          <Grid item xs={12}>
            <CategorySelect
              accountId={accountId}
              category={newKeyword.categoryId}
              readOnly={false}
              onChange={(e) => setCategory(e.target.value)}
            />
          </Grid>
        </Grid>
      </div>
    </Dialog>
  );
}
