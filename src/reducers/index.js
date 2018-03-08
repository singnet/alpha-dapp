import { combineReducers } from "redux"
// reducers
import web3 from "./web3"
import market from "./market"
import watcher from "./watcher"
import account from "./account"
import transactions from "./transactions"

const rootReducer = combineReducers({ account, web3, market, transactions, watcher })

export default rootReducer