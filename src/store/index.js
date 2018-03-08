import thunk from 'redux-thunk';
import { createStore, applyMiddleware } from 'redux';
import { persistStore, persistReducer } from 'redux-persist';
import { composeWithDevTools } from 'remote-redux-devtools';
import storage from 'redux-persist/lib/storage';

// reducer
import rootReducer from '../reducers';

const persistConfig = {
	key: 'alpha-ui-transactions',
	storage,
	whitelist: ['transactions'],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store =
	process.env.NODE_ENV === 'development'
		? createStore(
				persistedReducer,
				undefined,
				composeWithDevTools({ realtime: true, port: 8005 })(
					applyMiddleware(thunk)
				)
			)
		: createStore(persistedReducer, applyMiddleware(thunk));

const persistor = persistStore(store);

export { persistor };
export default store;
