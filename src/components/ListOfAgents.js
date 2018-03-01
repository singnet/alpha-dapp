import React from 'react';
import Table from 'antd/lib/table';
import Button from 'antd/lib/button';

const columns = [
	{
		title: 'Agent',
		dataIndex: 'name',
		key: 'name',
	},
	{
		title: 'Service',
		dataIndex: 'service',
		key: 'service',
	},
	{
		title: 'Price per Unit (COGS)',
		dataIndex: 'price',
		key: 'price',
	},
	{
		title: 'Available',
		dataIndex: 'available',
		key: 'available',
	},
];

const ListOfAgents = ({ agents, onHire }) => {
	/*REFACTOR not clean */
	columns[3]['render'] = (available, record, index) =>
		available ? (
			<Button type="primary" onClick={() => onHire(record)}>
				HIRE
			</Button>
		) : (
			<Button type="danger" disabled>
				OFF
			</Button>
		);
	return (
		Array.isArray(agents) && (
			<Table columns={columns} dataSource={agents} pagination={false} />
		)
	);
};

export default ListOfAgents;
