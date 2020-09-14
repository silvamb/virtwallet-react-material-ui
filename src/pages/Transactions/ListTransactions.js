import React, { useState, useEffect } from 'react'
import { useIntl } from 'react-intl'
import Page from 'material-ui-shell/lib/containers/Page/Page'

import moment from 'moment'

import MomentUtils from '@date-io/moment';

import { makeStyles } from "@material-ui/core/styles";
import { useTheme } from '@material-ui/core/styles';
import useMediaQuery from '@material-ui/core/useMediaQuery'

import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';
import Drawer from '@material-ui/core/Drawer';
import InputAdornment from '@material-ui/core/InputAdornment';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormLabel from '@material-ui/core/FormLabel';
import Grid from '@material-ui/core/Grid'
import IconButton from '@material-ui/core/IconButton';
import List from "@material-ui/core/List";
import ListSubheader from "@material-ui/core/ListSubheader"
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import Snackbar from '@material-ui/core/Snackbar';
import Switch from '@material-ui/core/Switch';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import CheckIcon from '@material-ui/icons/Check';
import CloudDownloadIcon from '@material-ui/icons/CloudDownload';
import SearchIcon from '@material-ui/icons/Search';
import SortIcon from '@material-ui/icons/Sort';
import TuneIcon from '@material-ui/icons/Tune';
import { KeyboardDatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';

import { loadFromRestApi } from '../../utils/dataSync';

import { DataLoader, saveTransaction } from './Transaction'
import TransactionDetails from './TransactionDetails';

class MessageHandler {
  constructor(showMessageFn, intl) {
    this.showMessageFn = showMessageFn;
    this.intl = intl;
  }

  showMessage(messageKey) {
    const message = this.intl.formatMessage({ id: messageKey });
    this.showMessageFn(message);
  }
}

const useStyles = makeStyles((theme) => ({
  root: {
    "overflow-x": "hidden",
    padding: theme.spacing(1),
  },
  appBar: {
    position: 'static',
  },
  title: {
    marginLeft: theme.spacing(2),
    flex: 1,
  },
  paper: {
    width: 'auto',
    marginLeft: theme.spacing(3),
    marginRight: theme.spacing(3),
    marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: theme.spacing(2),
    right: theme.spacing(2),
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: "#fff",
  },
  drawer: {
    padding: theme.spacing(2),
    marginTop: theme.spacing(2),
    display: 'flex',
    flexDirection: 'column',
    width: 'auto',
  },
  settings: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    width: 'auto',
  },
  drawerSettings: {
    marginTop: theme.spacing(2),
  },
  dates: {
    display: 'flex',
    flexDirection: 'row',
    width: 'auto',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    margin: theme.spacing(2),
    '& div': {
      marginLeft: theme.spacing(2)
    },
  },
  ul: {
    backgroundColor: 'inherit',
    padding: 0,
  },
  listSection: {
    backgroundColor: 'inherit',
  },
  grayText: {
    color: 'gray',
  },
  
}));

async function exportToCsv(accountId, walletId, from, to) {

  const path = `account/${accountId}/wallet/${walletId}/export`;
  const queryParameters = {
    from: from,
    to: to
  }
  
  try {
    console.log("Exporting transactions from accountId =", accountId, ", walletId =", walletId, "from =", from, "', to =", to)
    const url = await loadFromRestApi(path, queryParameters);
    console.log("CSV File S3 URL:", url);
    window.open(url);
  } catch(err) {
    console.log("Error exporting transactions", err);
    //this.messageHandler.showMessage("error_loading_transactions");
    //this.setTransactions([]);
  }
}

function sortByDate(list) {
  const listCopy = list.slice();

  listCopy.sort((tx1, tx2) => {
    return tx1.txDate.localeCompare(tx2.txDate);
  })

  return listCopy;
}

function sortByDescription(list) {
  const listCopy = list.slice();

  listCopy.sort((tx1, tx2) => {
    return tx1.description.toUpperCase().localeCompare(tx2.description.toUpperCase());
  })

  return listCopy;
}

function sortByValue(list) {
  const listCopy = list.slice();

  listCopy.sort((tx1, tx2) => {
    return Number(tx1.value) - Number(tx2.value);
  })

  return listCopy;
}

const sorters = new Map([
  ['date', sortByDate],
  ['description', sortByDescription],
  ['value', sortByValue],
]);

function sort(orderBy, list, asc = true) {
  const sortFn = sorters.get(orderBy);

  const sorted = sortFn(list);

  if(!asc) {
    sorted.reverse();
  }

  return sorted ;
}

function groupByDate(transactions) {
  const groupArray = [];

  const groups = transactions.reduce((groupMap, transaction) =>{
    if(!groupMap[transaction.txDate]) {
      groupMap[transaction.txDate] = [];
    }

    groupMap[transaction.txDate].push(transaction);

    return groupMap;
  }, {});

  for(let date in groups) {
    groupArray.push({
      groupId: date,
      transactions: groups[date]
    })
  }

  return groupArray;
}

function groupByCategory(transactions, categories) {
  const groupArray = [];


  const groups = transactions.reduce((groupMap, transaction) =>{
    if(!groupMap[transaction.categoryId]) {
      groupMap[transaction.categoryId] = [];
    }

    groupMap[transaction.categoryId].push(transaction);

    return groupMap;
  }, {});
  
  console.log("Categories", Object.keys(groups));

  const categoriesCopy = categories.slice()
  categoriesCopy.push({categoryId: "NO_CATEGORY", name: "Unclassified"});

  for(let categoryId in groups) {
    const category = categoriesCopy.find(category => categoryId === category.categoryId);

    if(category) {
      groupArray.push({
        groupId: category.name,
        transactions: groups[categoryId]
      })
    } else {
      console.log("Category not found", categoryId);
    }

    
  }

  return groupArray;
}

function TransactionList({transactions, openDetails}) {
  

  return (
    <List>
      {transactions.map(transaction => {
        const txValue = transaction.balanceType === "Debit" ? `-€${transaction.value}`: `+€${transaction.value}`;

        let desc = transaction.description
        if(transaction.description.indexOf(",") >= 0) {
          desc = transaction.description.split(",", 1);
        }

        return (
          <ListItem key={transaction.txId} button onClick={() => openDetails(transaction)}>
            <ListItemText primary={desc} secondary={transaction.txDate}/>
            <Typography variant="body1">
              {txValue}
            </Typography>
          </ListItem>
        )}
      )}
    </List>
  );
}

function TransactionNestedList({group, classes, intl, openDetails}) {
  return (
    <ul className={classes.ul}>
      <ListSubheader>{group.groupId}</ListSubheader>
      {group.transactions.map((transaction) => {
        const txValue = transaction.balanceType === "Debit" ? `-€${transaction.value}`: `+€${transaction.value}`;

        let desc = transaction.description
        if(transaction.description.indexOf(",") >= 0) {
          desc = transaction.description.split(",", 1);
        }

        return (
          <ListItem key={transaction.txId} button onClick={() => openDetails(transaction)}>
            <ListItemText inset primary={desc} secondary={transaction.txDate}/>
            <Typography variant="body1">
              {txValue}
            </Typography>
          </ListItem>)
        }
      )}
    </ul>
  );
}

function TransactionsByGroup({groupedTransactions, classes, intl, openDetails}) {
  return (
    <List subheader={<li />}>
      {groupedTransactions.map((group) => (
        <li key={`section-${group.groupId}`} className={classes.listSection}>
          <TransactionNestedList
            group={group}
            classes={classes}
            intl={intl}
            openDetails={openDetails}
          />
        </li>
      ))}
    </List>
  );
}

function FilterDrawer({classes, intl, open = true, selectedFilter, onClose, handleFilter}) {

  return (
    <Drawer anchor={"bottom"} open={open} onClose={onClose}>
      <div className={classes.drawer}>
        <List className={classes.root} subheader={<ListSubheader>{intl.formatMessage({ id: 'filter_by_period' })}</ListSubheader>} >
          {[7, 15, 30, 60, 90].map((value, index) => {
            const labelId = `checkbox-list-label-${value}`;

            return (
              <ListItem key={value} selected={selectedFilter.index === index} button onClick={() => handleFilter({index})}>
                  <ListItemIcon>
                    {selectedFilter.index === index && <CheckIcon/>}
                  </ListItemIcon>
                <ListItemText id={labelId} primary={`Last ${value} days`} />
              </ListItem>
            );
          })}
          <ListSubheader>{intl.formatMessage({ id: 'filter_by_date' })}</ListSubheader>
          <ListItem key={"date-range"}>
            <div className={classes.dates}>
              <MuiPickersUtilsProvider utils={MomentUtils}>
                <div>
                  <KeyboardDatePicker
                    margin="normal"
                    id="start-date-picker"
                    label={intl.formatMessage({ id: 'from' })}
                    format="yyyy-MM-DD"
                    value={moment(selectedFilter.startDate, "yyyy-MM-DD")}
                    onChange={(date) => handleFilter({index: 5, startDate: moment(date).format("yyyy-MM-DD")})}
                    KeyboardButtonProps={{
                      'aria-label': 'change start date',
                    }}
                  />
                </div>
                <div>
                  <KeyboardDatePicker
                    margin="normal"
                    id="end-date-picker"
                    label={intl.formatMessage({ id: 'to' })}
                    format="yyyy-MM-DD"
                    value={moment(selectedFilter.endDate, "yyyy-MM-DD")}
                    onChange={(date) => handleFilter({index: 6, endDate: moment(date).format("yyyy-MM-DD")})}
                    KeyboardButtonProps={{
                      'aria-label': 'change start date',
                    }}
                  />
                </div>
              </MuiPickersUtilsProvider>
            </div>
          </ListItem>
        </List>
      </div>
    </Drawer>
  );
}

const TransactionsPage = (props) => {
  const classes = useStyles();
  const intl = useIntl();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  let timerId;

  const [message, setMessage] = useState("");
  const messageHandler = new MessageHandler(setMessage, intl);

  const accountId = props.match.params.accountId;
  const walletId = props.match.params.walletId;

  const initialFilter = {
    index: 3,
    startDate: moment().subtract(60, 'days').format('yyyy-MM-DD'),
    endDate: moment().format('yyyy-MM-DD'),
  }

  const [data, setData] = useState(null);
  const [fetchingData, setFetchingData] = useState(false);
  const [selectedFilter, setDateFilter] = useState(initialFilter);

    // TODO Load categories too. Similar do DataLoader in category rule.
  const dataLoader = new DataLoader(setData, messageHandler)
  const loading = data === null;

  useEffect(() => {
    if (!fetchingData) {
      setFetchingData(true);
      dataLoader.load(accountId, walletId, selectedFilter);
    }
  }, [fetchingData, dataLoader, accountId, walletId, selectedFilter]);
  const [selectedTransaction, setTransaction] = useState({});
  const [editing, setEditing] = useState(false);
  const [originalTransaction, setOriginalTransaction] = useState(null);
  const [settingsOpened, showSettings] = useState(false);
  const [filtersOpened, showFilters] = useState(false);
  const [sorter, setSorter] = useState('date');
  const [groupBy, setGroupBy] = useState('none');
  const [ascending, setAscending] = useState(true);
  const [searchTerm, setSearchTerm] = useState();
  
  const filteredTransactions = loading ? [] : filterAndSort();

  function filterAndSort() {
    const sorted =  sort(sorter, data.transactions, ascending)
    
    if(searchTerm) {
      return sorted.filter(tx => {
        return tx.keyword.toUpperCase().indexOf(searchTerm.toUpperCase()) >= 0;
      });
    }
    
    return sorted;
  }

  function openDetails(transaction) {
    setTransaction(transaction);
  }

  function closeDetails() {
    setTransaction({});
    setEditing(false);
    setOriginalTransaction(null);

  }

  function toggleEditing(editing = true) {
    setEditing(editing);
    setOriginalTransaction(selectedTransaction);
  }
  
  function save(updatedTransaction) {
    setMessage("Saving transaction...");
    closeDetails();

    const showMessageAndUpdateList = () => {
      setMessage("Transaction Saved!");
      dataLoader.load(accountId, walletId, selectedFilter);
    };
    saveTransaction(originalTransaction, updatedTransaction, showMessageAndUpdateList);
  }

  function debounce(func, delay) {
    // Cancels the setTimeout method execution
    clearTimeout(timerId);
  
    // Executes the func after delay time.
    timerId = setTimeout(func, delay);
  }

  function filterTransactions(event) {
    event.preventDefault();
    const text = event.target.value;

    debounce(() => {
      setSearchTerm(text);
    }, 300);
  }


  function setOrder(event) {
    const sorterName = event.target.value;
    setSorter(sorterName);
  }

  function reverse(ascending) {
    const reversed = filteredTransactions.slice();
    reversed.reverse();

    setAscending(ascending);
  }

  function setAggregator(event) {
    const groupByField = event.target.value;
    setGroupBy(groupByField);
  }

  function handleFilter(updatedValues) {
    const days = [7, 15, 30, 60, 90];

    if(updatedValues.index < 5) {
      updatedValues.startDate = moment().subtract(days[updatedValues.index], 'days').format('yyyy-MM-DD');
      updatedValues.endDate = moment().format('yyyy-MM-DD');
    }

    console.log("Updated date", updatedValues);

    setDateFilter(prevState => {
      return {...prevState, ...updatedValues};
    });
    setFetchingData(false);
  }

  function getTransactions() {

    if(groupBy === "date") {
      const groups = groupByDate(filteredTransactions);
      return <TransactionsByGroup groupedTransactions={groups} classes={classes} intl={intl} openDetails={openDetails} />
    }

    if(groupBy === "category") {
      const groups = groupByCategory(filteredTransactions, data.categories);
      return <TransactionsByGroup groupedTransactions={groups} classes={classes} intl={intl} openDetails={openDetails} />
    }

    return <TransactionList transactions={filteredTransactions} openDetails={openDetails}/>
  }

  async function downloadTransactions() {
    exportToCsv(accountId, walletId, selectedFilter.startDate, selectedFilter.endDate);
  }

  let pageBody;
  if(data == null) {
    pageBody = <Typography variant="body1">Loading...</Typography>
  } else if(filteredTransactions.length === 0) {
    pageBody = <Typography variant="body1">No transactions...</Typography>
  } else {
    pageBody = getTransactions();
  }

  let transactionDetails = '';
  if(Object.keys(selectedTransaction).length > 0) {
    transactionDetails = <TransactionDetails
      transaction={selectedTransaction}
      isOpen={true}
      viewMode={!editing}
      closeAction={closeDetails}
      saveAction={save}
      editAction={toggleEditing}
      definedClasses={classes}
      fullScreen={fullScreen}
    />
  }

  return (
    <Page pageTitle={intl.formatMessage({ id: 'transactions' })}>
      <div className={classes.root}>
        {transactionDetails}
        <div className={classes.settings}>
          <TextField 
            id="transaction-search"
            type="search"
            variant="outlined"
            placeholder="Search for a transaction"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <SearchIcon/>
                </InputAdornment>
              ),
            }}
            onChange={filterTransactions}
            fullWidth
          />
          <IconButton aria-label="sort" onClick={() => showSettings(true)}>
            <SortIcon />
          </IconButton>
          <IconButton aria-label="filter" onClick={() => showFilters(true)}>
            <TuneIcon />
          </IconButton>
          <IconButton aria-label="filter" onClick={downloadTransactions}>
            <CloudDownloadIcon />
          </IconButton>
        </div>
        

        {pageBody}
        <Drawer anchor={"bottom"} open={settingsOpened} onClose={() => showSettings(false)}>
          <div className={classes.drawer}>
            <FormControl component="fieldset" >
              <FormLabel component="legend">Order by</FormLabel>
              <RadioGroup aria-label="orderby" name="orderby" value={sorter} onChange={(e) => setOrder(e)}>
                <FormControlLabel value="date" control={<Radio />} label="Date" />
                <FormControlLabel value="description" control={<Radio />} label="Description" />
                <FormControlLabel value="value" control={<Radio />} label="Value" />
              </RadioGroup>
            </FormControl>
            <FormControlLabel
              control={
                <Switch
                  checked={ascending}
                  onChange={() => reverse(!ascending)}
                  name="sortAsc"
                  color="primary"
                />
              }
              label="Ascending"
            />
            <FormControl component="fieldset" className={classes.drawerSettings}>
              <FormLabel component="legend">Group by</FormLabel>
              <RadioGroup aria-label="groupby" name="groupby" value={groupBy} onChange={(e) => setAggregator(e)}>
                <FormControlLabel value="date" control={<Radio />} label="Date" />
                <FormControlLabel value="category" control={<Radio />} label="Category" />
                <FormControlLabel value="none" control={<Radio />} label="None" />
              </RadioGroup>
            </FormControl>
          </div>
        </Drawer>
        {filtersOpened && 
          <FilterDrawer
            classes={classes}
            intl={intl}
            open={filtersOpened}
            selectedFilter={selectedFilter}
            onClose={() => showFilters(false)}
            handleFilter={handleFilter}
          />
        }
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
        <Backdrop className={classes.backdrop} open={loading}>
          <CircularProgress color="inherit" />
        </Backdrop>
      </div>
    </Page>
  )
}
export default TransactionsPage
