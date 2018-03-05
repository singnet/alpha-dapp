// store
import store from "../store"
// config
import {
  tokenAbi,
  tokenAddress,
  marketJobAbi,
  marketJobBytecode
} from "../config"
// actions
import { setNetworkId, setError } from "../actions/web3"
import { updateTransactions } from "../actions/transactions"
import { startWatching, stopWatching } from "../actions/watcher"
import { setMarketJob, setMarketJobError } from "../actions/market"
import { changeAccount, setAccountError, setTokenBalance, setTokenBalanceError } from "../actions/account"
// utils
import { normalizeFile, performJob } from "../utils"

const { web3 } = window
const tokenContract = web3.eth.contract(tokenAbi).at(tokenAddress)

let marketJobContract, accountInterval, netInterval, tokenBalanceInterval

export const watchAccount = () => {
  accountInterval = setInterval(
    () => {
      const address = window.web3.eth.accounts[0]
      if (address) {
        if (address !== store.getState().account.address) {
          web3.eth.getBalance(address, (err, res) => res !== null &&
            store.dispatch(changeAccount({ address, balance: Number(res.toString()) })))
        }
      } else {
        if (!store.getState().account.error) {
          store.dispatch(setAccountError("Unlock metamask"))
        }
      }
    },
    500
  )
}

export const watchNetwork = () => {
  netInterval = setInterval(
    () => web3.version.getNetwork((err, netId) => {
      if (!err) {
        if (netId !== store.getState().web3.networkId) {
          store.dispatch(setNetworkId(netId))
        }
      } else {
        store.dispatch(setError(err))
      }
    }),
    500
  )
}

export const watchTokenBalance = () => {
  tokenBalanceInterval = setInterval(
    () => {
      const { address } = store.getState().account

      if (address) {
        tokenContract.balanceOf(address, (err, res) => {
          if (!err) {
            const balance = Number(res.toString())
            if (balance !== store.getState().account.tokenBalance) {
              store.dispatch(setTokenBalance(balance))
            }
          } else {
            store.dispatch(setTokenBalanceError(err))
          }
        })
      }
    },
    500
  )
}

export const createMarketJob = (payer, amount) => {
  const instance = web3.eth.contract(marketJobAbi)

  instance.new(
    [payer], // agents
    [amount], //amounts
    [101], // services id
    tokenAddress, //token address
    payer, // payer address
    web3.fromAscii("0x0"), // first bytes packet
    {
      from: payer,
      data: marketJobBytecode,
      gas: 1200000
    },
    (err, res) => {
      if (err) {
        store.dispatch(setMarketJobError(err))
        store.dispatch(stopWatching())
      }
      else {
        if (res && res.transactionHash && res.address) {
          store.dispatch(setMarketJob({
            payer, amount,
            agent: payer,
            address: res.address,
            jobDesc: web3.fromAscii("0x0"),
          }))

          marketJobContract = instance.at(res.address)
          store.dispatch(stopWatching())
        } else {
          store.dispatch(startWatching())
        }
      }
    }
  )
}

export const tokenApprove = (address, amount, callback) => {
  tokenContract.approve(address, amount, (err, txHash) => {
    if (err) { callback(err, null) }
    else {
      console.log(txHash)
      watchTransaction(txHash, (err, res) => {
        if (err) { callback(err) }
        else { callback(null, res) }
      })
    }
  })
}

export const depositAndAnalyze = (address, amount, file, callback) => {
  marketJobContract.deposit(amount, (err, txHash) => {
    if (err) { callback(err, null) }
    else {
      watchTransaction(txHash, (err, res) => {
        if (err) { callback(err, null) }
        else {
          handleAnalysis(file, (err, result) => {
            if (err) { callback(err, null) }
            else {
              store.dispatch(updateTransactions([{
                result,
                to: address,
                from: marketJobContract.address
              }]))
              callback(null, result)
            }
          })
        }
      })
    }
  })
}

const handleAnalysis = ({ payload, type, name }, callback) => {
  normalizeFile(name, payload)
    .then(blob => performJob(blob.payload, type))
    .then(({ data: { result } }) => callback(null, result))
    .catch(({ response: { data: { error }}}) => callback(error, null))
}

export const watchTransaction = (hash, callback) => {
  store.dispatch(startWatching())

  const interval = setInterval(
    () => web3.eth.getTransactionReceipt(hash, (err, res) => {
      if (!err) {
        if (res) {
          if (Number(res.status)) {
            callback(null, res)
          } else {
            callback("Transaction failed with status 0", null)
          }
          store.dispatch(stopWatching())
          clearInterval(interval)
        }
      } else {
        callback(err, null)
        clearInterval(interval)
        store.dispatch(stopWatching())
      }
    }),
    500
  )
}

export const stopWatchingNetwork = () => clearInterval(netInterval)
export const stopWatchingAccount = () => clearInterval(accountInterval)
export const stopWatchingTokenBalance = () => clearInterval(tokenBalanceInterval)