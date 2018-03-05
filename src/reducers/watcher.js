import { actionTypes } from "../actions/watcher"

const watcher = (state = false, action) => {
  switch (action.type) {
    case actionTypes.startWatching:
      return true
    case actionTypes.stopWatching:
      return false
    default:
      return state
  }
}

export default watcher