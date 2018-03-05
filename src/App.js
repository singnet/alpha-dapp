import React from 'react';
import { Provider } from 'react-redux';
// store
import store from './store';
// containers
import Root from './containers/Root';
import Metamask from './components/Metamask';
import Web3Provider from './containers/Web3Provider';

const App = () => (
	<Provider store={store}>
		<Web3Provider unavailableScreen={<Metamask />}>
			<Root />
		</Web3Provider>
	</Provider>
);

export default App;
