import React from 'react';
import { useIntl } from 'react-intl';

// Material UI dependencies
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';

const sourceType = {
  "A": "Automatic",
  "M": "Manual"
}

const TransactionExtraDetails = ({transaction, disabled = false}) => {
  const intl = useIntl();

    return (
      <ExpansionPanel disabled={disabled}>
        <ExpansionPanelSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1a-content"
          id="panel1a-header"
        >
          <Typography>{intl.formatMessage({ id: 'more_details' })}</Typography>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField
                  id="source-type"
                  label={intl.formatMessage({ id: 'source_type' })}
                  value={sourceType[transaction.sourceType]}
                  InputProps={{
                    readOnly: true,
                  }}
                  fullWidth
                  variant="outlined"
              />
              </Grid>
              <Grid item xs={12} sm={8}>
                <TextField
                    id="source"
                    label={intl.formatMessage({ id: 'source' })}
                    value={transaction.source}
                    InputProps={{
                      readOnly: true,
                    }}
                    fullWidth
                    variant="outlined"
                />
            </Grid>
          </Grid>
        </ExpansionPanelDetails>
    </ExpansionPanel>
    );
}

export default TransactionExtraDetails
