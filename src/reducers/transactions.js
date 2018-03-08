import { actionTypes } from "../actions/transactions"

const transactions = (state = [], action) => {
  switch (action.type) {
    case actionTypes.updateTransactions:
      return state.concat(action.payload)
    case actionTypes.resetTransactions:
      return []
    default:
      return state
  }
}

export default transactions