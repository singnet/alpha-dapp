export const actionTypes = {
  setError: "WEB3/SET_ERROR",
  setInjected: "WEB3/SET_INJECTED",
  setNetworkId: "WEB3/SET_NETWORK_ID"
}

export const setError = payload => ({ type: actionTypes.setError, payload })
export const setInjected = payload => ({ type: actionTypes.setInjected, payload })
export const setNetworkId = payload => ({ type: actionTypes.setNetworkId, payload })