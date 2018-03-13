// store
import store from '../store';
// config
import { tokenAbi, tokenAddress, escrowAbi, escrowBytecode } from '../config';
// actions
import { setNetworkId, setError } from '../actions/web3';
import { updateTransactions } from '../actions/transactions';
import { startWatching, stopWatching } from '../actions/watcher';
import {
	startWatchingAnalysis,
	stopWatchingAnalysis,
} from '../actions/analysisWatcher';
import {
	setMarketJob,
	setMarketJobError,
	updateMarketJobAmount,
} from '../actions/market';
import {
	changeAccount,
	setAccountError,
	setTokenBalance,
	setTokenBalanceError,
} from '../actions/account';
// utils
import { normalizeFile, performJob } from '../utils';

const { web3 } = window;
const tokenContract = web3 && web3.eth.contract(tokenAbi).at(tokenAddress);

let marketJobContract, netInterval, accountInterval, tokenBalanceInterval;

export const watchAccount = () => {
	accountInterval = setInterval(() => {
		const address = window.web3.eth.accounts[0];
		if (address) {
			if (address !== store.getState().account.address) {
				web3.eth.getBalance(
					address,
					(err, res) =>
						res !== null &&
						store.dispatch(
							changeAccount({ address, balance: Number(res.toString()) })
						)
				);
			}
		} else {
			if (!store.getState().account.error) {
				store.dispatch(setAccountError('Unlock metamask'));
			}
		}
	}, 500);
};

export const watchNetwork = () => {
	netInterval = setInterval(
		() =>
			web3.version.getNetwork((err, netId) => {
				if (!err) {
					if (netId !== store.getState().web3.networkId) {
						store.dispatch(setNetworkId(netId));
					}
				} else {
					store.dispatch(setError(err));
				}
			}),
		500
	);
};

export const watchTokenBalance = () => {
	tokenBalanceInterval = setInterval(() => {
		const { address } = store.getState().account;

		if (address) {
			tokenContract.balanceOf(address, (err, res) => {
				if (!err) {
					const balance = Number(res.toString());
					if (balance !== store.getState().account.tokenBalance) {
						store.dispatch(setTokenBalance(balance));
					}
				} else {
					store.dispatch(setTokenBalanceError(err));
				}
			});
		}
	}, 500);
};

const watchEscrowBalance = () => {
	setInterval(() => {
		const { info } = store.getState().market;

		if (info) {
			tokenContract.balanceOf(info.address, (err, res) => {
				if (!err) {
					const balance = Number(res.toString());
					if (balance !== info.balance) {
						store.dispatch(updateMarketJobAmount(balance));
					}
				}
			});
		}
	}, 500);
};

export const createEscrow = (payer, payee, amount) => {
	const instance = web3.eth.contract(escrowAbi);

	instance.new(
		tokenAddress, // token
		payer, //payer
		payee, // payee
		30000, //timelock
		payer, //validator
		0, //reward
		{
			from: payer,
			data: escrowBytecode,
			gas: 1500000,
		},
		(err, res) => {
			if (err) {
				store.dispatch(setMarketJobError(err));
				store.dispatch(stopWatching());
			} else {
				if (res && res.transactionHash && res.address) {
					store.dispatch(
						setMarketJob({
							payer,
							payee,
							amount,
							balance: 0,
							agent: payee,
							address: res.address,
						})
					);

					marketJobContract = instance.at(res.address);
					store.dispatch(stopWatching());
				} else {
					store.dispatch(startWatching());
				}
			}
		}
	);
};

export const tokenApprove = (address, amount, callback) => {
	tokenContract.approve(address, amount, (err, txHash) => {
		if (err) {
			callback(err, null);
		} else {
			watchTransaction(txHash, (err, res) => {
				if (err) {
					callback(err);
				} else {
					callback(null, res);
				}
			});
		}
	});
};

export const depositAndAnalyze = (payer, amount, file, callback) => {
	marketJobContract.deposit(amount, '0x01', (err, txHash) => {
		if (err) {
			callback(err, null);
		} else {
			watchEscrowBalance();
			watchTransaction(txHash, (err, res) => {
				if (err) {
					callback(err, null);
				} else {
					handleAnalysis(file, (err, result) => {
						if (err) {
							callback(err, null);
						} else {
							store.dispatch(
								updateTransactions([
									{
										result,
										to: marketJobContract.address,
										from: payer,
									},
								])
							);
							callback(null, result);
						}
					});
				}
			});
		}
	});
};

const handleAnalysis = ({ payload, type, name }, callback) => {
	store.dispatch(startWatchingAnalysis());
	normalizeFile(name, payload)
		.then(blob => performJob(blob.payload, type))
		.then(
			({ data: { result } }) =>
				store.dispatch(stopWatchingAnalysis()) && callback(null, result)
		)
		.catch(
			({ response: { data: { error } } }) =>
				store.dispatch(stopWatchingAnalysis()) && callback(error, null)
		);
};

export const watchTransaction = (hash, callback) => {
	store.dispatch(startWatching());
	const interval = setInterval(
		() =>
			web3.eth.getTransactionReceipt(hash, (err, res) => {
				if (!err) {
					if (res) {
						if (Number(res.status)) {
							web3.eth.getTransaction(hash, (err, transaction) => {
								if (!err){
									if (res.gasUsed === transaction.gas) {
										callback('Code execution failed', null)
									} else {
										callback(null, res);
									}
								} else {
									callback('Something went wrong while recovering your transaction', null);
								};
								store.dispatch(stopWatching());
							});
						} else {
							callback('Transaction failed with status 0', null);
							store.dispatch(stopWatching());
						}
						clearInterval(interval);
					}
				} else {
					callback(err, null);
					clearInterval(interval);
					store.dispatch(stopWatching());
				}
			}),
		500
	);
};

export const stopWatchingNetwork = () => clearInterval(netInterval);
export const stopWatchingAccount = () => clearInterval(accountInterval);
export const stopWatchingTokenBalance = () =>
	clearInterval(tokenBalanceInterval);
