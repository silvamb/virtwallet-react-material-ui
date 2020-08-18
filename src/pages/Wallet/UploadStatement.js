import React, { useState } from "react";
import { useIntl } from "react-intl";

import Page from "material-ui-shell/lib/containers/Page/Page";

import Button from "@material-ui/core/Button";
import LinearProgress from "@material-ui/core/LinearProgress";
import Paper from "@material-ui/core/Paper";
import Step from "@material-ui/core/Step";
import StepLabel from "@material-ui/core/StepLabel";
import StepContent from "@material-ui/core/StepContent";
import Stepper from "@material-ui/core/Stepper";
import Typography from "@material-ui/core/Typography";

import { makeStyles } from "@material-ui/core/styles";

import { upload } from '../../utils/dataSync';

const useStyles = makeStyles((theme) => ({
  root: {
    "overflow-x": "hidden",
    padding: theme.spacing(1),
  },
  input: {
    display: "none",
  },
  actionsContainer: {
    marginBottom: theme.spacing(2),
  },
  resetContainer: {
    padding: theme.spacing(3),
  },
}));

function SelectFileStepContent({classes, intl, handleSelectedFile}) {
  return (
    <>
      <Typography>
        {intl.formatMessage({ id: "select_file_message" })}
      </Typography>
      <div className={classes.actionsContainer}>
        <div>
          <input
            accept=".csv"
            className={classes.input}
            id="upload-statement-input"
            type="file"
            onChange={handleSelectedFile}
          />
          <label htmlFor="upload-statement-input">
            <Button
              variant="contained"
              color="primary"
              component="span"
            >
              {intl.formatMessage({ id: "select_file" })}
            </Button>
          </label>
        </div>
      </div>
    </>
  )
}

function UploadFile({classes, intl, selectedFile = {}, handleNext}) {
  return (
    <>
      <Typography>
        {intl.formatMessage({ id: "uploading_file_message" }, {fileName: selectedFile.name})}
      </Typography>
      <div className={classes.actionsContainer}>
        {intl.formatMessage({ id: "uploading_file" })}
        <LinearProgress />
      </div>
    </>
  )
}

function FileUploadedMessage({classes, intl, successful, selectedFile = {}, handleReset}) {
  const message = successful ? "upload_successful_message" : "upload_error_message";
  const buttonLabel = successful ? "upload_another_file" : "try_again";

  return (
    <Paper square elevation={1} className={classes.resetContainer}>
      <Typography>{intl.formatMessage({ id: message }, {fileName: selectedFile.name})}</Typography>
      <Button onClick={handleReset}  variant="contained" color="primary">
        {intl.formatMessage({ id: buttonLabel })}
      </Button>
    </Paper>
  )
}

const SELECT_FILE = 0;
const UPLOADING = 1;
const FINISHED = 2;

async function uploadFile(accountId, walletId, parserId, file, onUploaded) {

  try {
    await upload(accountId, walletId, parserId, file);
    onUploaded(true);
  } catch(error) {
    onUploaded(false);
  }
}

export default function UploadStatementPage(props) {
  const intl = useIntl();
  const classes = useStyles();

  const accountId = props.match.params.accountId;
  const walletId = props.match.params.walletId;

  const [step, setStep] = useState(SELECT_FILE);
  const [selectedFile, setFile] = useState();
  const [uploaded, setUploadedWithSuccess] = useState(false);

  function onUploaded(success) {
    setStep(FINISHED);
    setUploadedWithSuccess(success);
  }

  function startUpload(e) {
    const files = e.target.files;

    if(files.length > 0) {
      setStep(UPLOADING);
      setFile(files[0]);
      uploadFile(accountId, walletId, "ulster_csv", files[0], onUploaded);
    }
  }

  function handleReset() {
    setStep(SELECT_FILE);
    setUploadedWithSuccess(false);
  }

  return (
    <Page pageTitle={intl.formatMessage({ id: "upload_statement" })}>
      <div className={classes.root}>
        <Stepper activeStep={step} orientation="vertical">
          <Step key="select-file-step">
            <StepLabel>{intl.formatMessage({ id: "select_file_to_upload" })}</StepLabel>
            <StepContent>
              <SelectFileStepContent
                classes={classes}
                intl={intl}
                handleSelectedFile={startUpload}
              />
            </StepContent>
          </Step>
          <Step key="upload-file-step">
            <StepLabel error={step === FINISHED && !uploaded}>{intl.formatMessage({ id: "upload_file" })}</StepLabel>
            <StepContent>
              <UploadFile
                classes={classes}
                intl={intl}
                selectedFile={selectedFile}
              />
            </StepContent>
          </Step>
        </Stepper>
        {step === FINISHED && (
          <FileUploadedMessage
            classes={classes}
            intl={intl}
            successful={uploaded}
            selectedFile={selectedFile}
            handleReset={handleReset}
          />
        )}
      </div>
    </Page>
  );
}
