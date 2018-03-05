import { connect } from 'react-redux';
import React, { Component } from 'react';

// antd
import Row from 'antd/lib/row';
import Col from 'antd/lib/col';
import Icon from 'antd/lib/icon';
import Card from 'antd/lib/card';
import Divider from 'antd/lib/divider';
import Layout, { Header, Content, Footer } from 'antd/lib/layout';
import Spin from 'antd/lib/spin';
import Alert from 'antd/lib/alert';

// components
import {
	Metamask,
	Info,
	ListOfAgents,
	DropZone,
	Transactions,
} from '../components';

// helpers
import {
	watchAccount,
	tokenApprove,
	createMarketJob,
	depositAndAnalyze,
	watchTokenBalance,
	stopWatchingAccount,
	stopWatchingTokenBalance,
} from '../helpers';
// assets
import logo from '../assets/logo/logo.svg';
import agentsJson from '../agents.json';

const milliseconds = 10 ** 3;

class Root extends Component {
	state = {
		file: false,
		buttonVisible: false,
		dropZoneVisible: true,
	};

	componentDidMount() {
		watchAccount();
		watchTokenBalance();
	}

	componentWillUnmount() {
		stopWatchingAccount();
		stopWatchingTokenBalance();
	}

	getFile = () => {
		const { file } = this.state;

		return file && [file];
	};

	setFile = ({ name, preview, type }) => {
		const { address, amount } = this.props.market.info;

		tokenApprove(address, amount * milliseconds, (err, res) => {
			if (err) {
				return;
			}

			this.setState({
				buttonVisible: true,
				file: {
					name,
					type,
					payload: preview,
				},
			});
		});
	};

	deposit = () => {
		const { address, amount } = this.props.market.info;

		depositAndAnalyze(
			address,
			amount * milliseconds,
			this.state.file,
			(err, res) => {
				if (err) {
					alert('Something went wrong! ' + JSON.stringify(err));
				} else {
					this.setState({ buttonVisible: false, dropZoneVisible: false });
				}
			}
		);
	};

	newJob = agent => createMarketJob(this.props.account.address, agent.amount);

	render() {
		const { file, buttonVisible, dropZoneVisible } = this.state;
		const {
			account,
			isKovanNetwork,
			market,
			transactions,
			waitingForTransaction,
		} = this.props;

		if (!account.address || !isKovanNetwork) return <Metamask />;
		const url =
			market.info && 'http://kovan.etherscan.io/address/' + market.info.address;
		return (
			<Layout style={{ minHeight: '100vh' }}>
				<Header style={{ background: 'rgb(35, 13, 58)' }}>
					<div className="logo">
						<img src={logo} alt="SingularityNET" />
					</div>
				</Header>
				<Content>
					<Row type="flex" justify="center">
						<Col span={15} style={{ marginTop: '40px' }}>
							<Info
								url={url}
								account={account.address}
								contractAddress={market.info && market.info.address}
								accountBalance={account.tokenBalance}
								escrowBalance={0}
							/>
							<Divider />
							<Card
								title={
									<React.Fragment>
										<Icon type="table" />
										<Divider type="vertical" />Transactions
									</React.Fragment>
								}
							>
								<Transactions data={transactions} />
							</Card>
							<Divider />
							<Card
								title={
									<React.Fragment>
										<Icon type="appstore-o" />
										<Divider type="vertical" />Buy
									</React.Fragment>
								}
							>
								{/* Phase 1*/}
								{waitingForTransaction && (
									<React.Fragment>
										<Spin>
											<Alert
												message="Waiting a mined block to include your contract"
												type="info"
											/>
										</Spin>
										<Divider />
									</React.Fragment>
								)}
								{/* Phase 2*/}
								{market.info &&
									market.info.address && (
										<DropZone
											file={file}
											result={
												transactions.length > 0 &&
												transactions[transactions.length - 1].result
											}
											amount={market.info.amount * milliseconds}
											onPay={this.deposit}
											onDrop={this.setFile}
											buttonVisible={buttonVisible}
											dropZoneVisible={dropZoneVisible}
										/>
									)}
								{!market.info && (
									<ListOfAgents agents={agentsJson} onHire={this.newJob} />
								)}
							</Card>
						</Col>
					</Row>
				</Content>
				<Footer style={{ textAlign: 'center' }}>SingularityNET</Footer>
			</Layout>
		);
	}
}

const mapStateToProps = ({ account, web3, market, transactions, watcher }) => ({
	account,
	market,
	transactions,
	waitingForTransaction: watcher,
	isKovanNetwork: web3.networkId === '42',
});
const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(Root);
