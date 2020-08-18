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

import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import SaveIcon from '@material-ui/icons/Save';

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

export default function EditKeyword({
  keywordRule,
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

  const [category, setCategory] = useState(keywordRule.categoryId);
  const [keyword, setKeyword] = useState(keywordRule.keyword);

  function save() {
    const updatedKeyword = Object.assign({}, keywordRule);
    updatedKeyword.keyword = keyword;
    updatedKeyword.categoryId = category;

    console.log("Saving keyword changes", updatedKeyword);
    saveAction(updatedKeyword);
  }

  function resetFields() {
    setCategory(keywordRule.categoryId);
    setKeyword(keywordRule.keyword);
    editAction(false);
  }

  return (
    <Dialog open={isOpen} fullScreen={fullScreen}>
      <AppBar className={classes.appBar}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => closeAction()} aria-label="close">
            <CloseIcon />
          </IconButton>
          <Typography variant="h6" className={classes.title}>
            {intl.formatMessage({ id: 'edit_keyword' })}
          </Typography>
          {viewMode && (<ActionButtons onClickDelete={deleteAction} onClickEdit={editAction} />)}
        </Toolbar>
      </AppBar>
      <div className={classes.dialogBody}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              id="keyword"
              defaultValue={keywordRule.keyword}
              label={intl.formatMessage({ id: 'keyword' })}
              variant="outlined"
              onChange={(e) => setKeyword(e.target.value)}
              fullWidth
              InputProps={{
                readOnly: true,
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <CategorySelect
              accountId={keywordRule.accountId}
              category={category}
              readOnly={viewMode}
              onChange={(e) => setCategory(e.target.value)}
            />
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
