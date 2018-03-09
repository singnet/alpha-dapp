import React from 'react';
import QRCode from 'qrcode.react';
import Card from 'antd/lib/card';
import Icon from 'antd/lib/icon';
import Divider from 'antd/lib/divider';
import Button from 'antd/lib/button';
import Row from 'antd/lib/row';
import Col from 'antd/lib/col';
import Tag from 'antd/lib/tag';

import { CopyToClipboard } from 'react-copy-to-clipboard';

// config
import { network } from '../config';

const Info = ({
	url,
	account,
	contractAddress,
	accountBalance,
	escrowBalance,
}) => (
	<React.Fragment>
		<Row>
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
			>
				<Row>
					<Col span={19}>
						<p>
							Balance
							<Divider type="vertical" />
							<Tag>
								{(Number(accountBalance) / 100000000).toString() || '0'} AGI
							</Tag>
							<Divider type="vertical" />
							<CopyToClipboard text={Number(accountBalance) / 100000000}>
								<a>
									<Icon type="copy" />
								</a>
							</CopyToClipboard>
						</p>
						<p>
							Address
							<Divider type="vertical" />
							<Tag>
								<a
									target="_blank"
									href={
										network &&
										account &&
										`https://${network}.etherscan.io/address/${account}`
									}
								>
									{account}
								</a>
							</Tag>
							<Divider type="vertical" />
							<CopyToClipboard text={account}>
								<a>
									<Icon type="copy" />
								</a>
							</CopyToClipboard>
						</p>
					</Col>
					<Col span={5}>
						<QRCode value={account} />
					</Col>
				</Row>
			</Card>
		</Row>
		{contractAddress && (
			<Row style={{ marginTop: 40 }}>
				<Card
					title={
						<React.Fragment>
							<Icon type="user" />
							<Divider type="vertical" />Escrow
						</React.Fragment>
					}
				>
					<Row>
						<Col span={19}>
							<p>
								Balance
								<Divider type="vertical" />
								<Tag>
									{(Number(escrowBalance) / 100000000).toString() || '0'} AGI
								</Tag>
								<Divider type="vertical" />
								<CopyToClipboard text={Number(escrowBalance) / 100000000}>
									<a>
										<Icon type="copy" />
									</a>
								</CopyToClipboard>
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
								<Divider type="vertical" />
								<CopyToClipboard text={contractAddress}>
									<a>
										<Icon type="copy" />
									</a>
								</CopyToClipboard>
							</p>
						</Col>
						<Col span={5}>
							<QRCode value={contractAddress} />
						</Col>
					</Row>
				</Card>
			</Row>
		)}
	</React.Fragment>
);

export default Info;
