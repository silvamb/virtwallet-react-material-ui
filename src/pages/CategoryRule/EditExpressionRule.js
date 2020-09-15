import React, { useState } from 'react';
import { useIntl } from 'react-intl'
import { makeStyles } from '@material-ui/core/styles';

import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import CloseIcon from '@material-ui/icons/Close';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from "@material-ui/core/DialogActions";
import FormControl from '@material-ui/core/FormControl';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
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

function RuleTypeSelect({ruleType, readOnly, onChange}) {
  const intl = useIntl();

  console.log("ruleType", ruleType);

  return (
    <FormControl fullWidth variant="outlined">
      <InputLabel id="rule-type-label">
        {intl.formatMessage({ id: "rule_type" })}
      </InputLabel>
      <Select
        labelId="rule-type-label"
        id="ruleType"
        value={ruleType}
        onChange={onChange}
        label={intl.formatMessage({ id: "rule_type" })}
        inputProps={{
          readOnly: readOnly,
        }}
      >
        <MenuItem value="startsWith">
          {intl.formatMessage({ id: 'starts_with' })}
        </MenuItem>
        <MenuItem value="contains">
          {intl.formatMessage({ id: 'contains' })}
        </MenuItem>
      </Select>
    </FormControl>
  )
}

export default function EditExpressionRule({
  expressionRule,
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

  const [name, setName] = useState(expressionRule.name);
  const [category, setCategory] = useState(expressionRule.categoryId); 
  const [ruleType, setRuleType] = useState(expressionRule.ruleType); 
  const [parameter, setParameter] = useState(expressionRule.parameter);
  const [priority, setPriority] = useState(expressionRule.priority);

  function save() {
    const updatedExpressionRule = Object.assign({}, expressionRule);
    updatedExpressionRule.name = name;
    updatedExpressionRule.categoryId = category;
    updatedExpressionRule.ruleType = ruleType;
    updatedExpressionRule.parameter = parameter;
    updatedExpressionRule.priority = priority;

    console.log("Saving expression rule", updatedExpressionRule);
    saveAction(updatedExpressionRule);
  }

  function resetFields() {
    console.log("Reseting fields...")
    setName(expressionRule.name);
    setCategory(expressionRule.categoryId);
    setPriority(expressionRule.priority);
    setRuleType(expressionRule.ruleType);
    setParameter(expressionRule.parameter);
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
            {intl.formatMessage({ id: 'edit_expression_rule' })}
          </Typography>
          {viewMode && (<ActionButtons onClickDelete={deleteAction} onClickEdit={editAction} />)}
        </Toolbar>
      </AppBar>
      <div className={classes.dialogBody}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              id="rule-name"
              label={intl.formatMessage({ id: 'name' })}
              value={name}
              variant="outlined"
              onChange={(e) => setName(e.target.value)}
              fullWidth
              InputProps={{
                readOnly: viewMode,
              }}
            />
          </Grid>
          <Grid item xs={7}>
            <CategorySelect
              accountId={expressionRule.accountId}
              category={category}
              readOnly={viewMode}
              onChange={(e) => setCategory(e.target.value)}
            />
          </Grid>
          <Grid item xs={5}>
            <TextField
              id="rule-priority"
              label={intl.formatMessage({ id: 'priority' })}
              value={priority}
              variant="outlined"
              onChange={(e) => setPriority(e.target.value)}
              fullWidth
              type="number"
              InputProps={{
                readOnly: viewMode,
              }}
            />
          </Grid>
          <Grid item xs={5}>
            <RuleTypeSelect 
              ruleType={ruleType}
              onChange={(e) => setRuleType(e.target.value)}
              readOnly={viewMode}
            />
          </Grid>
          <Grid item xs={7}>
            <TextField
              id="rule-parameter"
              label={intl.formatMessage({ id: 'parameter' })}
              variant="outlined"
              onChange={(e) => setParameter(e.target.value)}
              fullWidth
              value={parameter}
              InputProps={{
                readOnly: viewMode,
              }}
            />
          </Grid>
          {!viewMode && (
            <DialogActions>
              <Button onClick={resetFields}>
                {intl.formatMessage({ id: "cancel" })}
              </Button>
              <Button color="primary" variant="contained" onClick={save}>
                {intl.formatMessage({ id: "save" })}
              </Button>
            </DialogActions>
          )}
        </Grid>
      </div>
    </Dialog>
  );
}
