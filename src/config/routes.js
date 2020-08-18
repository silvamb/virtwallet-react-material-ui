/* eslint-disable react/jsx-key */
import React, { lazy } from 'react'
import PrivateRoute from 'base-shell/lib/components/PrivateRoute/PrivateRoute'
import PublicRoute from 'base-shell/lib/components/PublicRoute/PublicRoute'
import { Route } from 'react-router-dom'


const SignIn = lazy(() => import('../pages/SignIn/SignIn'))
const SignUp = lazy(() => import('../pages/SignUp/SignUp'))
const PasswordReset = lazy(() => import('../pages/PasswordReset/PasswordReset'))
const About = lazy(() => import('../pages/About/About'))
const Home = lazy(() => import('../pages/Home/Home'))
const ListTransactions = lazy(() => import('../pages/Transactions/ListTransactions'))
const Account = lazy(() => import('../pages/Account/ListAccounts'));
const Wallet = lazy(() => import('../pages/Wallet/ListWallets'))
const Category = lazy(() => import('../pages/Category/ListCategories'));
const KeywordRule = lazy(() => import('../pages/CategoryRule/KeywordRule'));
const ExpressionRule = lazy(() => import('../pages/CategoryRule/ExpressionRule'));
const UploadStatement = lazy(() => import('../pages/Wallet/UploadStatement'));
const ReclassifyTransactions = lazy(() => import('../pages/Wallet/ReclassifyTransactions'));

const routes = [
  <PublicRoute path="/signin" redirectTo="/" exact component={SignIn} />,
  <PublicRoute path="/signup" redirectTo="/" exact component={SignUp} />,
  <PublicRoute
    path="/password_reset"
    redirectTo="/"
    exact
    component={PasswordReset}
  />,
  <Route path="/about" exact component={About} />,
  <PrivateRoute path="/home" exact component={Home} />,
  <PrivateRoute path="/accounts" exact component={Account} />,
  <PrivateRoute path="/account/:accountId/wallets" exact component={Wallet} />,
  <PrivateRoute path="/category" exact component={Category} />, 
  <PrivateRoute path="/account/:accountId/categories" exact component={Category} />,
  <PrivateRoute path="/account/:accountId/categoryRule/keywords" exact component={KeywordRule} />,
  <PrivateRoute path="/account/:accountId/categoryRule/expressionRules" exact component={ExpressionRule} />,
  <PrivateRoute path="/account/:accountId/wallet/:walletId/transactions" exact component={ListTransactions} />,
  <PrivateRoute path="/account/:accountId/wallet/:walletId/upload-statement" exact component={UploadStatement} />,
  <PrivateRoute path="/account/:accountId/wallet/:walletId/reclassify" exact component={ReclassifyTransactions} />,
  <PrivateRoute path="/wallets" exact component={Wallet} />,
]

export default routes
