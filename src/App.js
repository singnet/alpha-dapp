import React from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
// store
import store, { persistor } from './store';
// containers
import Root from './containers/Root';
import Metamask from './components/Metamask';
import Web3Provider from './containers/Web3Provider';

const App = () => (
	<Provider store={store}>
		<PersistGate loading={null} persistor={persistor}>
			<Web3Provider unavailableScreen={<Metamask />}>
				<Root />
			</Web3Provider>
		</PersistGate>
	</Provider>
);

export default App;
