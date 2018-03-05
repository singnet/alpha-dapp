import { combineReducers } from 'redux'
import { actionTypes } from '../actions/account'

const address = (state = null, action) => {
  switch (action.type) {
    case actionTypes.changeAccount:
      return action.payload.address
    case actionTypes.setAccountError:
      return null
    default:
      return state
  }
}

const balance = (state = null, action) => {
  switch (action.type) {
    case actionTypes.changeAccount:
      return action.payload.balance
    case actionTypes.setAccountError:
      return null
    default:
      return state
  }
}

const error = (state = null, action) => {
  switch (action.type) {
    case actionTypes.setAccountError:
      return action.payload
    case actionTypes.changeAccount:
      return null
    default:
      return state
  }
}

const tokenBalance = (state = null, action) => {
  switch (action.type) {
    case actionTypes.setTokenBalance:
      return action.payload
    case actionTypes.setTokenBalanceError:
      return null
    default:
      return state
  }
}

const tokenBalanceError = (state = null, action) => {
  switch (action.type) {
    case actionTypes.setTokenBalanceError:
      return action.payload
    case actionTypes.setTokenBalance:
      return null
    default:
      return state
  }
}

const account = combineReducers({ address, balance, error, tokenBalance, tokenBalanceError })

export default account