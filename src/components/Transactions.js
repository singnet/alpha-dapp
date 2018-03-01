import React from 'react';
import Table from 'antd/lib/table';
import Alert from 'antd/lib/alert';
import Card from 'antd/lib/card';
import Row from 'antd/lib/card';
import Divider from 'antd/lib/divider';
import Tag from 'antd/lib/tag';
import { flatten, isEmpty } from 'lodash';

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
			result: flatten(
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
			),
		}));
	return !isEmpty(formattedData) ? (
		formattedData.map(({ from, to, result }, index) => (
			<Card key={index} type="inner" title={`#${index}`}>
				<Row style={{ border: 0 }}>
					<Tag>From</Tag> <Divider type="vetical" /> <Tag>{from}</Tag>
				</Row>
				<Row style={{ border: 0 }}>
					<Tag>To</Tag> <Divider type="vetical" /> <Tag>{to}</Tag>
				</Row>
				<Divider />
				<Table columns={columns} pagination={false} dataSource={result} />
			</Card>
		))
	) : (
		<Alert message="No transactions found" type="info" showIcon />
	);
};

export default Transactions;
