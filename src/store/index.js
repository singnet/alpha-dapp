import thunk from "redux-thunk"
import { createStore, applyMiddleware } from "redux"
import { composeWithDevTools } from "remote-redux-devtools"
// reducer
import rootReducer from "../reducers"

const store = process.env.NODE_ENV === "development"
  ? createStore(rootReducer, undefined, composeWithDevTools({ realtime: true, port: 8005 })(applyMiddleware(thunk)))
  : createStore(rootReducer, applyMiddleware(thunk))

export default store