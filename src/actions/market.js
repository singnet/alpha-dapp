export const actionTypes = {
  setMarketJob: "MARKET/SET_JOB",
  setMarketJobError: "MARKET/SET_ERROR",
  updateMarketJobAmount: "MARKET/UPDATE_AMOUNT"
}

export const setMarketJob = payload => ({ type: actionTypes.setMarketJob, payload })
export const setMarketJobError = payload => ({ type: actionTypes.setMarketJobError, payload })
export const updateMarketJobAmount = payload => ({ type: actionTypes.updateMarketJobAmount, payload })