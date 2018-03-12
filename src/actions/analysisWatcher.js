export const actionTypes = {
	stopWatchingAnalysis: 'WATCHER/STOP_WATCHING_ANALYSIS',
	startWatchingAnalysis: 'WATCHER/START_WATCHING_ANALYSIS',
};

export const stopWatchingAnalysis = () => ({
	type: actionTypes.stopWatchingAnalysis,
});
export const startWatchingAnalysis = () => ({
	type: actionTypes.startWatchingAnalysis,
});
