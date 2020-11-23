import React, { useState } from 'react';
import { useIntl } from 'react-intl'
import { makeStyles } from '@material-ui/core/styles';

import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import CloseIcon from '@material-ui/icons/Close';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import FormControl from '@material-ui/core/FormControl';
import Dialog from '@material-ui/core/Dialog';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
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

function BudgetTypeSelect({budgetType = "monthly", readOnly, onChange}) {
  const intl = useIntl();

  return (
    <FormControl fullWidth variant="outlined">
      <InputLabel id="budget-type-label">
        {intl.formatMessage({ id: "budget_type" })}
      </InputLabel>
      <Select
        labelId="budget-type-label"
        id="budgetType"
        value={budgetType}
        onChange={onChange}
        label={intl.formatMessage({ id: "budget_type" })}
        inputProps={{
          readOnly: readOnly,
        }}
      >
        <MenuItem value="monthly">
          {intl.formatMessage({ id: 'monthly' })}
        </MenuItem>
        <MenuItem value="bimonthly">
          {intl.formatMessage({ id: 'bimonthly' })}
        </MenuItem>
        <MenuItem value="yearly">
          {intl.formatMessage({ id: 'yearly' })}
        </MenuItem>
      </Select>
    </FormControl>
  )
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

  const intl = useIntl();
  const classes = useStyles();
  const [updatedCategory, setCategory] = useState(category);

  function save() {
    console.log("Saving category changes", updatedCategory);
    saveAction(updatedCategory);
  }

  function setValue(field, event) {
    event.preventDefault();

    const value = event.target.value;
    const updated = Object.assign({}, updatedCategory);
    updated[field] = value;

    setCategory(updated);
  }

  function setBudget(field, event) {
    event.preventDefault();

    const value = event.target.value;
    const updated = Object.assign({}, updatedCategory);

    if(!updatedCategory.budget) {
      updated.budget = {
        type: "monthly",
        value: 0
      };
    } else {
      updated.budget = Object.assign({}, updatedCategory.budget);
    }

    
    updated.budget[field] = value;

    setCategory(updated);
  }

  function resetFields() {
    setCategory(category);
    editAction(false)
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
                          onClickSave={save}
                          onClickCancel={resetFields}
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
            value={updatedCategory.categoryId}
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
            value={updatedCategory.name}
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
              value={updatedCategory.description}
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
        <Grid item xs={8}>
          <BudgetTypeSelect 
            budgetType={updatedCategory.budget ? updatedCategory.budget.type : "monthly"}
            onChange={(e) => setBudget('type', e)}
            readOnly={viewMode}
          />
        </Grid>
        <Grid item xs={4}>
          <TextField
              id="budget-value"
              label={intl.formatMessage({ id: "budget_value" })}
              type="number"
              InputLabelProps={{
                shrink: true,
              }}
              InputProps={{
                readOnly: viewMode,
                startAdornment: (
                  <InputAdornment position="start">€</InputAdornment>
                ),
              }}
              value={updatedCategory.budget ? updatedCategory.budget.value : 0 }
              variant="outlined"
              onChange={(e) => setBudget('value', e)}
            />
        </Grid>
        {editActionButtons}
      </Grid>
      </div>
    </Dialog>
  );
}
