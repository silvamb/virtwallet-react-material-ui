import React, { useState } from "react";
import { useIntl } from "react-intl";
import { makeStyles } from "@material-ui/core/styles";

import moment from "moment";
import MomentUtils from "@date-io/moment";

import AppBar from "@material-ui/core/AppBar";
import Button from "@material-ui/core/Button";
import CloseIcon from "@material-ui/icons/Close";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import Grid from "@material-ui/core/Grid";
import IconButton from "@material-ui/core/IconButton";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";

import {
  KeyboardDatePicker,
  MuiPickersUtilsProvider,
} from "@material-ui/pickers";

const useStyles = makeStyles((theme) => ({
  appBar: {
    position: "static",
  },
  title: {
    marginLeft: theme.spacing(2),
    flex: 1,
  },
  dialogBody: {
    "overflow-x": "hidden",
    padding: theme.spacing(1),
    marginTop: theme.spacing(2),
  },
  categoryInfo: {
    marginTop: theme.spacing(1),
  },

  periods: {
    marginBottom: theme.spacing(2),
    marginTop: theme.spacing(1),
  }
}));

const newManuallySetPeriod = {
  startDate: moment().subtract(1, "month").format("yyyy-MM-DD"),
  endDate: moment().format("yyyy-MM-DD"),
  month: moment().format("yyyy-MM"),
};

export default function EditManuallySetPeriod({
  manuallySetPeriod = newManuallySetPeriod,
  isOpen,
  closeAction,
  saveAction,
  fullScreen = false,
  editMode
}) {
  const intl = useIntl();
  const classes = useStyles();

  const title = editMode ? "edit_period_manually" : "create_period_manually";

  const [updatedPeriod, setPeriod] = useState(manuallySetPeriod);

  function save() {
    console.log("Saving period", updatedPeriod);
    saveAction(updatedPeriod);
  }

  function setValue(field, value) {
    const updated = Object.assign({}, updatedPeriod);
    updated[field] = value;

    setPeriod(updated);
  }

  return (
    <Dialog open={isOpen} fullScreen={fullScreen}>
      <AppBar className={classes.appBar}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => closeAction()}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
          <Typography variant="h6" className={classes.title}>
            {intl.formatMessage({ id: title })}
          </Typography>
        </Toolbar>
      </AppBar>
      <div className={classes.dialogBody}>
        <Grid container justify="flex-start" spacing={2}>
          <Grid item sm={4} xs={6}>
            <MuiPickersUtilsProvider utils={MomentUtils}>
              <KeyboardDatePicker
                margin="normal"
                id="start-date-picker"
                label={intl.formatMessage({ id: "from" })}
                format="yyyy-MM-DD"
                value={moment(updatedPeriod.startDate, "yyyy-MM-DD")}
                onChange={(date) =>
                  setValue(
                    "startDate",
                    moment(date).format("yyyy-MM-DD")
                  )
                }
                KeyboardButtonProps={{
                  "aria-label": "change start date",
                }}
              />
            </MuiPickersUtilsProvider>
          </Grid>
          <Grid item sm={4} xs={6}>
            <MuiPickersUtilsProvider utils={MomentUtils}>
              <KeyboardDatePicker
                margin="normal"
                id="end-date-picker"
                label={intl.formatMessage({ id: "to" })}
                format="yyyy-MM-DD"
                value={moment(updatedPeriod.endDate, "yyyy-MM-DD")}
                onChange={(date) =>
                  setValue("endDate", moment(date).format("yyyy-MM-DD"))
                }
                KeyboardButtonProps={{
                  "aria-label": "change start date",
                }}
              />
            </MuiPickersUtilsProvider>
          </Grid>
          <Grid item sm={4} xs={6}>
            <MuiPickersUtilsProvider utils={MomentUtils}>
              <KeyboardDatePicker
                margin="normal"
                id="reference-month-picker"
                label={intl.formatMessage({ id: "month" })}
                format="yyyy-MM"
                value={moment(updatedPeriod.month, "yyyy-MM")}
                onChange={(date) =>
                  setValue("month", moment(date).format("yyyy-MM"))
                }
                KeyboardButtonProps={{
                  "aria-label": "change month",
                }}
                views={["month"]}
                openTo={"month"}
              />
            </MuiPickersUtilsProvider>
          </Grid>
        </Grid>
      </div>
      <DialogActions>
        <Button onClick={closeAction}>
          {intl.formatMessage({ id: "cancel" })}
        </Button>
        <Button color="primary" variant="contained" onClick={save}>
          {intl.formatMessage({ id: "save" })}
        </Button>
      </DialogActions>
    </Dialog>
  );
}