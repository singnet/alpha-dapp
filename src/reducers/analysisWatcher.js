import { actionTypes } from '../actions/analysisWatcher';

const analysisWatcher = (state = false, action) => {
	switch (action.type) {
		case actionTypes.startWatchingAnalysis:
			return true;
		case actionTypes.stopWatchingAnalysis:
			return false;
		default:
			return state;
	}
};

export default analysisWatcher;
