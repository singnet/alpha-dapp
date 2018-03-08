import React from 'react';
import QRCode from 'qrcode.react';
import Card from 'antd/lib/card';
import Icon from 'antd/lib/icon';
import Divider from 'antd/lib/divider';
import Button from 'antd/lib/button';
import Row from 'antd/lib/row';
import Col from 'antd/lib/col';
import Tag from 'antd/lib/tag';

const Info = ({
	url,
	account,
	contractAddress,
	accountBalance,
	escrowBalance,
}) => (
	<Row>
		<Col span={11}>
			<Card
				title={
					<React.Fragment>
						<Icon type="user" />
						<Divider type="vertical" />Account
					</React.Fragment>
				}
				extra={
					<Button
						size="small"
						type="primary"
						href="https://vulpemventures.github.io/faucet-erc20/"
						target="_blank"
					>
						Get Kovan AGI
					</Button>
				}
				style={{ height: '380px' }}
			>
				<Row>
					<p>
						Balance
						<Divider type="vertical" />
						<Tag>
							{(Number(accountBalance) / 100000000).toString() || '0'} AGI
						</Tag>
					</p>
					<p>
						Address
						<Divider type="vertical" />
						<Tag>{account}</Tag>
					</p>
					<Divider />
					<QRCode value={account} />
				</Row>
			</Card>
		</Col>
		{contractAddress && (
			<Col span={11} offset={2}>
				<Card
					title={
						<React.Fragment>
							<Icon type="user" />
							<Divider type="vertical" />Escrow
						</React.Fragment>
					}
					style={{ height: '380px' }}
				>
					<Row>
						<p>
							Balance
							<Divider type="vertical" />
							<Tag>
								{(Number(escrowBalance) / 100000000).toString() || '0'} AGI
							</Tag>
						</p>
						<p>
							Address
							<Divider type="vertical" />
							<Tag>
								{/* REFACTOR use button */}
								<a target="_blank" href={url}>
									{contractAddress}
								</a>
							</Tag>
						</p>
						<Divider />
						<QRCode value={contractAddress} />
					</Row>
				</Card>
			</Col>
		)}
	</Row>
);

export default Info;
