export const actionTypes = {
  resetTransactions: "RESET_TRANSACTIONS",
  updateTransactions: "UPDATE_TRANSACTIONS"
}

export const resetTransactions = () => ({ type: actionTypes.resetTransactions })
export const updateTransactions = payload => ({ type: actionTypes.updateTransactions, payload })