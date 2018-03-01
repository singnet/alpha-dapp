import React from 'react';
import Table from 'antd/lib/table';
import Alert from 'antd/lib/alert';

const columns = [
	{
		title: 'Prediction',
		dataIndex: 'prediction',
		key: 'prediction',
	},
	{
		title: 'Confidence',
		dataIndex: 'confidence',
		key: 'confidence',
	},
];

const Results = ({ result, predictions, confidences }) => {
	/* REFACTOR need divider like a comma or a new line between predictions */
	const dataSource =
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
		}));
	return dataSource ? (
		<Table columns={columns} dataSource={dataSource} pagination={false} />
	) : (
		<Alert message="Something went wrong" type="error" showIcon />
	);
};
export default Results;
