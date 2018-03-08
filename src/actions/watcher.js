export const actionTypes = {
  stopWatching: "WATCHER/STOP_WATCHING",
  startWatching: "WATCHER/START_WATCHING"
}

export const stopWatching = () => ({ type: actionTypes.stopWatching })
export const startWatching = () => ({ type: actionTypes.startWatching })