import { combineReducers } from "redux"
import { actionTypes } from "../actions/market"

const info = (state = null, action) => {
  switch (action.type) {
    case actionTypes.setMarketJob:
      return action.payload
    case actionTypes.setMarketJobError:
      return null
    default:
      return state
  }
}

const error = (state = null, action) => {
  switch (action.type) {
    case actionTypes.setMarketJobError: 
      return action.payload
    case actionTypes.setMarketJob:
      return null
    default:
      return state
  }
}

export default combineReducers({ info, error })