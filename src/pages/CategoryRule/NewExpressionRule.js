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

function RuleTypeSelect({ruleType, onChange}) {
  const intl = useIntl();

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

export default function NewExpressionRule({
  accountId,
  isOpen,
  closeAction,
  saveAction,
  fullScreen=false 
}) {

  const intl = useIntl();
  const classes = useStyles();

  const [name, setName] = useState("");
  const [category, setCategory] = useState("NO_CATEGORY"); 
  const [parameter, setParameter] = useState(""); 
  const [ruleType, setRuleType] = useState("contains"); 

  const newExpressionRule = {
    accountId: accountId,
    name: name,
    categoryId: category,
    ruleType: ruleType,
    priority: 100,
    parameter: parameter,
  };

  function save() {
    console.log("Saving expression rule", newExpressionRule);
    closeAction()
    setTimeout(() => saveAction(newExpressionRule), 300);
  }

  return (
    <Dialog open={isOpen} fullScreen={fullScreen}>
      <AppBar className={classes.appBar}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => closeAction()} aria-label="close">
            <CloseIcon />
          </IconButton>
          <Typography variant="h6" className={classes.title}>
            {intl.formatMessage({ id: 'create_expression_rule' })}
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
              id="rule-name"
              label={intl.formatMessage({ id: 'name' })}
              variant="outlined"
              onChange={(e) => setName(e.target.value)}
              fullWidth
            />
          </Grid>
          <Grid item xs={12}>
            <CategorySelect
              accountId={accountId}
              category={newExpressionRule.categoryId}
              readOnly={false}
              onChange={(e) => setCategory(e.target.value)}
            />
          </Grid>
          <Grid item xs={5}>
            <RuleTypeSelect 
              ruleType={ruleType}
              onChange={(e) => setRuleType(e.target.value)}
            />
          </Grid>
          <Grid item xs={7}>
            <TextField
              id="rule-parameter"
              label={intl.formatMessage({ id: 'parameter' })}
              variant="outlined"
              onChange={(e) => setParameter(e.target.value)}
              fullWidth
            />
          </Grid>
        </Grid>
      </div>
    </Dialog>
  );
}
