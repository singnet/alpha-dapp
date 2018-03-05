export const actionTypes = {
  setMarketJob: "MARKET/SET_JOB",
  setMarketJobError: "MARKET/SET_ERROR"
}

export const setMarketJob = payload => ({ type: actionTypes.setMarketJob, payload })
export const setMarketJobError = payload => ({ type: actionTypes.setMarketJobError, payload })