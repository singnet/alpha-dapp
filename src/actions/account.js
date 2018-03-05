export const changeAccount = payload => ({ type: actionTypes.changeAccount, payload })
export const setAccountError = payload => ({ type: actionTypes.setAccountError, payload })
export const setTokenBalance = payload => ({ type: actionTypes.setTokenBalance, payload })
export const setTokenBalanceError = payload => ({ type: actionTypes.setTokenBalanceError, payload })

export const actionTypes = {
  changeAccount: "CHANGE_ACCOUNT",
  setAccountError: "ACCOUNT_ERROR",
  setTokenBalance: "SET_TOKEN_BALANCE",
  setTokenBalanceError: "SET_TOKEN_BALANCE_ERROR"
}