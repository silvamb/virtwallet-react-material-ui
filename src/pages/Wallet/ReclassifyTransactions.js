import React, { useState } from "react";
import { useIntl } from "react-intl";
import Page from "material-ui-shell/lib/containers/Page/Page";

import moment from 'moment'
import MomentUtils from "@date-io/moment";

import { makeStyles } from "@material-ui/core/styles";
import Backdrop from '@material-ui/core/Backdrop';
import Button from "@material-ui/core/Button";
import CircularProgress from '@material-ui/core/CircularProgress';
import FormControl from "@material-ui/core/FormControl";
import Grid from "@material-ui/core/Grid";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import Snackbar from "@material-ui/core/Snackbar"

import {
  KeyboardDatePicker,
  MuiPickersUtilsProvider,
} from "@material-ui/pickers";

import { reclassifyTransactions } from './Wallet';

class MessageHandler {
  constructor(showMessageFn, intl) {
    this.showMessageFn = showMessageFn;
    this.intl = intl;
  }

  showMessage(messageKey, values) {
    const message = this.intl.formatMessage({ id: messageKey }, values);
    this.showMessageFn(message);
  }
}


const useStyles = makeStyles((theme) => ({
  root: {
    "overflow-x": "hidden",
    padding: theme.spacing(1),
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: "#fff",
  },
}));

function SourceTypeSelect({ sourceType, onChange }) {
  const intl = useIntl();

  return (
    <FormControl fullWidth variant="outlined">
      <InputLabel id="source-type-label">
        {intl.formatMessage({ id: "source_type" })}
      </InputLabel>
      <Select
        labelId="source-type-label"
        id="sourceType"
        value={sourceType}
        onChange={onChange}
        label={intl.formatMessage({ id: "source_type" })}
      >
        <MenuItem value="auto">
          {intl.formatMessage({ id: "automatic" })}
        </MenuItem>
        <MenuItem value="manual">
          {intl.formatMessage({ id: "manual" })}
        </MenuItem>
      </Select>
    </FormControl>
  );
}

export default function ReclassifyTransactionsPage(props) {
  const intl = useIntl();
  const classes = useStyles();

  const accountId = props.match.params.accountId;
  const walletId = props.match.params.walletId;

  const [message, setMessage] = useState("");
  const messageHandler = new MessageHandler(setMessage, intl);

  const [sourceType, setSourceType] = useState("auto");
  const [startDate, setStartDate] = useState(moment().subtract(7, 'days'));
  const [endDate, setEndDate] = useState(moment());
  const [executing, setExecuting] = useState(false);
 
  async function executeInBackground() {    
    const fromDate = startDate.format('yyyy-MM-DD');
    const toDate = endDate.format('yyyy-MM-DD');

    try {
      const data = await reclassifyTransactions({accountId, walletId, fromDate, toDate, sourceType});
      messageHandler.showMessage('total_reclassified', {total: data.length});
    } catch(err) {
      messageHandler.showMessage('error_reclassifying');
    }
    setExecuting(false);
  }

  function handleSubmit() {
    setExecuting(true);
    executeInBackground();
  }

  return (
    <Page pageTitle={intl.formatMessage({ id: "reclassify_transactions" })}>
      <div className={classes.root}>
        <MuiPickersUtilsProvider utils={MomentUtils}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <KeyboardDatePicker
                margin="normal"
                id="start-date-picker"
                label={intl.formatMessage({ id: "from" })}
                format="yyyy-MM-DD"
                value={startDate}
                onChange={(date) => setStartDate(date)}
                KeyboardButtonProps={{
                  "aria-label": "change start date",
                }}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <KeyboardDatePicker
                margin="normal"
                id="end-date-picker"
                label={intl.formatMessage({ id: "to" })}
                format="yyyy-MM-DD"
                value={endDate}
                onChange={(date) => setEndDate(date) }
                KeyboardButtonProps={{
                  "aria-label": "change end date",
                }}
                fullWidth
              />
            </Grid>
            <Grid item xs={6}>
              <SourceTypeSelect
                sourceType={sourceType}
                onChange={(e) => setSourceType(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <Button fullWidth onClick={handleSubmit}  variant="contained" color="primary">
                {intl.formatMessage({ id: "reclassify" })}
              </Button>
            </Grid>
          </Grid>
        </MuiPickersUtilsProvider>
        <Snackbar
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
          open={message !== ''}
          autoHideDuration={6000}
          onClose={() => setMessage('')}
          message={message}
        />
        <Backdrop className={classes.backdrop} open={executing}>
          <CircularProgress color="inherit" />
        </Backdrop>
      </div>
    </Page>
  );
}
