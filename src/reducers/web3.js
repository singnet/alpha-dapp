import { combineReducers } from 'redux'
import { actionTypes } from "../actions/web3"

const injected = (state = null, action) => {
  switch (action.type) {
    case actionTypes.setInjected:
      return action.payload
    default:
      return state
  }
}

const networkId = (state = null, action) => {
  switch (action.type) {
    case actionTypes.setNetworkId:
      return action.payload
    case actionTypes.setError:
      return null
    default:
      return state
  }
}

const error = (state = null, action) => {
  switch (action.type) {
    case actionTypes.setError:
      return action.payload
    case actionTypes.setNetworkId:
      return null
    default:
      return state
  }
}

const web3 = combineReducers({ networkId, error, injected })

export default web3