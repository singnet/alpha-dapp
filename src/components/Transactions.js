import React from 'react';
import Table from 'antd/lib/table';
import Alert from 'antd/lib/alert';
import Card from 'antd/lib/card';
import Icon from 'antd/lib/icon';
import Row from 'antd/lib/row';
import Button from 'antd/lib/button';
import Divider from 'antd/lib/divider';
import Tag from 'antd/lib/tag';
import { flatten, isEmpty } from 'lodash';

// REFACTOR move these out with next code refactor
// need it for DELETE ALL transactions
import store, { persistor } from '../store';
import { resetTransactions } from '../actions/transactions';

const columns = [
	{
		title: 'Prediction ',
		dataIndex: 'prediction',
		key: 'prediction',
	},
	{
		title: 'Confidence',
		dataIndex: 'confidence',
		key: 'confidence',
	},
];

const Transactions = ({ data }) => {
	const formattedData =
		Array.isArray(data) &&
		data.map(entry => ({
			...entry,
			result: Array.isArray(entry.result) ? flatten(
				entry.result.map(
					({ predictions, confidences }) =>
						Array.isArray(predictions) &&
						Array.isArray(confidences) &&
						predictions.length !== 0 &&
						predictions.map((prediction, index) => ({
							prediction: prediction.reduce(
								(accumulator, value) => `${value} ${accumulator} `,
								''
							),
							confidence: confidences[index].reduce(
								(accumulator, value) => `${value} ${accumulator}`,
								''
							),
						}))
				)
			) : [],
		}));
	return (
		<Card
			title={
				<React.Fragment>
					<Icon type="table" />
					<Divider type="vertical" />Transactions
				</React.Fragment>
			}
			extra={
				!isEmpty(formattedData) && (
					//NOTICE purge() is ok only cause only thing persisted are transactions
					<Button
						size="small"
						type="danger"
						ghost
						onClick={() =>
							persistor.purge().then(() => store.dispatch(resetTransactions()))
						}
					>
						Delete all
					</Button>
				)
			}
		>
			{!isEmpty(formattedData) ? (
				formattedData.map(({ from, to, result }, index) => (
					<Card
						key={index}
						type="inner"
						title={`#${index}`}
						style={index > 0 ? { marginTop: '30px' } : { marginTop: '0px' }}
					>
						<Row style={{ margin: '18px' }}>
							<Tag>From</Tag> <Divider type="vetical" /> <Tag>{from}</Tag>
						</Row>
						<Row style={{ margin: '18px' }}>
							<Tag>To</Tag> <Divider type="vetical" /> <Tag>{to}</Tag>
						</Row>
						<Divider />
						<Table columns={columns} pagination={false} dataSource={result} />
					</Card>
				))
			) : (
				<Alert message="No transactions found" type="info" showIcon />
			)}
		</Card>
	);
};

export default Transactions;
